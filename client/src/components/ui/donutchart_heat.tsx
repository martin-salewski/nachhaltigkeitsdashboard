import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { ChartOptions, ChartData } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  data: number[];
  labels: string[];
};

export function DonutChart({ data, labels }: Props) {
  const colors = [
    "#7DB8FF",
    "#1D3A6A",
    "#4D719C",
    "#7196C6",
    "#1F8FCE",
    "#4DBAF7",
  ];

  const chartData: ChartData<"doughnut"> = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        hoverOffset: 4,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed}%`,
        },
      },
    },
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="h-[130px] w-full">
        <Doughnut data={chartData} options={options} />
      </div>

      <ul className="w-full grid grid-cols-3 gap-y-2 gap-x-3 text-[11px]">
        {labels.map((label, i) => (
          <li key={label} className="flex items-start gap-1.5 min-w-0">
            <span
              className="h-2.5 w-2.5 mt-0.5 shrink-0 rounded-full"
              style={{ backgroundColor: colors[i] }}
            />
            <span className="text-muted-foreground">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
