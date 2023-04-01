import type { LoaderArgs } from '@remix-run/node';
import { db } from '~/utils/db.server';
import { QR } from '~/utils/qr-code.server';
import { Session } from '~/utils/session.server';
import { Subscriptions } from '~/utils/subscription.server';

export async function loader({ request }: LoaderArgs) {
  const userId = await Session.requireLoggedInUser(request);
  await Subscriptions.ensureValidSubscription({ userId });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    return new Response('Missing id search parameter', { status: 403 });
  }

  const file = await db.file.findFirst({ where: { id, userId } });
  if (!file) {
    return new Response('Not Found', { status: 404 });
  }

  const buffer = await QR.createForFile(file.id);
  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': buffer.byteLength.toString(),
    },
  });
}
