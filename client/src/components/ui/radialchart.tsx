"use client";
import { ResponsiveContainer } from "recharts";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {} from "@/components/ui/card";
export const description = "A radial chart with text";

type ChartRadialTextProps = {
  score: number;

  size?: "sm" | "md" | "default";
};

export const ChartRadialText = ({ score, size = "default" }: ChartRadialTextProps) => {
  const data = [{ score, fill: "var(--color-chart-1)" }];

  const dimensions =
    size === "sm"
      ? {
          containerClassName: "w-[200px] h-[160px]",
          innerRadius: 62,
          outerRadius: 88,
          polarRadius: [68, 56] as [number, number],
          valueTextClassName: "fill-foreground text-5xl font-bold font-['SimStd']",
          subTextClassName: "fill-muted-foreground font-['SimStd'] text-xs",
          valueTranslateY: -8,
          subTextOffsetY: 34,
        }
      : size === "md"
        ? {
            containerClassName: "w-[220px] h-[175px]",
            innerRadius: 70,
            outerRadius: 98,
            polarRadius: [76, 64] as [number, number],
            valueTextClassName:
              "fill-foreground text-5xl font-bold font-['SimStd']",
            subTextClassName: "fill-muted-foreground font-['SimStd'] text-xs",
            valueTranslateY: -9,
            subTextOffsetY: 40,
          }
      : {
          containerClassName: "w-[250px] h-[200px]",
          innerRadius: 80,
          outerRadius: 110,
          polarRadius: [86, 74] as [number, number],
          valueTextClassName: "fill-foreground text-6xl font-bold font-['SimStd']",
          subTextClassName: "fill-muted-foreground font-['SimStd'] text-8",
          valueTranslateY: -10,
          subTextOffsetY: 45,
        };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={dimensions.containerClassName}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={data}
            startAngle={90}
            endAngle={90 - score * 3.6}
            innerRadius={dimensions.innerRadius}
            outerRadius={dimensions.outerRadius}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-white"
              polarRadius={dimensions.polarRadius}
            />
            <div className="rounded-full color-white shadow-lg"></div>
            <RadialBar dataKey="score" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <g>
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`translate(0, ${dimensions.valueTranslateY})`}
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className={dimensions.valueTextClassName}
                          >
                            {score.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + dimensions.subTextOffsetY}
                            className={dimensions.subTextClassName}
                          >
                            {score}/100
                          </tspan>
                        </text>
                      </g>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
