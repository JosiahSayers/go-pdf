import { json } from '@remix-run/node';
import { db } from '~/utils/db.server';

const isDbConnected = async () => {
  try {
    return !!(await db.$queryRaw`SELECT 1`);
  } catch (e) {
    console.error(`DB connection error on /health`, e);
    return false;
  }
};

export async function loader() {
  const dbConnected = await isDbConnected();
  const status = dbConnected ? 'ok' : 'error';

  return json(
    {
      currentTime: new Date().getTime(),
      version: process.env.VERCEL_GIT_COMMIT_SHA,
      dbConnected,
      status,
    },
    { status: status === 'ok' ? 200 : 500 }
  );
}
