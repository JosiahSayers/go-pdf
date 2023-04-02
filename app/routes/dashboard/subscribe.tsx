import { Button } from '@mantine/core';
import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { Payments } from '~/utils/payment.server';
import { Session } from '~/utils/session.server';

export async function action({ request }: ActionArgs) {
  const userId = await Session.requireLoggedInUser(request);
  const paymentSession = await Payments.initiatePayment(
    userId,
    'monthlyBilledSubscription'
  );

  if (!paymentSession.url) {
    return json({ error: 'Unable to initiate payment session with stripe' });
  }

  return redirect(paymentSession.url);
}

export default function Subscribe() {
  return (
    <Form method="post">
      <Button type="submit">Subscribe</Button>
    </Form>
  );
}
