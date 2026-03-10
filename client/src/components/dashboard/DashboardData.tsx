import React, { useState } from "react";
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
import StudentsCard from "./StudentsCard";
import { TrashCard } from "./TrashCard";
import { UsageCard } from "./UsageCard";
import { EmployeeStat } from "./EmployeeStat";
import { ProfStat } from "./ProfStat";
import { StudentsStat } from "./StudentsStat";

// Lazy Wrapper-Komponenten
const LazyAnreiseCard = () => <AnreiseCard />;
const LazyBuildingRatingCard = () => <BuildingRatingCard />;
const LazyElectricityMix = () => <ElectricityMix />;
const LazyEmissionsCard = () => <EmissionsCard />;
const LazyGoalsCard = () => <GoalsCard />;
const LazyHeatMix = () => <HeatMix />;
const LazyLearningPlaceCard = () => <LearningPlaceCard />;
const LazyMealPlanCard = () => <MealPlanCard />;
const LazyMensaCard = () => <MensaCard />;
const LazyStaffCard = () => <StaffCard />;
const LazyStudentsCard = () => <StudentsCard />;
const LazyTrashCard = () => <TrashCard />;
const LazyUsageCard = () => <UsageCard />;
const LazyEmployeeStat = () => <EmployeeStat />;
const LazyProfStat = () => <ProfStat />;
const LazyStudentsStat = () => <StudentsStat />;

type CategoryKey =
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

type CardItem = {
  id: string;
  wrapperClass: string;
  element: React.ReactNode;
  category: CategoryKey[];
};

const dashboardCards: CardItem[] = [
  {
    id: "building-rating",
    wrapperClass: "xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-2",
    category: ["rating"],
    element: <LazyBuildingRatingCard />,
  },
  {
    id: "students",
    wrapperClass: "xl:col-span-3 lg:col-span-2 md:col-span-2 sm:col-span-1 row-span-1",
    category: ["students"],
    element: <LazyStudentsStat />,
  },
  {
    id: "employees",
    wrapperClass: "xl:col-span-3 lg:col-span-2 md:col-span-3 sm:col-span-1 row-span-1",
    category: ["staff"],
    element: <LazyEmployeeStat />,
  },
  {
    id: "professors",
    wrapperClass: "xl:col-span-3 lg:col-span-2 md:col-span-3 sm:col-span-1 row-span-1",
    category: ["professors"],
    element: <LazyProfStat />,
  },
  {
    id: "goals",
    wrapperClass: "row-start-3 col-start-1 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-3",
    category: ["goals"],
    element: <LazyGoalsCard />,
  },
  {
    id: "co2",
    wrapperClass: "row-start-2 col-start-3 xl:col-span-6 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-2",
    category: ["co2"],
    element: <LazyEmissionsCard />,
  },
  {
    id: "travel",
    wrapperClass: "xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-2 row-span-2",
    category: ["co2", "travel"],
    element: <LazyAnreiseCard />,
  },
  {
    id: "foodchart",
    wrapperClass: "row-start-4 col-start-3 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-2 row-span-2",
    category: ["food"],
    element: <LazyMensaCard />,
  },
  {
    id: "foodplan",
    wrapperClass: "row-start-4 xl:col-span-6 lg:col-span-3 md:col-span-3 sm:col-span-2 row-span-2",
    category: ["food"],
    element: <LazyMealPlanCard />,
  },
  {
    id: "electricity-mix",
    wrapperClass: "col-start-1 row-start-6 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-2",
    category: ["electricity"],
    element: <LazyElectricityMix />,
  },
  {
    id: "usage",
    wrapperClass: "row-start-6 xl:col-span-6 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-2",
    category: ["electricity", "water"],
    element: <LazyUsageCard />,
  },
  {
    id: "heat-mix",
    wrapperClass: "row-start-6 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-2",
    category: ["heat"],
    element: <LazyHeatMix />,
  },
  {
    id: "learning",
    wrapperClass: "row-start-8 col-start-1 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-3",
    category: ["students"],
    element: <LazyLearningPlaceCard />,
  },
  {
    id: "students-chart",
    wrapperClass: "row-start-8 xl:col-span-6 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-2",
    category: ["students"],
    element: <LazyStudentsCard />,
  },
  {
    id: "trash",
    wrapperClass: "row-start-8 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-2",
    category: ["waste"],
    element: <LazyTrashCard />,
  },
  {
    id: "staff-chart",
    wrapperClass: "row-start-10 xl:col-span-6 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-2",
    category: ["staff"],
    element: <LazyStaffCard />,
  },
];

export default dashboardCards;