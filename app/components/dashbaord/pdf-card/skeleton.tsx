import { Card, Group, Skeleton, Stack } from "@mantine/core";

export default function PdfCardSkeleton() {
  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Group position="apart">
        <Group>
          <Skeleton height={75} width={50} />
          <Stack ml="sm">
            <Skeleton height={15} width={200} />
            <Skeleton height={35} width={300} />
          </Stack>
        </Group>
        <Skeleton height={24} width={24} />
      </Group>
    </Card>
  );
}
