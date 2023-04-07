import Stripe from 'stripe';
import { db } from '~/utils/db.server';
import { DeployInfo } from '~/utils/deploy-info.server';

if (!process.env.STRIPE_API_KEY) {
  throw new Error('STRIPE_API_KEY not defined');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET not defined');
}

const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2022-11-15',
});

const prices = {
  monthlyBilledSubscription: 'price_1MsFO9LSDKKGf5bYAmpG0chD',
};

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

export class UserNotFoundError extends Error {}
export class SubscriptionNotFoundError extends Error {}
export class InvoiceNotFoundError extends Error {}

async function initiatePayment(userId: string, price: keyof typeof prices) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) {
    throw new UserNotFoundError();
  }

  let customerId = user.stripeId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.profile?.name,
    });
    await db.user.update({
      where: { id: user.id },
      data: { stripeId: customer.id },
    });
    customerId = customer.id;
  }

  return stripe.checkout.sessions.create({
    line_items: [
      {
        price: prices[price],
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${DeployInfo.url}/payment-response?status=success`,
    cancel_url: `${DeployInfo.url}/payment-response?status=cancel`,
    automatic_tax: { enabled: true },
    customer: customerId,
    customer_update: {
      address: 'auto',
    },
    billing_address_collection: 'auto',
  });
}

async function processPaymentResponse(sessionId: string, status: string) {
  // const session = await db.paymentSession.findUnique({
  //   where: { id: sessionId },
  // });

  // if (!session) {
  //   throw new Error('Session not found');
  // }

  // if (session.status !== 'initiated') {
  //   throw new Error('Session has already received a response');
  // }

  // let newStatus: PaymentSessionStatus;

  // console.log({ status });
  // console.log({
  //   successValue: session.successValue,
  //   failureValue: session.failureValue,
  // });
  // if (status === session.successValue) {
  //   newStatus = 'successful';
  // } else if (status === session.failureValue) {
  //   newStatus = 'failed';
  // } else {
  //   throw new Error(
  //     'Status sent does not match up with status values in database'
  //   );
  // }

  // TODO: Check that payment was recorded successfully in the database and query the stripe API if it wasn't
  return;
}

async function processWebhook(payload: any, signatureHeader: string) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signatureHeader,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (e: any) {
    console.error(`Webhook Error: ${e.message}`, payload);
    throw new Error(`Webhook Error: ${e.message}`);
  }

  if (!supportedWebhooks.includes(event.type as any)) {
    console.log(`event type: ${event.type} not supported, skipping`);
    return;
  }
  const type = event.type as typeof supportedWebhooks[number];
  console.log(`event type: ${event.type}`);

  if (type === 'customer.subscription.created') {
    const data = event.data.object as Stripe.Subscription;
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
  } else if (type === 'customer.subscription.updated') {
    const data = event.data.object as Stripe.Subscription;
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
  } else if (type === 'customer.subscription.deleted') {
    const data = event.data.object as Stripe.Subscription;
    await db.subscription.delete({ where: { id: data.id } });
  } else if (type === 'invoice.created') {
    const data = event.data.object as Stripe.Invoice;
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
  } else if (type === 'invoice.paid') {
    const data = event.data.object as Stripe.Invoice;
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
}

export const Payments = {
  initiatePayment,
  processPaymentResponse,
  processWebhook,
};
