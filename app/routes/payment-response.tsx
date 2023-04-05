import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Payments } from '~/utils/payment.server';

export async function loader({ request }: LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const sessionId = params.get('sessionId');
  const status = params.get('status');
  if (!sessionId || !status) {
    return json({
      error: 'sessionId and status query parameters are required',
    });
  }

  await Payments.processPaymentResponse(sessionId, status);
  return json({ success: true });
}
