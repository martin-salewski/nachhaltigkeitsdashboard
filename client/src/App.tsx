import { useState, useEffect, useRef, useMemo, type ComponentType, type SVGProps } from "react";
import Navbar from "@/components/ui/navbar";
import dashboardCards, { type CardItem, type CategoryKey } from "./components/dashboard/DashboardData";
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

type IconType = ComponentType<SVGProps<SVGSVGElement>>;
type FilterOption = { key: CategoryKey; icon: IconType; label: string };
type Breakpoint = "xl" | "lg" | "md" | "sm";
type Pos = { x: number; y: number; w: number; h: number };

const categoryOptions: FilterOption[] = [
  { key: "co2",         label: "CO₂",        icon: Cloudy           },
  { key: "travel",      label: "Anreise",     icon: TramFront        },
  { key: "food",        label: "Mensa",       icon: UtensilsCrossed  },
  { key: "electricity", label: "Strom",       icon: BatteryCharging  },
  { key: "water",       label: "Wasser",      icon: Droplet          },
  { key: "heat",        label: "Wärme",       icon: Thermometer      },
  { key: "students",    label: "Studierende", icon: GraduationCap    },
  { key: "staff",       label: "Personal",    icon: BriefcaseBusiness},
  { key: "waste",       label: "Abfall",      icon: Trash2           },
  { key: "goals",       label: "Ziele",       icon: Goal             },
  { key: "rating",      label: "Rating",      icon: ChartPie         },
];

const GAP = 24;
const ROW_HEIGHT = 130;

function getBreakpoint(w: number): Breakpoint {
  if (w >= 1280) return "xl";
  if (w >= 1024) return "lg";
  if (w >= 640)  return "md";
  return "sm";
}

function getBpConfig(bp: Breakpoint): { totalCols: number } {
  return { totalCols: bp === "xl" ? 12 : bp === "lg" ? 3 : bp === "md" ? 2 : 1 };
}

function getColSpan(card: CardItem, bp: Breakpoint): number {
  if (bp === "xl") return card.colSpan;
  if (bp === "lg") return card.lgColSpan;
  if (bp === "md") return card.mdColSpan;
  return 1;
}

function colWidth(containerWidth: number, totalCols: number): number {
  return (containerWidth - (totalCols - 1) * GAP) / totalCols;
}

function cardW(card: CardItem, bp: Breakpoint, cw: number): number {
  const cs = getColSpan(card, bp);
  return cs * cw + (cs - 1) * GAP;
}

function cardH(card: CardItem): number {
  return card.rowSpan * ROW_HEIGHT + (card.rowSpan - 1) * GAP;
}

// Fixed positions for xl "all" view — matches the original grid exactly
function computeXlPositions(containerWidth: number): Record<string, Pos> {
  const cw = colWidth(containerWidth, 12);
  const result: Record<string, Pos> = {};
  for (const card of dashboardCards) {
    result[card.id] = {
      x: (card.col - 1) * (cw + GAP),
      y: (card.row - 1) * (ROW_HEIGHT + GAP),
      w: cardW(card, "xl", cw),
      h: cardH(card),
    };
  }
  return result;
}

// Custom 2-column layout for the students filter at xl
function computeStudentsXlPositions(containerWidth: number): Record<string, Pos> {
  const cw = colWidth(containerWidth, 12);
  const leftW  = 3 * cw + 2 * GAP;
  const rightW = 6 * cw + 5 * GAP;
  const rightX = 3 * (cw + GAP);

  const hStat     = ROW_HEIGHT;                    // rowSpan 1
  const hChart    = 2 * ROW_HEIGHT + GAP;          // rowSpan 2
  const hLearning = 3 * ROW_HEIGHT + 2 * GAP;     // rowSpan 3
  const hDept     = 2 * ROW_HEIGHT + GAP;          // rowSpan 2

  return {
    "students":              { x: 0,      y: 0,              w: leftW,  h: hStat },
    "students-chart":        { x: rightX, y: 0,              w: rightW, h: hChart },
    "learning":              { x: 0,      y: hStat + GAP,    w: leftW,  h: hLearning },
    "students-department":   { x: rightX, y: hChart + GAP,   w: rightW, h: hDept },
  };
}

// Custom layout for the co2 filter at xl
// Left:  AirQualityCard (3 cols, 4 rows)
// Right: EmissionsCard (6 cols, 2 rows) on top, AnreiseCard (3 cols, 2 rows) below
function computeCo2XlPositions(containerWidth: number): Record<string, Pos> {
  const cw   = colWidth(containerWidth, 12);
  const leftW  = 3 * cw + 2 * GAP;
  const midW   = 6 * cw + 5 * GAP;
  const rightW = 3 * cw + 2 * GAP;
  const midX   = 3 * (cw + GAP);

  const hBlank     = 4 * ROW_HEIGHT + 3 * GAP;  // rowSpan 4
  const hEmissions = 2 * ROW_HEIGHT + GAP;       // rowSpan 2
  const hTravel    = 2 * ROW_HEIGHT + GAP;       // rowSpan 2

  return {
    "blank":  { x: 0,    y: 0,                  w: leftW, h: hBlank },
    "co2":    { x: midX, y: 0,                  w: midW,  h: hEmissions },
    "travel": { x: midX, y: hEmissions + GAP,   w: rightW, h: hTravel },
  };
}

// Wrapping layout — used for non-xl breakpoints and all filtered views
function computeWrappingPositions(
  cards: CardItem[],
  bp: Breakpoint,
  containerWidth: number
): Record<string, Pos> {
  const { totalCols } = getBpConfig(bp);
  const cw = colWidth(containerWidth, totalCols);
  const result: Record<string, Pos> = {};

  // track occupied cells in a simple row-col matrix
  let curCol = 0; // 0-indexed current col
  let curRow = 0;
  const rowHeights: number[] = [];

  // helper: get y offset for a row
  function rowY(r: number): number {
    let y = 0;
    for (let i = 0; i < r; i++) y += (rowHeights[i] ?? ROW_HEIGHT) + GAP;
    return y;
  }

  for (const card of cards) {
    const cs = getColSpan(card, bp);
    const w = cardW(card, bp, cw);
    const h = cardH(card);

    // wrap if card doesn't fit on current row
    if (curCol + cs > totalCols) {
      curRow++;
      curCol = 0;
    }

    result[card.id] = {
      x: curCol * (cw + GAP),
      y: rowY(curRow),
      w,
      h,
    };

    // track tallest card in this row
    rowHeights[curRow] = Math.max(rowHeights[curRow] ?? 0, h);
    curCol += cs;
    if (curCol >= totalCols) {
      curRow++;
      curCol = 0;
    }
  }
  return result;
}

function maxHeight(positions: Record<string, Pos>): number {
  return Math.max(0, ...Object.values(positions).map((p) => p.y + p.h));
}

function App() {
  const [activeFilter, setActiveFilter] = useState<CategoryKey | "all">("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerWidth(el.offsetWidth));
    ro.observe(el);
    setContainerWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  function toggleFilter(nextFilter: CategoryKey) {
    setActiveFilter((prev) => (prev === nextFilter ? "all" : nextFilter));
  }

  const bp = getBreakpoint(containerWidth);
  const isXl = bp === "xl";

  const filterOrders: Partial<Record<CategoryKey, string[]>> = {
    students: ["students", "students-chart", "learning", "students-department"],
    co2:      ["blank", "co2", "travel"],
  };

  const visibleCards = useMemo(() => {
    if (activeFilter === "all") return dashboardCards;
    const filtered = dashboardCards.filter((c) => c.category.includes(activeFilter));
    const order = filterOrders[activeFilter];
    if (order) {
      return [
        ...order.map((id) => filtered.find((c) => c.id === id)!).filter(Boolean),
        ...filtered.filter((c) => !order.includes(c.id)),
      ];
    }
    return filtered;
  }, [activeFilter]);

  // Positions for visible cards
  const positions = useMemo((): Record<string, Pos> => {
    if (containerWidth === 0) return {};
    if (isXl && activeFilter === "all") return computeXlPositions(containerWidth);
    if (isXl && activeFilter === "students") return computeStudentsXlPositions(containerWidth);
    if (isXl && activeFilter === "co2") return computeCo2XlPositions(containerWidth);
    return computeWrappingPositions(visibleCards, bp, containerWidth);
  }, [activeFilter, containerWidth, bp, isXl, visibleCards]);

  // Positions for hidden cards (always use xl fixed layout as origin for animation)
  const allPositions = useMemo((): Record<string, Pos> => {
    if (containerWidth === 0) return {};
    if (isXl) return computeXlPositions(containerWidth);
    return computeWrappingPositions(dashboardCards, bp, containerWidth);
  }, [containerWidth, bp, isXl]);

  const wrapperHeight = maxHeight(activeFilter === "all" ? allPositions : positions);

  const categoriesInCards = new Set(dashboardCards.flatMap((c) => c.category));
  const visibleCategoryOptions = categoryOptions.filter((o) => categoriesInCards.has(o.key));

  return (
    <div
      className="min-h-screen py-6 flex justify-center"
      style={{ fontFamily: '"SimStd", sans-serif' }}
    >
      <Navbar />

      <div className="mt-20 mb-10 max-w-360 w-full flex flex-col gap-2 px-6">
        <div className="flex flex-col">
          <h1 className="font-bold text-2xl mb-1">Nachhaltigkeitsdashboard</h1>

          <p className="text-sm text-black/70 max-w-3xl mb-4">
            Willkommen auf dem Nachhaltigkeitsdashboard der Hochschule Mainz! Hier geben wir Einblick
            in unsere Aktivitäten und Fortschritte auf dem Weg zu mehr ökologischer, sozialer und
            ökonomischer Verantwortung, orientiert an unseren Nachhaltigkeitszielen.
          </p>

          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-wrap gap-2">
              {visibleCategoryOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => toggleFilter(opt.key)}
                  className={`flex items-center px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                    activeFilter === opt.key
                      ? "bg-chart-1 border-chart-1 hover:opacity-85"
                      : "bg-white border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <opt.icon
                    className={`w-5 h-5 ${activeFilter === opt.key ? "text-white" : "text-chart-1"}`}
                    strokeWidth={2}
                  />
                </button>
              ))}
            </div>
            {/* <DownloadButton /> */}
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative w-full transition-[height] duration-500"
          style={{ height: wrapperHeight || undefined }}
        >
          {dashboardCards.map((card) => {
            const isVisible = activeFilter === "all" || card.category.includes(activeFilter);
            const pos = isVisible ? (positions[card.id] ?? allPositions[card.id]) : allPositions[card.id];
            if (!pos) return null;

            return (
              <div
                key={card.id}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: pos.w,
                  height: pos.h,
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  opacity: isVisible ? 1 : 0,
                  pointerEvents: isVisible ? "auto" : "none",
                  overflow: "hidden",
                  transition:
                    "transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease, width 0.5s cubic-bezier(0.4,0,0.2,1), height 0.5s cubic-bezier(0.4,0,0.2,1)",
                  zIndex: isVisible ? 1 : 0,
                }}
              >
                {card.element}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
