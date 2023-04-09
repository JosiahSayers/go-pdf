import type Stripe from 'stripe';
import { db } from '~/utils/db.server';
import {
  InvoiceNotFoundError,
  SubscriptionNotFoundError,
  UserNotFoundError,
} from '~/utils/Errors.server';

const supportedWebhooks = [
  'customer.updated',
  'customer.subscription.created',
  'customer.subscription.deleted',
  'customer.subscription.updated',
  'invoice.created',
  'invoice.finalized',
  'invoice.finalization_failed',
  'invoice.paid',
  'invoice.payment_action_required',
  'invoice.payment_failed',
  'invoice.updated',
] as const;

async function processWebhook(
  type: typeof supportedWebhooks[number],
  event: Stripe.Event
) {
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
    case 'customer.updated': {
      throw new Error('Not implemented yet: "customer.updated" case');
    }
    case 'invoice.finalized': {
      throw new Error('Not implemented yet: "invoice.finalized" case');
    }
    case 'invoice.finalization_failed': {
      throw new Error(
        'Not implemented yet: "invoice.finalization_failed" case'
      );
    }
    case 'invoice.payment_action_required': {
      throw new Error(
        'Not implemented yet: "invoice.payment_action_required" case'
      );
    }
    case 'invoice.payment_failed': {
      throw new Error('Not implemented yet: "invoice.payment_failed" case');
    }
    case 'invoice.updated': {
      throw new Error('Not implemented yet: "invoice.updated" case');
    }
  }
}

async function processSubscriptionCreatedEvent(data: Stripe.Subscription) {
  const user = await db.user.findUnique({
    where: { stripeId: data.customer.toString() },
  });
  if (!user) {
    throw new UserNotFoundError();
  }

  await db.subscription.create({
    data: {
      userId: user?.id,
      level: 'paid', // TODO: update based on data.items once more levels are created
      stripeId: data.id,
      cancelAtPeriodEnd: data.cancel_at_period_end,
      currentPeriodEnd: new Date(data.current_period_end * 1000),
      currentPeriodStart: new Date(data.current_period_start * 1000),
      stripeStatus: data.status,
    },
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
  const invoice = await db.invoice.findUnique({
    where: { stripeId: data.id },
  });
  if (!invoice) throw new InvoiceNotFoundError(data.id);

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
}

export const StripeWebhooks = {
  supportedWebhooks,
  processWebhook,
};
