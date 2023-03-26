import type { ContextModalProps } from "@mantine/modals";
import {
  Badge,
  Button,
  Group,
  Loader,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import { useFetcher } from "@remix-run/react";
import { useEffect, useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import type { loader } from "~/routes/api/analytics/$id";

export default function AnalyticsModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ fileId: string }>) {
  const fetcher = useFetcher<typeof loader>();
  const data = useMemo(() => {
    const output: Array<{
      date: string;
      qrLoads: number;
      websiteLoads: number;
    }> = [];

    fetcher.data?.events.forEach((event) => {
      const date = new Date(event.createdAt);
      const formattedDate = `${
        date.getMonth() + 1
      }/${date.getDate()}/${date.getFullYear()}`;
      const indexOfDay = output.findIndex((x) => x.date === formattedDate);
      if (indexOfDay === -1) {
        output.push({
          date: formattedDate,
          qrLoads: event.event === "qr_code_view" ? 1 : 0,
          websiteLoads: event.event === "view" ? 1 : 0,
        });
      } else if (event.event === "qr_code_view") {
        output[indexOfDay].qrLoads++;
      } else if (event.event === "view") {
        output[indexOfDay].websiteLoads++;
      }
    });
    return output.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [fetcher.data]);

  useEffect(() => {
    if (fetcher.type === "init") {
      fetcher.load(`/api/analytics/${innerProps.fileId}`);
    }
  }, [fetcher, innerProps]);

  return (
    <>
      {fetcher.state === "loading" && <Loader />}

      {fetcher.state === "idle" && fetcher.data?.events.length === 0 && (
        <Text>
          No one has viewed with PDF yet. Check back later to view updated
          statistics.
        </Text>
      )}

      {fetcher.state === "idle" && !!fetcher.data?.events.length && (
        <>
          <Badge>All-Time QR Code Views: {fetcher.data.totalQrLoads}</Badge>
          <Badge>
            All-Time Website Views: {fetcher.data.totalWebsiteLoads}
          </Badge>

          <Space h="lg" />

          <Stack>
            <Text>Last 10 days:</Text>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                width={500}
                height={300}
                data={data}
                title="Last 10 days"
                margin={{
                  top: 5,
                  left: 0,
                  right: 0,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient id="colorQr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWebsite" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis width={30} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                {/* <Legend /> */}
                <Area
                  type="monotone"
                  dataKey="qrLoads"
                  name="QR Code Loads"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorQr)"
                />
                <Area
                  type="monotone"
                  dataKey="websiteLoads"
                  name="Website Loads"
                  stroke="#82ca9d"
                  fillOpacity={1}
                  fill="url(#colorWebsite)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Stack>
        </>
      )}

      <Button fullWidth mt="md" onClick={() => context.closeModal(id)}>
        Close modal
      </Button>
    </>
  );
}
