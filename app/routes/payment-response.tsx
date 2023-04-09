import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Payments } from '~/utils/payment.server';

export async function loader({ request }: LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const status = params.get('status');
  if (!status) {
    return json({
      error: 'status query parameter is required',
    });
  }

  await Payments.processPaymentResponse(status);
  return json({ success: true });
}
