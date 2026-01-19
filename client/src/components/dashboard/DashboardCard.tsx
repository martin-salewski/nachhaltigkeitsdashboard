import { AnreiseCard } from "@/components/dashboard/AnreiseCard";
import { EmissionsCard } from "@/components/dashboard/EmissionsCard";
import { BuildingRatingCard } from "@/components/dashboard/BuildingRatingCard";
import { StatCard } from "@/components/dashboard/StatCard";
import StudentChart from "@/components/cards/studentsChart";
import { GoalsCard } from "@/components/dashboard/GoalsCard";
import ElectricityMix from "@/components/cards/electricityMix";
import FossilFuels from "@/components/cards/fossilFuels";

interface DashboardGridProps {
  showOnlyCO2: boolean;
}

const dashboardCards = [
  {
    id: "building-rating",
    wrapperClass:
      "xl:col-span-3 lg:col-span-3 md:col-span-3 md:row-span-3 sm:col-span-1 row-span-2",
    element: <BuildingRatingCard />,
  },
  {
    id: "students",
    wrapperClass:
      "row-span-1 xl:col-span-3 lg:col-span-2 md:col-span-3 sm:col-span-1",
    element: (
      <StatCard
        value="100"
        label="Studierende"
        change="10%"
        changeType="positive"
      />
    ),
  },
  {
    id: "employees",
    wrapperClass:
      "row-span-1 xl:col-span-3 lg:col-span-2 md:col-span-3 sm:col-span-1",
    element: (
      <StatCard
        value="100"
        label="Beschäftigte"
        change="10%"
        changeType="positive"
      />
    ),
  },
  {
    id: "professors",
    wrapperClass:
      "row-span-1 xl:col-span-3 lg:col-span-2 md:col-span-3 sm:col-span-1",
    element: (
      <StatCard
        value="100"
        label="Professorinnen und Professoren"
        change="10%"
        changeType="positive"
      />
    ),
  },
  {
    id: "co2",
    wrapperClass:
      "xl:col-span-6 lg:col-span-3 md:col-span-3 md:row-span-3 sm:col-span-1 row-span-2",
    element: <EmissionsCard />,
  },
  {
    id: "travel",
    wrapperClass:
      "row-span-2 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-1",
    element: <AnreiseCard />,
  },
  {
    id: "goals",
    wrapperClass:
      "row-span-1 xl:col-span-3 lg:col-span-3 md:col-span-6 sm:col-span-1",
    element: <GoalsCard />,
  },
  {
    id: "students-chart",
    wrapperClass:
      "row-span-2 xl:col-span-6 lg:col-span-3 md:col-span-6 sm:col-span-1",
    element: <StudentChart />,
  },
  {
    id: "electricity-mix",
    wrapperClass:
      "row-span-2 xl:col-span-3 lg:col-span-3 md:col-span-6 sm:col-span-1",
    element: <ElectricityMix />,
  },
  {
    id: "fossil-fuels",
    wrapperClass:
      "row-span-2 xl:col-span-3 lg:col-span-3 md:col-span-6 sm:col-span-1",
    element: <FossilFuels />,
  },
];

export function DashboardGrid({ showOnlyCO2 }: DashboardGridProps) {
  return (
    <div className="grid xl:grid-cols-12 gap-8 lg:grid-cols-9 md:grid-cols-6 sm:grid-cols-1">
      {dashboardCards
        .filter((c) => !showOnlyCO2 || c.id === "co2")
        .map((c) => (
          <div key={c.id} data-card-id={c.id} className={c.wrapperClass}>
            {c.element}
          </div>
        ))}
    </div>
  );
}
