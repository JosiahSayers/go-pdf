import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { DateTime } from 'luxon';
import { db } from '~/utils/db.server';

export async function loader({ params }: LoaderArgs) {
  const tenDaysAgo = DateTime.utc().plus({ days: -10 });
  const [totalQrLoads, totalWebsiteLoads, events] = await db.$transaction([
    db.fileEvent.count({ where: { fileId: params.id, event: 'qr_code_view' } }),
    db.fileEvent.count({ where: { fileId: params.id, event: 'view' } }),
    db.fileEvent.findMany({
      where: { fileId: params.id, createdAt: { gte: tenDaysAgo.toJSDate() } },
      select: { event: true, createdAt: true },
    }),
  ]);
  return json({ totalQrLoads, totalWebsiteLoads, events });
}
