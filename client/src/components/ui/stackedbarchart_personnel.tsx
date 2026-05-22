"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
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
    const grouped = data.reduce((acc, entry) => {
      const existing = acc.find(d => d.department === entry.department);
      if (existing) {
        existing[entry.gender] = (existing[entry.gender] ?? 0) + Number(entry.count);
      } else {
        acc.push({ department: entry.department, [entry.gender]: Number(entry.count) });
      }
      return acc;
    }, [] as Record<string, any>[]);
    return grouped.map(row => ({
      ...row,
      total: genderKeys.reduce((sum, g) => sum + (row[g] ?? 0), 0),
    }));
  }, [data, genderKeys]);

  return (
    <ChartContainer config={chartConfig} className="h-full w-full min-h-0">
      <BarChart accessibilityLayer data={chartData} maxBarSize={45} margin={{ top: 20 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="department"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          interval={0}
          height={60}
          tick={({ x, y, payload }) => (
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="hanging"
              fontSize={12}
              fill="currentColor"
            >
              {payload.value
                .split(" ")
                .reduce((lines: string[], word: string) => {
                  const last = lines[lines.length - 1];
                  if (last && (last + " " + word).length <= 20) {
                    lines[lines.length - 1] = last + " " + word;
                  } else {
                    lines.push(word);
                  }
                  return lines;
                }, [])
                .map((line: string, i: number) => (
                  <tspan key={i} x={x} dy={i === 0 ? 0 : 14}>
                    {line}
                  </tspan>
                ))}
            </text>
          )}
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