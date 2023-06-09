import { SubscriptionStatus } from '@prisma/client';
import type { File, Subscription, User } from '@prisma/client';
import { json } from '@remix-run/node';
import { db } from '~/utils/db.server';
import { Email } from '~/utils/email.server';
import { Uploads } from '~/utils/upload-handler';

export class SubscriptionNotFoundError extends Error {}

const paymentFailedStatuses: SubscriptionStatus[] = [
  SubscriptionStatus.incomplete,
  SubscriptionStatus.incomplete_expired,
  SubscriptionStatus.past_due,
];

interface BaseSubscriptionWithContext {
  subscription: Subscription | null;
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

function maxUploadSize(subscription: Subscription | null) {
  if (!subscription) {
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
  subscription: Subscription | null,
  currentFiles: File[]
): CanUploadResponse {
  const maxUploads = maxUploadCount(subscription);
  const statusIsValid = !subscription || subscription.stripeStatus === 'active';
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

function maxUploadCount(subscription: Subscription | null) {
  if (subscription?.level === 'paid') {
    return null;
  }
  return 1;
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
  let sub: Subscription | null;
  if (userId) {
    sub = (await find(userId)).subscription;
  } else if (subscription) {
    sub = subscription;
  } else {
    throw json({ error: 'Unknown error' }, { status: 500 });
  }

  if (!sub) {
    throw json(
      { error: 'Active subscription required to access this content' },
      { status: 401 }
    );
  }

  if (
    sub.level !== 'free' &&
    paymentFailedStatuses.includes(sub.stripeStatus)
  ) {
    throw json(
      { error: 'There was an issue with your most recent payment' },
      { status: 401 }
    );
  }
  return null;
}

// TODO: if account is being lowered (paid -> free), loop through files and disable
// any that are no longer valid. Over max size, over max number of uploads, etc.
async function update(
  subscriptionId: string,
  data: Partial<Subscription>,
  user: User
) {
  const subscription = await db.subscription.findFirst({
    where: { id: subscriptionId },
  });

  if (isSubscriptionBeingLowered(subscription, data)) {
    const newMaxUploadCount = maxUploadCount({ ...subscription, ...data });
    await db.$transaction(async (tx) => {
      const stillValidFiles = await tx.file.findMany({
        where: {
          userId: subscription?.userId,
          disabled: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: newMaxUploadCount ?? undefined,
        select: { id: true },
      });

      await tx.file.updateMany({
        where: {
          userId: subscription?.userId,
          id: { notIn: stillValidFiles.map((f) => f.id) },
        },
        data: {
          disabled: true,
          disabledReason: 'lowered_subscription',
        },
      });
    });
    await Email.subscriptionLowered(user);
  }

  return db.subscription.update({ where: { id: subscriptionId }, data });
}

function isSubscriptionBeingLowered(
  subscription: Subscription | null,
  updateData: Partial<Subscription>
  // subscription is defined if it is being lowered
): subscription is Subscription {
  if (subscription?.level === 'paid' && updateData.level === 'free') {
    return true;
  }

  return false;
}

// export interface SubscriptionInfo {
//   title: string;
//   price: number;
//   maxUploadSize: number;
//   maxUploadCount: number | null;
//   isActive: boolean;
// }

// function getAllSubscriptions(): SubscriptionInfo[] {
//   return [
//     [SubscriptionLevel.free]: {
//       title: 'Free',
//       price: 0,
//       maxUploadSize: maxUploadSize()
//     }
//   ];
// }

export const Subscriptions = {
  find,
  maxUploadSize,
  canUpload,
  maxUploadCount,
  ensureValidSubscription,
  update,
  paymentFailedStatuses,
};
