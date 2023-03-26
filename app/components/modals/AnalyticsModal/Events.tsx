import { Badge, Space, Stack, Text } from "@mantine/core";
import type { SerializeFrom } from "@remix-run/node";
import AnalyticsModalChart from "~/components/modals/AnalyticsModal/Chart";
import type { loader } from "~/routes/api/analytics/$id";

interface Props {
  events: SerializeFrom<typeof loader>;
}

export default function AnalyticsModalEvents({ events }: Props) {
  return (
    <>
      <Badge>All-Time QR Code Views: {events.totalQrLoads}</Badge>
      <Badge>All-Time Website Views: {events.totalWebsiteLoads}</Badge>

      <Space h="lg" />

      <Stack>
        <Text>Last 10 days:</Text>
        <AnalyticsModalChart events={events.events} />
      </Stack>
    </>
  );
}
