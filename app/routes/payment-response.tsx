import { PaymentSessionStatus } from '@prisma/client';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Payments } from '~/utils/payment.server';

function isPaymentStatus(status: string): status is PaymentSessionStatus {
  return Object.values(PaymentSessionStatus).includes(status as any);
}

export async function loader({ request }: LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const sessionId = params.get('sessionId');
  const status = params.get('status');
  if (!sessionId || !status) {
    return json({
      error: 'sessionId and status query parameters are required',
    });
  }

  if (!isPaymentStatus(status)) {
    return json({
      error: `"${status}" is not a valid status`,
    });
  }

  await Payments.processPaymentResponse(sessionId, status);
  return json({ success: true });
}
