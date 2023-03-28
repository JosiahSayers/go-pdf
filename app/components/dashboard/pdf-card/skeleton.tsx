import { Card, Group, Skeleton, Stack } from '@mantine/core';

export default function PdfCardSkeleton() {
  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Group position="apart">
        <Group>
          <Skeleton height={75} width={50} />
          <Stack ml="sm">
            <Skeleton height={25} width={200} />
            <Skeleton height={20} width={300} />
          </Stack>
        </Group>
        <Stack>
          <Skeleton height={15} width={80} />
          <Skeleton height={15} width={150} />
        </Stack>
        <Skeleton height={24} width={24} />
      </Group>
    </Card>
  );
}
