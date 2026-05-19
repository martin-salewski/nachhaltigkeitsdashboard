"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { StudentData } from "../dashboard/StudentsCard";
import { useMemo } from "react";


interface ChartProps {
  data: StudentData[];
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
    const grouped = data.reduce((acc, entry) => {
      const existing = acc.find(d => d.qualification === entry.qualification);
      if (existing) {
        existing[entry.gender] = (existing[entry.gender] ?? 0) + Number(entry.count);
      } else {
        acc.push({ qualification: entry.qualification, [entry.gender]: Number(entry.count) });
      }
      return acc;
    }, [] as Record<string, any>[]);
    return grouped.map(row => ({
      ...row,
      total: genderKeys.reduce((sum, g) => sum + (row[g] ?? 0), 0),
    }));
  }, [data, genderKeys]);

  return (
        <ChartContainer config={chartConfig} className="w-full h-full min-h-0">
          <BarChart accessibilityLayer data={chartData} maxBarSize={45} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="qualification"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            {genderKeys.map((gender, index) => (
              <Bar
                key={gender}
                dataKey={gender}
                stackId="a"
                fill={`var(--chart-${index + 1})`}
                radius={index === genderKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              >
                {index === genderKeys.length - 1 && (
                  <LabelList
                    dataKey="total"
                    position="top"
                    style={{ fontSize: 11, fill: "rgba(0,0,0,0.5)", fontWeight: 600 }}
                    formatter={(v: number) => v.toLocaleString()}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ChartContainer>
  );
}
