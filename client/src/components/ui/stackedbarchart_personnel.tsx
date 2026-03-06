"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useMemo } from "react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { StaffData } from "@/components/dashboard/StaffCard";

interface ChartProps {
  data: StaffData[];
}

export function ChartBarStacked({ data }: ChartProps) {
  const genderKeys = useMemo(() => {
    return [...new Set(data.map(entry => entry.gender))];
  }, [data]);

  const chartConfig = useMemo(() => {
    return genderKeys.reduce((acc, gender, index) => {
      acc[gender] = { label: gender, color: `var(--chart-${index + 1})` };
      return acc;
    }, {} as ChartConfig);
  }, [genderKeys]);

  const chartData = useMemo(() => {
    return data.reduce((acc, entry) => {
      const existing = acc.find(d => d.department === entry.department);
      if (existing) {
        existing[entry.gender] = (existing[entry.gender] ?? 0) + entry.count;
      } else {
        acc.push({ department: entry.department, [entry.gender]: entry.count });
      }
      return acc;
    }, [] as Record<string, any>[]);
  }, [data]);

  return (
    <ChartContainer config={chartConfig} className="h-full w-full min-h-0">
      <BarChart accessibilityLayer data={chartData} maxBarSize={45}>
        <CartesianGrid vertical={false} />
        <XAxis
        dataKey="department"
        tickLine={false} 
        tickMargin={10} 
        axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <ChartLegend content={<ChartLegendContent />} />
        {genderKeys.map((gender, index) => (
          <Bar
            key={gender}
            dataKey={gender}
            stackId="a"
            fill={`var(--chart-${index + 1})`}
            radius={index === genderKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}