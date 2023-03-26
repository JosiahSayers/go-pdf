import { Badge, Group, Space, Stack, Text } from "@mantine/core";
import type { SerializeFrom } from "@remix-run/node";
import AnalyticsModalChart from "~/components/modals/AnalyticsModal/Chart";
import type { loader } from "~/routes/api/analytics/$id";

interface Props {
  events: SerializeFrom<typeof loader>;
}

export default function AnalyticsModalEvents({ events }: Props) {
  return (
    <>
      <Stack>
        <Text>All Time Views:</Text>
        <Group>
          <Badge>QR Code: {events.totalQrLoads}</Badge>
          <Badge>Website: {events.totalWebsiteLoads}</Badge>
        </Group>
      </Stack>

      <Space h="lg" />

      <Stack>
        <Text>Last 10 days:</Text>
        <AnalyticsModalChart events={events.events} />
      </Stack>
    </>
  );
}
