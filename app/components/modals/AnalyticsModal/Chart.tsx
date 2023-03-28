import type { SerializeFrom } from '@remix-run/node';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { loader } from '~/routes/api/analytics/$id';

interface Props {
  events?: SerializeFrom<typeof loader>['events'];
}

export default function AnalyticsModalChart({ events }: Props) {
  const lastTenDays = useMemo(() => {
    const today = DateTime.now();
    const output: string[] = [];
    for (let i = 0; i < 10; i++) {
      const date = today.minus({ days: i });
      output.push(date.toLocaleString());
    }
    return output;
  }, []);

  const data = useMemo(() => {
    const output: Array<{
      date: string;
      qrLoads: number;
      websiteLoads: number;
    }> = lastTenDays.map((date) => ({ date, qrLoads: 0, websiteLoads: 0 }));

    events?.forEach((event) => {
      const date = DateTime.fromISO(event.createdAt);
      const indexOfDay = output.findIndex(
        (x) => x.date === date.toLocaleString()
      );
      if (indexOfDay === -1) {
        output.push({
          date: date.toLocaleString(),
          qrLoads: event.event === 'qr_code_view' ? 1 : 0,
          websiteLoads: event.event === 'view' ? 1 : 0,
        });
      } else if (event.event === 'qr_code_view') {
        output[indexOfDay].qrLoads++;
      } else if (event.event === 'view') {
        output[indexOfDay].websiteLoads++;
      }
    });
    return output.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [events, lastTenDays]);

  const yAxisWidth = useMemo(() => {
    let largest = 0;

    data.forEach((date) => {
      if (date.qrLoads > largest) {
        largest = date.qrLoads;
      }

      if (date.websiteLoads > largest) {
        largest = date.websiteLoads;
      }
    });

    const length = largest.toString().length * 12;
    return length < 30 ? 30 : length;
  }, [data]);

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
        <YAxis width={yAxisWidth} />
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
          name="Custom URL Loads"
          stroke="#82ca9d"
          fillOpacity={1}
          fill="url(#colorWebsite)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
