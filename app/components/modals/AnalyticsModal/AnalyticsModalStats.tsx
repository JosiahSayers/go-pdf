import { Badge, Group, Stack, Text } from '@mantine/core';
import type { SerializeFrom } from '@remix-run/node';
import type { loader } from '~/routes/api/analytics/$id';

interface Props {
  stats: Pick<
    SerializeFrom<typeof loader>,
    'totalQrLoads' | 'totalWebsiteLoads'
  >;
}

export default function AnalyticsModalStats({ stats }: Props) {
  return (
    <Stack>
      <Text>All Time Views:</Text>
      <Group>
        <Badge>QR Code: {stats.totalQrLoads}</Badge>
        <Badge>Custom URL: {stats.totalWebsiteLoads}</Badge>
      </Group>
    </Stack>
  );
}
