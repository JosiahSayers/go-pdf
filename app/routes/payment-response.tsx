import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Payments } from '~/utils/payment.server';
import { Session } from '~/utils/session.server';

export async function loader({ request }: LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const sessionToken = params.get('session');
  const status = params.get('status');
  if (!status || !sessionToken) {
    return json({
      error: 'status and session query parameters are required',
    });
  }
  request.headers.set('Cookie', sessionToken);
  const userId = await Session.requireLoggedInUser(request);
  await Payments.processPaymentResponse(userId, status);
  return json({ success: true });
}
