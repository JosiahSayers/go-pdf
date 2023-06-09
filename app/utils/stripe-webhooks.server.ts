import { type SubscriptionLevel } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import type Stripe from 'stripe';
import { db } from '~/utils/db.server';
import {
  InvoiceNotFoundError,
  SubscriptionNotFoundError,
  UserNotFoundError,
} from '~/utils/Errors.server';

const supportedWebhooks = [
  'customer.subscription.created',
  'customer.subscription.deleted',
  'customer.subscription.updated',
  'invoice.created',
  'invoice.finalized',
  'invoice.finalization_failed',
  'invoice.paid',
  'invoice.payment_failed',
  'invoice.updated',
] as const;

async function logWebhook(event: Stripe.Event) {
  console.log(
    `Processing Stripe Webhook (${event.type}) for ID: ${
      (event.data.object as any).id
    }`
  );
  await db.stripeEventLog.create({ data: { data: JSON.stringify(event) } });
}

async function processWebhook(
  type: typeof supportedWebhooks[number],
  event: Stripe.Event
) {
  await logWebhook(event);

  switch (type) {
    case 'customer.subscription.created':
      return processSubscriptionCreatedEvent(
        event.data.object as Stripe.Subscription
      );
    case 'customer.subscription.updated':
      return processSubscriptionUpdatedEvent(
        event.data.object as Stripe.Subscription
      );
    case 'customer.subscription.deleted':
      return processSubscriptionDeletedEvent(
        event.data.object as Stripe.Subscription
      );
    case 'invoice.created':
      return processInvoiceCreatedEvent(event.data.object as Stripe.Invoice);
    case 'invoice.paid':
      return processInvoicePaidEvent(event.data.object as Stripe.Invoice);
    case 'invoice.finalized':
      return processInvoiceFinalizedEvent(event.data.object as Stripe.Invoice);
    case 'invoice.finalization_failed':
      return processInvoiceFinalizationFailedEvent(
        event.data.object as Stripe.Invoice
      );
    case 'invoice.payment_failed':
      return processInvoicePaymentFailedEvent(
        event.data.object as Stripe.Invoice
      );
    case 'invoice.updated':
      return processInvoiceUpdatedEvent(event.data.object as Stripe.Invoice);
  }
}

async function processSubscriptionCreatedEvent(data: Stripe.Subscription) {
  const user = await db.user.findUnique({
    where: { stripeId: data.customer.toString() },
    include: { subscription: true },
  });
  if (!user) {
    throw new UserNotFoundError();
  }

  const subscriptionData = {
    userId: user.id,
    level: 'paid' as SubscriptionLevel, // TODO: update based on data.items once more levels are created
    stripeId: data.id,
    cancelAtPeriodEnd: data.cancel_at_period_end,
    currentPeriodEnd: new Date(data.current_period_end * 1000),
    currentPeriodStart: new Date(data.current_period_start * 1000),
    stripeStatus: data.status,
  };

  if (user.subscription) {
    console.log(
      `Subscription created for user who already has a subscription object`,
      {
        newSubscriptionId: data.id,
        oldSubscriptionId: user.subscription.id,
        oldSubscriptionStripeId: user.subscription.stripeId,
        userId: user.id,
        userStripeId: user.stripeId,
      }
    );
  }

  await db.subscription.upsert({
    where: {
      stripeId: user.subscription?.stripeId ?? subscriptionData.stripeId,
    },
    update: subscriptionData,
    create: subscriptionData,
  });
}

async function processSubscriptionUpdatedEvent(data: Stripe.Subscription) {
  const user = await db.user.findUnique({
    where: { stripeId: data.customer.toString() },
    include: { subscription: true },
  });
  if (!user) throw new UserNotFoundError(data.customer.toString());
  if (!user.subscription || user.subscription.stripeId !== data.id) {
    throw new SubscriptionNotFoundError(data.id.toString());
  }

  // TODO: update level based on data.items once more levels are created
  await db.subscription.update({
    where: { stripeId: data.id },
    data: {
      cancelAtPeriodEnd: data.cancel_at_period_end,
      currentPeriodEnd: new Date(data.current_period_end * 1000),
      currentPeriodStart: new Date(data.current_period_start * 1000),
      stripeStatus: data.status,
    },
  });
}

async function processSubscriptionDeletedEvent(data: Stripe.Subscription) {
  await db.subscription.delete({ where: { id: data.id } });
}

async function processInvoiceCreatedEvent(data: Stripe.Invoice) {
  const user = await db.user.findUnique({
    where: { stripeId: data.customer?.toString() },
  });
  if (!user) throw new UserNotFoundError(data.customer?.toString());

  await db.invoice.create({
    data: {
      userId: user.id,
      stripeId: data.id,
      hostedUrl: data.hosted_invoice_url,
      pdfUrl: data.invoice_pdf,
      invoiceNumber: data.number,
      billingReason: data.billing_reason,
      status: data.status ?? undefined,
    },
  });
}

async function processInvoicePaidEvent(data: Stripe.Invoice) {
  try {
    await db.invoice.update({
      where: { stripeId: data.id },
      data: {
        stripeId: data.id,
        hostedUrl: data.hosted_invoice_url,
        pdfUrl: data.invoice_pdf,
        invoiceNumber: data.number,
        billingReason: data.billing_reason,
        status: data.status ?? undefined,
      },
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        throw new InvoiceNotFoundError(data.id);
      }
    }
    throw e;
  }
}

async function processInvoiceFinalizedEvent(data: Stripe.Invoice) {
  try {
    await db.invoice.update({
      where: { stripeId: data.id },
      data: {
        status: data.status ?? undefined,
      },
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        throw new InvoiceNotFoundError(data.id);
      }
    }
    throw e;
  }
}

async function processInvoiceFinalizationFailedEvent(data: Stripe.Invoice) {
  try {
    // This event fires when Stripe is not able to properly determine the tax location
    // for a user. This should never fire as we're using stripe checkout page and requiring
    // an address to be entered.
    console.log(`Invoice ID ${data.id} - Finalization Failed`);
    await db.invoice.update({
      where: { stripeId: data.id },
      data: {
        status: data.status ?? undefined,
      },
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        throw new InvoiceNotFoundError(data.id);
      }
    }
    throw e;
  }
}

async function processInvoicePaymentFailedEvent(data: Stripe.Invoice) {
  try {
    // Stripe handles customer contact and payment retires automatically.
    // We log that it happened but don't contact the customer.
    console.log(`Invoice ID ${data.id} - Payment Failed`);
    await db.invoice.update({
      where: { stripeId: data.id },
      data: {
        status: data.status ?? undefined,
      },
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        throw new InvoiceNotFoundError(data.id);
      }
    }
    throw e;
  }
}

async function processInvoiceUpdatedEvent(data: Stripe.Invoice) {
  try {
    await db.invoice.update({
      where: { stripeId: data.id },
      data: {
        status: data.status ?? undefined,
      },
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        throw new InvoiceNotFoundError(data.id);
      }
    }
    throw e;
  }
}

export const StripeWebhooks = {
  supportedWebhooks,
  processWebhook,
};
