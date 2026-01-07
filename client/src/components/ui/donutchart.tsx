import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { ChartOptions, ChartData } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  data: number[];
  labels: string[];
};

export function DonutChart({ data, labels }: Props) {
  const chartData: ChartData<"doughnut"> = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          "#7DB8FF",
          "#1D3A6A",
          "#4D719C",
          "#7196C6",
          "#1F8FCE",
          "#4DBAF7",
        ],
        hoverOffset: 4,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}
