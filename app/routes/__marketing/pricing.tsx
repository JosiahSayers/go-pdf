import { Group, Space, Stack, Title } from '@mantine/core';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import PricingCard from '~/components/marketing/pricing/pricing-card';
import { Session } from '~/utils/session.server';
import { Subscriptions } from '~/utils/subscription.server';
import { Uploads } from '~/utils/upload-handler';

export interface SubscriptionInfo {
  title: string;
  price: number;
  maxUploadSize: number;
  maxUploadCount: number | null;
  isActive: boolean;
  inactiveButtonText: string;
}

export async function loader({ request }: LoaderArgs) {
  const session = await Session.get(request);
  const userId = session.get('userId');
  const { subscription } = userId
    ? await Subscriptions.find(userId)
    : { subscription: null };

  return json({
    subscriptions: {
      free: {
        title: 'Free',
        price: 0,
        maxUploadSize: Uploads.ONE_MB,
        maxUploadCount: 1,
        isActive: subscription?.level === 'free',
        inactiveButtonText: userId ? 'Subscribe' : 'Create an account',
      },
      hobby: {
        title: 'Hobby',
        price: 500,
        maxUploadSize: Uploads.ONE_HUNDRED_MB,
        maxUploadCount: null,
        isActive: subscription?.level === 'paid',
        inactiveButtonText: 'Subscribe',
      },
    },
  });
}

export default function Pricing() {
  const { subscriptions } = useLoaderData<typeof loader>();

  return (
    <Stack>
      <Title order={2} align="center" size={65}>
        Pricing
      </Title>

      <Space h="5rem" />

      <Group position="center" ta="center">
        <PricingCard subscription={subscriptions.free} />
        <PricingCard subscription={subscriptions.hobby} />
      </Group>
    </Stack>
  );
}
