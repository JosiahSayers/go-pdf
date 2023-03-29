import { db } from '~/utils/db.server';

async function userOwnsFile(userId: string, fileId: string) {
  const [user, file] = await db.$transaction([
    db.user.findUnique({ where: { id: userId } }),
    db.file.findUnique({ where: { id: fileId } }),
  ]);

  if (!user || !file || file.userId !== user.id) {
    return { isOwner: false };
  }

  return { user, file, isOwner: true };
}

async function requireUserOwnsFile(userId: string, fileId: string) {
  const userOwnsFileRes = await userOwnsFile(userId, fileId);
  if (!userOwnsFileRes.isOwner) {
    throw new Response('Unauthorized', { status: 403 });
  }
  return userOwnsFileRes;
}

export const Authorization = {
  userOwnsFile,
  requireUserOwnsFile,
};
