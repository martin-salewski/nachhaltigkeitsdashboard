"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export const description = "A stacked bar chart with a legend";

const chartData = [
  {
    month: "Allgemeine Hochschulreife",
    weiblich: 186,
    männlich: 80,
    divers: 10,
  },
  { month: "Fachhochschulreife", weiblich: 305, männlich: 200, divers: 10 },
  { month: "Sonstige Qualifikation", weiblich: 237, männlich: 120, divers: 10 },
];

const chartConfig = {
  weiblich: {
    label: "weiblich",
    color: "var(--chart-1)",
  },
  männlich: {
    label: "männlich",
    color: "var(--chart-2)",
  },
  divers: {
    label: "divers",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function ChartBarStacked() {
  return (
        <ChartContainer config={chartConfig} className="w-full h-full min-h-0">
          <BarChart accessibilityLayer data={chartData} maxBarSize={45}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="weiblich"
              stackId="a"
              fill="#2B76BB"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="männlich"
              stackId="a"
              fill="#1F8FCE"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="divers"
              stackId="a"
              fill="#4DBAF7"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
  );
}
