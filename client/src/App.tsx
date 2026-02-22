import { useLayoutEffect, useRef, useState, type ComponentType, type ReactElement, type SVGProps } from "react";
import Navbar from "@/components/ui/navbar";
import gsap from "gsap";
import { Flip } from "gsap/all";
import dashboardCards from "./components/dashboard/DashboardData";
import {
  Droplet,
  BatteryCharging,
  GraduationCap,
  Thermometer,
  Cloudy,
  UtensilsCrossed,
  ChartPie,
  TramFront,
  BriefcaseBusiness,
  Trash2,
  Goal
} from "lucide-react";



gsap.registerPlugin(Flip);

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type FilterOption = {
  id: string;
  icon: IconType
};

const filterOptions: FilterOption[] = [
  {id: "co2", icon: Cloudy},
  {id: "travel", icon: TramFront},
  {id: "foodchart", icon: UtensilsCrossed},
  {id: "foodplan", icon: UtensilsCrossed }, 
  {id: "usage", icon: Droplet},
  {id: "water", icon: Droplet},
  {id: "electricity-mix", icon: BatteryCharging},
  {id: "heat-mix", icon: Thermometer },
  {id: "learning", icon: GraduationCap },
  {id: "trash", icon: Trash2},
  {id: "students-chart", icon: GraduationCap},
  {id: "staff-chart", icon: BriefcaseBusiness },
  {id:"goals", icon: Goal },
  {id: "building-rating", icon: ChartPie}
]

function App() {
    
  const flipStateRef = useRef<Flip.FlipState | null>(null)
  const [activeFilter, setActiveFilter] = useState("all")

  function toggleFilter(nextFilter: string) {
    flipStateRef.current = Flip.getState("[data-card-id]")
    setActiveFilter((prev) =>     
    (prev === nextFilter ? "all" : nextFilter));
  }
  
  const visibleCards = 
  activeFilter === "all"
  ? dashboardCards
  : dashboardCards.filter(cards => cards.id === activeFilter)
  
  
  
  useLayoutEffect(() => {
    if (!flipStateRef.current) {
      return;
    }
  
    Flip.from(flipStateRef.current, {
      duration: 0.7,
      ease: "power1.inOut",
      scale: true,
      absolute: true,
      stagger: 0.03,
      onEnter: (elements) => {
        gsap.fromTo(
          elements,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.25 }
        );
      },
    
      onLeave: (elements) => {
        gsap.to(elements, { opacity: 0, scale: 0.8, duration: 0.2 });
      },
    });
  
    flipStateRef.current = null;
  }, [activeFilter]);

  return (
    <div
      className="mx-auto xs:mx-4 sm:mx-8 md:mx-12 lg:mx-16 min-h-screen p-6 flex justify-center"
      style={{ fontFamily: '"SimStd", sans-serif' }}
    >
      <Navbar />

      <div className="mt-20 mb-10 max-w-360">
        <div className="flex flex-col">
        <h1 className="font-bold text-2xl mb-1">Nachhaltigkeitsdashboard</h1>

        <p className="text-sm text-black/70 max-w-3xl">
          Willkommen auf dem Nachhaltigkeitsdashboard der Hochschule Mainz! Hier
          geben wir Einblick in unsere Aktivitäten und Fortschritte auf dem Weg
          zu mehr ökologischer, sozialer und ökonomischer Verantwortung,
          orientiert an unseren Nachhaltigkeitszielen (SDGs 4, 5, 6, 10, 11, 12,
          16 und 17). Gemeinsam gestalten wir eine zukunftsfähige Hochschule und
          freuen uns über Ihren Beitrag – mehr zu den 17 Nachhaltigkeitszielen
          finden Sie unter: https://sdgs.un.org/goals.
        </p>
        <div className="flex justify-between">
        
         {filterOptions.map(filter =>
         <button
         key={filter.id}
         onClick={()=>toggleFilter(filter.id)}
         className={`flex items-center gap-2 px-3 py-2 transition-colors rounded-lg border border-gray-300
          ${activeFilter=== filter.id
             ? "bg-[#2B76BB]"
             : "bg-white"
         }`
        }
         > <filter.icon
         className={`w-5 h-5 ${
           activeFilter === filter.id ? "text-white" : "text-[#2B76BB]"
         }`}
         strokeWidth={2}
          ></filter.icon></button>
         )}
        </div>
        </div>
        <div className="grid xl:grid-cols-12 lg:grid-cols-9 md:grid-cols-6 sm:grid-cols-1  gap-8 auto-rows-[130px] grid-flow-row-dense">
      {visibleCards.map((card) => (
        <div
        key={card.id}
        data-card-id={card.id}
        className={card.wrapperClass} >
          {card.element}
        </div>
      ))}
    </div>
    </div>    
    </div>
  );
}

export default App;
