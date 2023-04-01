import { Group, Skeleton, Stack } from '@mantine/core';

interface Props {
  animate?: boolean;
}

export default function AnalyticsModalSkeleton({ animate = false }: Props) {
  return (
    <Stack>
      <Group position="center" grow>
        <Skeleton animate={animate} height={20} width="45%" />
        <Skeleton animate={animate} height={20} width="45%" />
      </Group>
      <Skeleton animate={animate} height={30} width={100} />
      <Group position="left" spacing="xs">
        <Stack h={250} align="flex-end" justify="space-around">
          <Skeleton animate={animate} height={20} width={20} />
          <Skeleton animate={animate} height={20} width={20} />
          <Skeleton animate={animate} height={20} width={20} />
          <Skeleton animate={animate} height={20} width={20} />
        </Stack>
        <Skeleton animate={animate} height={250} width="90%" />
      </Group>
      <Group position="center" ml={50}>
        <Skeleton animate={animate} height={20} width="20%" />
        <Skeleton animate={animate} height={20} width="20%" />
        <Skeleton animate={animate} height={20} width="20%" />
        <Skeleton animate={animate} height={20} width="20%" />
      </Group>
    </Stack>
  );
}
