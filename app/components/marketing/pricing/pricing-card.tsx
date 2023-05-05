import { Card, Stack, Title, Divider, Text, Button } from '@mantine/core';
import { filesize } from 'filesize';
import type { SubscriptionInfo } from '~/routes/__marketing/pricing';

interface Props {
  subscription: SubscriptionInfo;
}

export default function PricingCard({
  subscription: { title, price, maxUploadCount, maxUploadSize, isActive },
}: Props) {
  const uploadCountText =
    maxUploadCount === null
      ? 'Unlimited PDFs'
      : `${maxUploadCount} PDF${maxUploadCount > 1 ? 's' : ''}`;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder w="300px">
      <Stack>
        <Title order={3}>{title}</Title>
        <Text weight="bold" size="3rem">
          ${price / 100}
        </Text>
        <Text pb="lg">/ month</Text>

        <Divider />
        <Text>{uploadCountText}</Text>
        <Divider />
        <Text>
          <>Max PDF Size {filesize(maxUploadSize)}</>
        </Text>
        <Divider />

        <Button disabled={isActive}>
          {isActive ? 'Current Subscription' : 'Subscribe'}
        </Button>
      </Stack>
    </Card>
  );
}
