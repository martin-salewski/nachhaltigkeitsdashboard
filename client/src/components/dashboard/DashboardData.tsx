import React from "react";
import { AnreiseCard } from "./AnreiseCard";
import { BuildingRatingCard } from "./BuildingRatingCard";
import ElectricityMix from "./ElectricityMixCard";
import { EmissionsCard } from "./EmissionsCard";
import { GoalsCard } from "./GoalsCard";
import HeatMix from "./HeatMixCard";
import { LearningPlaceCard } from "./LearningPlaceCard";
import MealPlanCard from "./MealPlanCard";
import MensaCard from "./MensaCard";
import StaffCard from "./StaffCard";
import StudentsDepartmentCard from "./StudentsDepartmentCard";
import StudentsCard from "./StudentsCard";
import { TrashCard } from "./TrashCard";
import { UsageCard } from "./UsageCard";
import { EmployeeStat } from "./EmployeeStat";
import { ProfStat } from "./ProfStat";
import { StudentsStat } from "./StudentsStat";
import { AirQualityCard } from "./AirQualityCard";

export type CategoryKey =
  | "co2"
  | "travel"
  | "food"
  | "electricity"
  | "water"
  | "heat"
  | "students"
  | "staff"
  | "waste"
  | "goals"
  | "rating"
  | "professors";

export type CardItem = {
  id: string;
  // Fixed position in the xl 12-column grid (1-indexed)
  col: number;
  row: number;
  colSpan: number;        // xl: 12-col grid
  rowSpan: number;
  lgColSpan: number;      // lg: 3-col grid  (≥1024px)
  mdColSpan: number;      // md: 2-col grid  (≥640px)
  filteredColSpan?: number; // xl-only override when a filter is active
  // sm: always 1 col
  element: React.ReactNode;
  category: CategoryKey[];
};

const dashboardCards: CardItem[] = [
  {
    id: "building-rating",
    col: 1, row: 1, colSpan: 3, rowSpan: 2, lgColSpan: 1, mdColSpan: 1,
    category: ["rating"],
    element: <BuildingRatingCard />,
  },
  {
    id: "students",
    col: 4, row: 1, colSpan: 3, rowSpan: 1, lgColSpan: 1, mdColSpan: 1,
    category: ["students"],
    element: <StudentsStat />,
  },
  {
    id: "employees",
    col: 7, row: 1, colSpan: 3, rowSpan: 1, lgColSpan: 1, mdColSpan: 1,
    category: ["staff"],
    element: <EmployeeStat />,
  },
  {
    id: "professors",
    col: 10, row: 1, colSpan: 3, rowSpan: 1, lgColSpan: 1, mdColSpan: 1,
    category: ["professors"],
    element: <ProfStat />,
  },
  {
    id: "goals",
    col: 1, row: 3, colSpan: 3, rowSpan: 3, lgColSpan: 1, mdColSpan: 1,
    category: ["goals"],
    element: <GoalsCard />,
  },
  {
    id: "co2",
    col: 4, row: 2, colSpan: 6, rowSpan: 2, lgColSpan: 2, mdColSpan: 2,
    category: ["co2"],
    element: <EmissionsCard />,
  },
  {
    id: "travel",
    col: 10, row: 2, colSpan: 3, rowSpan: 2, lgColSpan: 1, mdColSpan: 1,
    category: ["co2", "travel"],
    element: <AnreiseCard />,
  },
  {
    id: "foodchart",
    col: 4, row: 4, colSpan: 3, rowSpan: 2, lgColSpan: 1, mdColSpan: 1,
    category: ["food"],
    element: <MensaCard />,
  },
  {
    id: "foodplan",
    col: 7, row: 4, colSpan: 6, rowSpan: 2, lgColSpan: 2, mdColSpan: 2,
    category: ["food"],
    element: <MealPlanCard />,
  },
  {
    id: "electricity-mix",
    col: 1, row: 6, colSpan: 3, rowSpan: 2, lgColSpan: 1, mdColSpan: 1,
    category: ["electricity"],
    element: <ElectricityMix />,
  },
  {
    id: "usage",
    col: 4, row: 6, colSpan: 6, rowSpan: 2, lgColSpan: 2, mdColSpan: 2,
    category: ["electricity", "water"],
    element: <UsageCard />,
  },
  {
    id: "heat-mix",
    col: 10, row: 6, colSpan: 3, rowSpan: 2, lgColSpan: 1, mdColSpan: 1,
    category: ["heat"],
    element: <HeatMix />,
  },
  {
    id: "students-chart",
    col: 4, row: 8, colSpan: 6, rowSpan: 2, lgColSpan: 2, mdColSpan: 2,
    category: ["students"],
    element: <StudentsCard />,
  },
  {
    id: "learning",
    col: 1, row: 8, colSpan: 3, rowSpan: 3, lgColSpan: 1, mdColSpan: 1,
    category: ["students"],
    element: <LearningPlaceCard />,
  },
  {
    id: "trash",
    col: 10, row: 8, colSpan: 3, rowSpan: 2, lgColSpan: 1, mdColSpan: 1,
    category: ["waste"],
    element: <TrashCard />,
  },
  {
    id: "staff-chart",
    col: 4, row: 12, colSpan: 6, rowSpan: 2, lgColSpan: 2, mdColSpan: 2,
    category: ["staff"],
    element: <StaffCard />,
  },
  {
    id: "blank",
    col: 10, row: 10, colSpan: 3, rowSpan: 4, lgColSpan: 1, mdColSpan: 1,
    category: ["co2", "heat"],
    element: <AirQualityCard />,
  },
  {
    id: "students-department",
    col: 4, row: 10, colSpan: 6, rowSpan: 2, lgColSpan: 2, mdColSpan: 2,
    category: ["students"],
    element: <StudentsDepartmentCard />,
  },
];

export default dashboardCards;
