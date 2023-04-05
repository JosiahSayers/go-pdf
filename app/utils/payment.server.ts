import { randomBytes } from 'crypto';
import type { PaymentSessionStatus } from '@prisma/client';
import Stripe from 'stripe';
import { db } from '~/utils/db.server';
import { DeployInfo } from '~/utils/deploy-info.server';
import { Subscriptions } from '~/utils/subscription.server';

if (!process.env.STRIPE_API_KEY) {
  throw new Error('STRIPE_API_KEY not defined');
}

const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2022-11-15',
});

const prices = {
  monthlyBilledSubscription: 'price_1MsFO9LSDKKGf5bYAmpG0chD',
};

async function initiatePayment(userId: string, price: keyof typeof prices) {
  const user = await db.user.findUnique({ where: { id: userId } });
  const paymentSession = await db.paymentSession.create({
    data: {
      userId,
      successValue: randomBytes(50).toString('base64'),
      failureValue: randomBytes(50).toString('base64'),
    },
  });
  const makeParams = (status: string) => {
    const responseParams = new URLSearchParams();
    responseParams.append('sessionId', paymentSession.id);
    responseParams.append('status', status);
    return responseParams.toString();
  };

  return stripe.checkout.sessions.create({
    line_items: [
      {
        price: prices[price],
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${DeployInfo.url}/payment-response?${makeParams(
      paymentSession.successValue
    )}`,
    cancel_url: `${DeployInfo.url}/payment-response?${makeParams(
      paymentSession.failureValue
    )}`,
    automatic_tax: { enabled: true },
    customer_email: user?.email,
    billing_address_collection: 'auto',
  });
}

async function processPaymentResponse(sessionId: string, status: string) {
  const session = await db.paymentSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.status !== 'initiated') {
    throw new Error('Session has already received a response');
  }

  let newStatus: PaymentSessionStatus;

  console.log({ status });
  console.log({
    successValue: session.successValue,
    failureValue: session.failureValue,
  });
  if (status === session.successValue) {
    newStatus = 'successful';
  } else if (status === session.failureValue) {
    newStatus = 'failed';
  } else {
    throw new Error(
      'Status sent does not match up with status values in database'
    );
  }

  await db.paymentSession.update({
    where: { id: sessionId },
    data: {
      status: newStatus,
    },
  });

  if (newStatus === 'successful') {
    const { subscription } = await Subscriptions.find(session.userId);
    await Subscriptions.update(subscription.id, {
      status: 'valid',
      level: 'paid',
    });
  }
}

export const Payments = {
  initiatePayment,
  processPaymentResponse,
};
