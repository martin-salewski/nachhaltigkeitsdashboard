import { useQuery } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Info, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import gsap from "gsap";

interface EmissionsData {
  id: number;
  year: number;
  month: number;
  day: number;
  category: string;
  valueCo2Kg: number;
}

interface Period {
  year: number;
  month: number;
  label: string;
}

const MONTH_NAMES = [
  "jan",
  "feb",
  "mär",
  "apr",
  "mai",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "dez",
];

// Chart configuration
const chartConfig = {
  valueCo2Kg: {
    label: "CO₂ (kg)",
    color: "#2B76BB",
  },
} satisfies ChartConfig;

async function fetchEmissions(
  year?: number,
  month?: number,
  category?: string
): Promise<EmissionsData[]> {
  const params = new URLSearchParams();
  if (year) params.set("year", year.toString());
  if (month) params.set("month", month.toString());
  if (category) params.set("category", category);

  const url = `http://localhost:3000/api/emissions${
    params.toString() ? `?${params}` : ""
  }`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch emissions");
  return res.json();
}

async function fetchPeriods(): Promise<Period[]> {
  const res = await fetch("http://localhost:3000/api/emissions/periods");
  if (!res.ok) throw new Error("Failed to fetch periods");
  return res.json();
}

export function UsageCard() {
  const [selectedCategory, setSelectedCategory] = useState<string>("gesamt");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const { data: periods = [] } = useQuery({
    queryKey: ["emissions-periods"],
    queryFn: fetchPeriods,
  });

  // Set default period to the latest one when periods load
  useEffect(() => {
    if (periods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(`${periods[0].year}-${periods[0].month}`);
    }
  }, [periods, selectedPeriod]);

  // Parse selected period into year and month
  const { selectedYear, selectedMonth } = useMemo(() => {
    if (!selectedPeriod)
      return { selectedYear: undefined, selectedMonth: undefined };
    const [year, month] = selectedPeriod.split("-").map(Number);
    return { selectedYear: year, selectedMonth: month };
  }, [selectedPeriod]);

  // Get the label for the selected period
  const selectedPeriodLabel = useMemo(() => {
    if (!selectedMonth) return "";
    return MONTH_NAMES[selectedMonth - 1];
  }, [selectedMonth]);

  const { data: emissionsData = [], isLoading } = useQuery({
    queryKey: ["emissions", selectedYear, selectedMonth, selectedCategory],
    queryFn: () =>
      fetchEmissions(selectedYear, selectedMonth, selectedCategory),
    enabled: !!selectedYear && !!selectedMonth,
  });

  // Transform data for recharts
  const chartData = useMemo(() => {
    return emissionsData.map((item) => ({
      day: item.day,
      value: item.valueCo2Kg,
    }));
  }, [emissionsData]);

  // Calculate max value for chart domain (round to nearest 20 for nice 5-tick divisions)
  const maxValue = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.value), 0);
    return Math.ceil(max / 20) * 20;
  }, [chartData]);

  const flipCard = useCallback(() => {
    if (
      isAnimating ||
      !cardRef.current ||
      !frontRef.current ||
      !backRef.current
    )
      return;

    setIsAnimating(true);
    const timeline = gsap.timeline({
      onComplete: () => {
        setIsFlipped(!isFlipped);
        setIsAnimating(false);
      },
    });

    if (!isFlipped) {
      timeline
        .to(cardRef.current, {
          rotateY: 90,
          duration: 0.3,
          ease: "power2.in",
        })
        .set(frontRef.current, { visibility: "hidden" })
        .set(backRef.current, { visibility: "visible" })
        .to(cardRef.current, {
          rotateY: 180,
          duration: 0.3,
          ease: "power2.out",
        });
    } else {
      timeline
        .to(cardRef.current, {
          rotateY: 90,
          duration: 0.3,
          ease: "power2.in",
        })
        .set(backRef.current, { visibility: "hidden" })
        .set(frontRef.current, { visibility: "visible" })
        .to(cardRef.current, {
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
        });
    }
  }, [isFlipped, isAnimating]);

  return (
    <div
      className="perspective-[1000px] h-full"
      style={{ fontFamily: '"SimStd", sans-serif' }}
    >
      <div
        ref={cardRef}
        className="relative h-full w-full transform-style-3d"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div
          ref={frontRef}
          className="backface-hidden h-full w-full"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Card className="relative h-full w-full" data-card-id="co2">
            <CardHeader className="">
              <CardTitle className="text-base font-medium text-foreground/90 flex flex-col gap-2">
                <h1 className="text-xl/4 font-bold text-black/60">
                  Verbrauch
                </h1>
                <Separator className="bg-black/10 h-2" />
                <div className="flex gap-2 w-full justify-end">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger
                      size="sm"
                      className="h-5 text-[10px] w-auto text-black/60 border-black/10 [&_svg]:text-black/60"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gesamt">gesamt</SelectItem>
                      <SelectItem value="strom">Strom</SelectItem>
                      <SelectItem value="heizung">Heizung</SelectItem>
                      <SelectItem value="mobilitaet">Mobilität</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedPeriod}
                    onValueChange={setSelectedPeriod}
                  >
                    <SelectTrigger
                      size="sm"
                      className="h-5 text-[10px] w-auto text-black/60 border-black/10 [&_svg]:text-black/60"
                    >
                      <SelectValue placeholder="Monat" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem
                          key={`${period.year}-${period.month}`}
                          value={`${period.year}-${period.month}`}
                        >
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse text-muted-foreground text-sm">
                    Laden...
                  </div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Keine Daten verfügbar
                </div>
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="h-full w-full"
                >
                  <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{ left: 0, right: 12, top: 12, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={true}
                      horizontal={true}
                      stroke="#e5e7eb"
                    />
                    <YAxis
                      dataKey="value"
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={35}
                      tick={{ fontSize: 10 }}
                      domain={[0, maxValue]}
                      ticks={[
                        0,
                        maxValue / 4,
                        maxValue / 2,
                        (maxValue * 3) / 4,
                        maxValue,
                      ]}
                    />
                    <XAxis
                      dataKey="day"
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 10 }}
                      domain={[1, 31]}
                      ticks={[1, 8, 15, 22, 29]}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          hideLabel
                          formatter={(value) => [
                            `${Number(value).toLocaleString("de-DE")} kg CO₂`,
                            "",
                          ]}
                        />
                      }
                    />
                    <Line
                      dataKey="value"
                      type="linear"
                      stroke="#2B76BB"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
            {/* Info icon */}
            <button
              onClick={flipCard}
              className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10"
              aria-label="Mehr Informationen"
            >
              <Info className="size-4" />
            </button>
          </Card>
        </div>

        {/* Back of card */}
        <div
          ref={backRef}
          className="absolute inset-0 backface-hidden h-full w-full"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            visibility: "hidden",
          }}
        >
          <Card className="relative h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-foreground/90">
                Über diese Karte
              </CardTitle>
            </CardHeader>
            <Separator className="mb-2" />
            <CardContent className="pt-2 overflow-hidden">
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Emissionen</strong> zeigt
                  die täglichen CO₂-Emissionen der Hochschule in Kilogramm.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Kategorien:</h4>
                  <ul className="space-y-1 text-xs">
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#2B76BB]" />
                      <span>Gesamt – Alle Emissionsquellen</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#4DBAF7]" />
                      <span>Strom – Stromverbrauch</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#1D3A6A]" />
                      <span>Heizung – Heizenergie</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#7DB8FF]" />
                      <span>Mobilität – Dienstreisen & Pendeln</span>
                    </li>
                  </ul>
                </div>
                <p className="text-xs">
                  Datenquelle: Energiemonitoring {selectedPeriodLabel}{" "}
                  {selectedYear}
                </p>
              </div>
            </CardContent>
            {/* Close icon */}
            <button
              onClick={flipCard}
              className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10"
              aria-label="Zurück zur Ansicht"
            >
              <X className="size-4" />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
