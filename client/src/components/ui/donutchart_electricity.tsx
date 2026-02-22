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
      },
    },
  };

  return (
    <div className="w-full min-h-0 flex flex-col items-center">
      <div className="flex-1 min-h-0  max-h-[55%] w-full">
        <Doughnut data={chartData} options={options} />
      </div>

      <ul className="shrink-0 mt-4 w-full flex justify-around items-center flex-wrap gap-y-2 text-xs">
        {labels.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colors[i] }}
            />
            <span className="text-muted-foreground">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
