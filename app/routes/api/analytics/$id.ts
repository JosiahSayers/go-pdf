import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { DateTime } from 'luxon';
import { Authorization } from '~/utils/authorization.server';
import { db } from '~/utils/db.server';
import { Session } from '~/utils/session.server';

export async function loader({ params, request }: LoaderArgs) {
  const userId = await Session.requireLoggedInUser(request);
  await Authorization.requireUserOwnsFile(userId, params.id!);
  const tenDaysAgo = DateTime.utc().plus({ days: -10 });
  const [totalQrLoads, totalWebsiteLoads, events] = await db.$transaction([
    db.fileEvent.count({ where: { fileId: params.id, event: 'qr_code_view' } }),
    db.fileEvent.count({ where: { fileId: params.id, event: 'view' } }),
    db.fileEvent.findMany({
      where: {
        fileId: params.id,
        createdAt: { gte: tenDaysAgo.toJSDate() },
        event: { in: ['qr_code_view', 'view'] },
      },
      select: { event: true, createdAt: true },
    }),
  ]);
  return json({ totalQrLoads, totalWebsiteLoads, events });
}
