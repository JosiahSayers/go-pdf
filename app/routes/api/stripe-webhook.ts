import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Payments } from '~/utils/payment.server';

export async function action({ request }: ActionArgs) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return json({ err: 'stripe-signature header missing' });
  }

  console.log('webhook');
  Payments.processWebhook(await request.text(), signature);
  return new Response(null, { status: 200 });
}
