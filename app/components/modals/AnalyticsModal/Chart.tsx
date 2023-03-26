import type { SerializeFrom } from "@remix-run/node";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { loader } from "~/routes/api/analytics/$id";

interface Props {
  events?: SerializeFrom<typeof loader>["events"];
}

export default function AnalyticsModalChart({ events }: Props) {
  const data = useMemo(() => {
    const output: Array<{
      date: string;
      qrLoads: number;
      websiteLoads: number;
    }> = [];

    events?.forEach((event) => {
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
  }, [events]);

  return (
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
  );
}
