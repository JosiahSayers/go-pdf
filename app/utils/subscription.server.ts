import type { File, Subscription } from '@prisma/client';
import { json } from '@remix-run/node';
import { db } from '~/utils/db.server';
import { Uploads } from '~/utils/upload-handler';

export class SubscriptionNotFoundError extends Error {}

interface BaseSubscriptionWithContext {
  subscription: Subscription;
  maxUploadSize: number;
  maxUploadCount: number | null;
}

interface FullSubscriptionWithContext extends BaseSubscriptionWithContext {
  canUpload: CanUploadResponse;
}

interface MinimalSubscriptionWithContext extends BaseSubscriptionWithContext {
  canUpload: null;
}

async function find(userId: string): Promise<MinimalSubscriptionWithContext>;
async function find(
  userId: string,
  files: File[]
): Promise<FullSubscriptionWithContext>;
async function find(userId: string, files?: File[]) {
  try {
    const subscription = await db.subscription.findUnique({
      where: { userId },
    });
    if (!subscription) throw new SubscriptionNotFoundError();
    return {
      subscription,
      maxUploadSize: maxUploadSize(subscription),
      maxUploadCount: maxUploadCount(subscription),
      canUpload: files ? canUpload(subscription, files) : null,
    };
  } catch (e) {
    console.error('Error getting subscription', { userId, error: e });
    throw e;
  }
}

function maxUploadSize(subscription: Subscription) {
  if (subscription.level === 'free') {
    return Uploads.ONE_MB;
  } else if (subscription.level === 'paid') {
    return Uploads.ONE_HUNDRED_MB;
  }
}

interface CanUpload {
  canUpload: true;
  reason?: undefined;
}

interface CanNotUpload {
  canUpload: false;
  reason: string;
}

export type CanUploadResponse = CanUpload | CanNotUpload;

function canUpload(
  subscription: Subscription,
  currentFiles: File[]
): CanUploadResponse {
  const maxUploads = maxUploadCount(subscription);
  const statusIsValid = subscription.status === 'valid';
  const hasRemainingUploads =
    maxUploads === null || currentFiles.length < maxUploads;

  if (!statusIsValid) {
    return {
      canUpload: false,
      reason:
        'Your subscription is currently paused because of a payment issue. Please check out the payments page to rememedy.',
    };
  }

  if (!hasRemainingUploads) {
    return {
      canUpload: false,
      reason:
        'You have reached the maximum allowed number of PDFs for your subscription. You can upgrade your account if you need more.',
    };
  }

  return { canUpload: true };
}

function maxUploadCount(subscription: Subscription) {
  if (subscription.level === 'paid') {
    return null;
  } else {
    // free account
    return 1;
  }
}

async function ensureValidSubscription({
  userId,
}: {
  userId: string;
}): Promise<null>;
async function ensureValidSubscription({
  subscription,
}: {
  subscription: Subscription;
}): Promise<null>;
async function ensureValidSubscription({
  userId,
  subscription,
}: {
  userId?: string;
  subscription?: Subscription;
}): Promise<null> {
  let sub: Subscription;
  if (userId) {
    sub = (await find(userId)).subscription;
  } else if (subscription) {
    sub = subscription;
  } else {
    throw json({ error: 'Unknown error' }, { status: 500 });
  }

  if (sub.level !== 'free' && sub.status === 'payment_issue') {
    throw json(
      { error: 'There was an issue with your most recent payment' },
      { status: 401 }
    );
  } else if (sub.level === 'free') {
    throw json(
      { error: 'Active subscription required to access this content' },
      { status: 401 }
    );
  }
  return null;
}

async function update(subscriptionId: string, data: Partial<Subscription>) {
  return db.subscription.update({ where: { id: subscriptionId }, data });
}

export const Subscriptions = {
  find,
  maxUploadSize,
  canUpload,
  maxUploadCount,
  ensureValidSubscription,
  update,
};
