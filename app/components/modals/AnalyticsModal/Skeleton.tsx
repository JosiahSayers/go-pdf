import { Group, Skeleton, Stack } from '@mantine/core';

export default function AnalyticsModalSkeleton() {
  return (
    <Stack>
      <Group position="center" grow>
        <Skeleton height={20} width="45%" />
        <Skeleton height={20} width="45%" />
      </Group>
      <Skeleton height={30} width={100} />
      <Group position="left" spacing="xs">
        <Stack h={250} align="flex-end" justify="space-around">
          <Skeleton height={20} width={20} />
          <Skeleton height={20} width={20} />
          <Skeleton height={20} width={20} />
          <Skeleton height={20} width={20} />
        </Stack>
        <Skeleton height={250} width="90%" />
      </Group>
      <Group position="center" ml={50}>
        <Skeleton height={20} width="20%" />
        <Skeleton height={20} width="20%" />
        <Skeleton height={20} width="20%" />
        <Skeleton height={20} width="20%" />
      </Group>
    </Stack>
  );
}
