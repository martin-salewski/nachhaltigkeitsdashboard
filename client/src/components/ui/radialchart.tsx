"use client";
import { ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {} from "@/components/ui/card";
export const description = "A radial chart with text";

export const ChartRadialText = ({ score }) => {
  console.log("Component Props", score);
  const data = [{ score, fill: "var(--color-chart-1)" }];
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-[250px] h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={data}
            startAngle={90}
            endAngle={90 - score * 3.6}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-white"
              polarRadius={[86, 74]}
            />
            <div className="rounded-full color-white shadow-lg"></div>
            <RadialBar dataKey="score" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <g>
                        {/*  <rect
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 45}
                          width={80}
                          height={40}
                          ry={100}
                          rx={100}
                          stroke="#909090ff"
                          strokeWidth={2}
                          fill="none"
                        /> */}
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`translate(0, -10)`}
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-6xl font-bold font-['SimStd']"
                          >
                            {score.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 45}
                            className="fill-muted-foreground font-['SimStd'] text-8"
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
