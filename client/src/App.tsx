import { useLayoutEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
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
  Goal,
} from "lucide-react";
import DownloadButton from "./components/ui/download_button";

gsap.registerPlugin(Flip);

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

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
  | "rating";

type FilterOption = {
  key: CategoryKey;
  icon: IconType;
  label: string;
};

const categoryOptions: FilterOption[] = [
  { key: "co2", label: "CO₂", icon: Cloudy },
  { key: "travel", label: "Anreise", icon: TramFront },
  { key: "food", label: "Mensa", icon: UtensilsCrossed },
  { key: "electricity", label: "Strom", icon: BatteryCharging },
  { key: "water", label: "Wasser", icon: Droplet },
  { key: "heat", label: "Wärme", icon: Thermometer },
  { key: "students", label: "Studierende", icon: GraduationCap },
  { key: "staff", label: "Personal", icon: BriefcaseBusiness },
  { key: "waste", label: "Abfall", icon: Trash2 },
  { key: "goals", label: "Ziele", icon: Goal },
  { key: "rating", label: "Rating", icon: ChartPie },
];

function stripGridPlacementClasses(className: string) {
  return className
    .split(/\s+/)
    .filter((c) => {
      if (/(^|:)(col-start-|row-start-|col-end-|row-end-)/.test(c)) return false;
      return true;
    })
    .join(" ");
}

function getCardClass(wrapperClass: string, activeFilter: CategoryKey | "all") {
  if (activeFilter === "all") return wrapperClass;
  return stripGridPlacementClasses(wrapperClass);
}

function App() {
  const flipStateRef = useRef<Flip.FlipState | null>(null);
  const [activeFilter, setActiveFilter] = useState<CategoryKey | "all">("all");

  function toggleFilter(nextFilter: CategoryKey) {
    flipStateRef.current = Flip.getState("[data-card-id]");
    setActiveFilter((prev) => (prev === nextFilter ? "all" : nextFilter));
  }

  const categoriesInCards = new Set(dashboardCards.flatMap((c) => c.category));
  const visibleCategoryOptions = categoryOptions.filter((o) => categoriesInCards.has(o.key));

  const visibleCards =
    activeFilter === "all"
      ? dashboardCards
      : dashboardCards.filter((card) => card.category.includes(activeFilter));

  useLayoutEffect(() => {
    if (!flipStateRef.current) return;

    Flip.from(flipStateRef.current, {
      duration: 0.7,
      ease: "power1.inOut",
      absolute: true,
      scale: true,
      stagger: 0.03,
      simple: true,
      onEnter: (elements) =>
        gsap.fromTo(
          elements,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.25 }
        ),
      onLeave: (elements) => gsap.to(elements, { opacity: 0, scale: 0.95, duration: 0.2 }),
    });

    flipStateRef.current = null;
  }, [activeFilter]);

  return (
    <div
      className="mx-auto xs:mx-4 sm:mx-8 md:mx-12 lg:mx-16 min-h-screen p-6 flex justify-center"
      style={{ fontFamily: '"SimStd", sans-serif' }}
    >
      <Navbar />

      <div className="mt-20 mb-10 max-w-360 flex flex-col gap-2">
        <div className="flex flex-col">
          <h1 className="font-bold text-2xl mb-1">Nachhaltigkeitsdashboard</h1>

          <p className="text-sm text-black/70 max-w-3xl mb-4">
            Willkommen auf dem Nachhaltigkeitsdashboard der Hochschule Mainz! Hier geben wir Einblick
            in unsere Aktivitäten und Fortschritte auf dem Weg zu mehr ökologischer, sozialer und
            ökonomischer Verantwortung, orientiert an unseren Nachhaltigkeitszielen.
          </p>

          <div className="flex justify-between items-start">
            <div className="flex flex-wrap gap-2">
              {visibleCategoryOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => toggleFilter(opt.key)}
                  className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
                    activeFilter === opt.key ? "bg-[#2B76BB] border-[#2B76BB]" : "bg-white border-gray-300"
                  }`}
                >
                  <opt.icon
                    className={`w-5 h-5 ${
                      activeFilter === opt.key ? "text-white" : "text-[#2B76BB]"
                    }`}
                    strokeWidth={2}
                  />
                </button>
              ))}
            </div>

            <DownloadButton/>
          </div>
        </div>

        <div className="grid grid-flow-dense xl:grid-cols-12 lg:grid-cols-9 md:grid-cols-6 sm:grid-cols-1 gap-8 auto-rows-[130px]">
          {visibleCards.map((card) => (
            <div
              key={card.id}
              data-card-id={card.id}
              className={getCardClass(card.wrapperClass, activeFilter)}
            >
              {card.element}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;