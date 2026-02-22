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
import { StatCard } from "./StatCard";
import StudentsCard from "./StudentsCard";
import { TrashCard } from "./TrashCard";
import { UsageCard } from "./UsageCard";


type CardItem = {
    id: string,
    wrapperClass: string
    element: React.ReactNode
}

const dashboardCards: CardItem[] = [

    {
      id: "building-rating",
      wrapperClass:
        "xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-2",
      element: <BuildingRatingCard />,
    },
     {
      id: "students",
      wrapperClass:
        " xl:col-span-3 lg:col-span-2 md:col-span-2 sm:col-span-1 row-span-1",
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
        "xl:col-span-3 lg:col-span-2 md:col-span-3 sm:col-span-1 row-span-1",
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
        "xl:col-span-3 lg:col-span-2 md:col-span-3 sm:col-span-1 row-span-1",
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
      id: "goals",
      wrapperClass:
        "row-start-3 col-start-1 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-3",
      element: <GoalsCard />,
    },
    {
      id: "co2",
      wrapperClass:
        "row-start-2 col-start-3 xl:col-span-6 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-2",
      element: <EmissionsCard />,
    },
    {
      id: "travel",
      wrapperClass:
        "xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-2 row-span-2",
      element: <AnreiseCard />,
    },
    {
      id: "foodchart",
      wrapperClass:
        "row-start-4 col-start-3 :col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-2 row-span-2",
      element: <MensaCard />,
    },
    {
      id: "foodplan",
      wrapperClass:
        "row-start-4 xl:col-span-6 lg:col-span-3 md:col-span-3 sm:col-span-2 row-span-2",
      element: <MealPlanCard />,
    },
    {
      id: "electricity-mix",
      wrapperClass:
        "col-start-1 row-start-6 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-2",
      element: <ElectricityMix />,
    }, 
    {
      id: "usage",
      wrapperClass:
        "row-start-6 xl:col-span-6 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-2",
      element: <UsageCard />,
    },
  
     {
      id: "heat-mix",
      wrapperClass:
        "row-start-6 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-2",
      element: <HeatMix />,
    },
    {
      id: "learning",
      wrapperClass:
        "row-start-8 col-start-1 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-3",
        element: <LearningPlaceCard />,
    },
    {
      id: "students-chart",
      wrapperClass:
        "row-start-8 xl:col-span-6 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-2",
      element: <StudentsCard />,
    },
    {
      id: "trash",
      wrapperClass:
        "row-start-8 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-2",
      element: <TrashCard />,
    }, 
    {
      id: "staff-chart",
      wrapperClass:
        "row-start-10 xl:col-span-6 lg:col-span-3 md:col-span-3 sm:col-span-1 row-span-2",
      element: <StaffCard />,
    },
  ];
  export default dashboardCards;