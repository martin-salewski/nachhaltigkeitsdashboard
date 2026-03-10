"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";



export const description = "A bar chart";

type Meal = "Fleisch" | "Vegetarisch" | "Vegan";

const chartData: Array<{ meal: Meal; CO2: number }> = [
  { meal: "Fleisch", CO2: 186 },
  { meal: "Vegetarisch", CO2: 305 },
  { meal: "Vegan", CO2: 237 },
];

const chartConfig = {
  fleisch: {
    label: "Fleisch",
    color: "#183358",
  },
  vegetarisch: {
    label: "Vegetarisch",
    color: "#2B76BB",
  },
  vegan: {
    label: "Vegan",
    color: "#9FCCE4",
  },
} satisfies ChartConfig;

const mealToColorVar: Record<Meal, string> = {
  Fleisch: "var(--color-fleisch)",
  Vegetarisch: "var(--color-vegetarisch)",
  Vegan: "var(--color-vegan)",
};

export function ChartBarMenu() {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full min-h-0">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="meal"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice()}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="CO2" radius={4} barSize={40}>
          {chartData.map((entry) => (
            <Cell key={entry.meal} fill={mealToColorVar[entry.meal]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
