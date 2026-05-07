"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useTranslation } from "react-i18next";

type Meal = "fleisch" | "vegetarisch" | "vegan";

interface MealData {
  meal: string;
  CO2: number;
  category: Meal;
}

interface ChartBarMenuProps {
  data?: MealData[];
}

const chartConfig = {
  fleisch:      { label: "Fleisch",      color: "#183358" },
  vegetarisch:  { label: "Vegetarisch",  color: "#2B76BB" },
  vegan:        { label: "Vegan",        color: "#9FCCE4" },
} satisfies ChartConfig;

const categoryColor: Record<Meal, string> = {
  fleisch:     "var(--color-fleisch)",
  vegetarisch: "var(--color-vegetarisch)",
  vegan:       "var(--color-vegan)",
};

export function ChartBarMenu({ data }: ChartBarMenuProps) {
  const { t } = useTranslation();

  const fallbackData: MealData[] = [
    { meal: t("mealTypes.meat"),       CO2: 0, category: "fleisch" },
    { meal: t("mealTypes.vegetarian"), CO2: 0, category: "vegetarisch" },
    { meal: t("mealTypes.vegan"),      CO2: 0, category: "vegan" },
  ];

  const rawData = data ?? fallbackData;
  const chartData = rawData.map((d) => ({
    ...d,
    meal: d.category === "fleisch"
      ? t("mealTypes.meat")
      : d.category === "vegetarisch"
        ? t("mealTypes.vegetarian")
        : t("mealTypes.vegan"),
  }));
  return (
    <ChartContainer config={chartConfig} className="h-full w-full min-h-0">
      <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="meal"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="CO2" radius={4} barSize={40}>
          {chartData.map((entry) => (
            <Cell key={entry.category} fill={categoryColor[entry.category]} />
          ))}
          <LabelList dataKey="CO2" position="top" formatter={(v: number) => v > 0 ? `${v} g` : ""} style={{ fontSize: 11, fill: "#555" }} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
