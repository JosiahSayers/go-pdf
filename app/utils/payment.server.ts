import Stripe from 'stripe';
import { db } from '~/utils/db.server';
import { DeployInfo } from '~/utils/deploy-info.server';
import { UserNotFoundError } from '~/utils/Errors.server';
import { StripeWebhooks } from '~/utils/stripe-webhooks.server';

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

async function processPaymentResponse(status: string) {
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

  if (!StripeWebhooks.supportedWebhooks.includes(event.type as any)) {
    console.log(`event type: ${event.type} not supported, skipping`);
    return;
  }
  const type = event.type as typeof StripeWebhooks.supportedWebhooks[number];
  console.log(`event type: ${event.type}`);

  await StripeWebhooks.processWebhook(type, event);
}

export const Payments = {
  initiatePayment,
  processPaymentResponse,
  processWebhook,
};
