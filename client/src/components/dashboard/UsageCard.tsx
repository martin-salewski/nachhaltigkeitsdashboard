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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Info, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import gsap from "gsap";
import { useTranslation } from "react-i18next";

interface EnergyConsumptionRow {
  id: number;
  year: number;
  month: number;
  day: number | null;
  type: string;
  valueKwh: number;
}


const TYPE_COLORS: Record<string, string> = {
  Strom:     "#2B76BB",
  Gas:       "#1D3A6A",
  Fernwärme: "#4DBAF7",
};

const chartConfig = {
  Strom:     { label: "Strom (kWh)",     color: "#2B76BB" },
  Gas:       { label: "Gas (kWh)",       color: "#1D3A6A" },
  Fernwärme: { label: "Fernwärme (kWh)", color: "#4DBAF7" },
} satisfies ChartConfig;

async function fetchEnergyConsumption(year?: number, type?: string): Promise<EnergyConsumptionRow[]> {
  const params = new URLSearchParams();
  if (year) params.set("year", year.toString());
  if (type) params.set("type", type);
  const url = `/api/energy_consumption${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch energy consumption");
  return res.json();
}

async function fetchYears(): Promise<{ year: number; month: number }[]> {
  const res = await fetch("/api/energy_consumption/periods");
  if (!res.ok) throw new Error("Failed to fetch periods");
  return res.json();
}

export function UsageCard() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const { data: periods = [] } = useQuery({
    queryKey: ["energy-consumption-periods"],
    queryFn: fetchYears,
  });

  const years = useMemo(
    () => [...new Set(periods.map((p) => p.year))].sort((a, b) => b - a),
    [periods]
  );

  useEffect(() => {
    if (years.length > 0 && !selectedYear) {
      setSelectedYear(String(years[0]));
    }
  }, [years, selectedYear]);

  const activeYear = selectedYear ? parseInt(selectedYear) : years[0];

  const { data: rawData = [], isLoading } = useQuery({
    queryKey: ["energy_consumption", activeYear],
    queryFn: () => fetchEnergyConsumption(activeYear),
    enabled: !!activeYear,
  });

  const monthNames = t("usage.months", { returnObjects: true }) as string[];

  // Build chart data: one point per month, one key per type
  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthRows = rawData.filter((r) => r.month === month);
      const entry: Record<string, number | string> = { month: monthNames[i] };
      const types = selectedType === "all" ? ["Strom", "Gas", "Fernwärme"] : [selectedType];
      for (const type of types) {
        const row = monthRows.find((r) => r.type === type);
        entry[type] = row?.valueKwh ?? 0;
      }
      return entry;
    });
  }, [rawData, selectedType, monthNames]);

  const activeTypes = selectedType === "all" ? ["Strom", "Gas", "Fernwärme"] : [selectedType];

  useEffect(() => {
    if (!frontRef.current || !backRef.current) return;
    frontRef.current.style.visibility = "visible";
    backRef.current.style.visibility = "hidden";
  }, []);

  const flipCard = useCallback(() => {
    if (isAnimating || !cardRef.current || !frontRef.current || !backRef.current) return;
    setIsAnimating(true);
    const timeline = gsap.timeline({
      onComplete: () => { setIsFlipped((prev) => !prev); setIsAnimating(false); },
    });
    if (!isFlipped) {
      timeline
        .to(cardRef.current, { rotateY: 90, duration: 0.3, ease: "power2.in" })
        .set(frontRef.current, { visibility: "hidden" })
        .set(backRef.current, { visibility: "visible" })
        .to(cardRef.current, { rotateY: 180, duration: 0.3, ease: "power2.out" });
    } else {
      timeline
        .to(cardRef.current, { rotateY: 90, duration: 0.3, ease: "power2.in" })
        .set(backRef.current, { visibility: "hidden" })
        .set(frontRef.current, { visibility: "visible" })
        .to(cardRef.current, { rotateY: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [isFlipped, isAnimating]);

  return (
    <div className="perspective-[1000px] h-full" style={{ fontFamily: '"SimStd", sans-serif' }}>
      <div ref={cardRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {/* FRONT */}
        <div ref={frontRef} className="backface-hidden h-full w-full" style={{ backfaceVisibility: "hidden" }}>
          <Card className="relative h-full w-full">
            <CardHeader>
              <CardTitle className="text-base font-medium text-foreground/90 flex flex-col gap-2">
                <h1 className="title">{t("usage.title")}</h1>
                <Separator className="bg-black/10 h-2" />
                <div className="flex gap-2 w-full justify-end">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="selector">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("filter.all")}</SelectItem>
                      <SelectItem value="Strom">{t("filter.electricity")}</SelectItem>
                      <SelectItem value="Gas">Gas</SelectItem>
                      <SelectItem value="Fernwärme">Fernwärme</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="selector">
                      <SelectValue placeholder={t("year")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{t("year")}</SelectLabel>
                        {years.map((y) => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse text-muted-foreground text-sm">{t("loading")}</div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">{t("noData")}</div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[140px] w-full">
                  <LineChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#e5e7eb" />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={4}
                      width={40}
                      tick={{ fontSize: 9 }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={6}
                      tick={{ fontSize: 10 }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => [
                            `${Number(value).toLocaleString("de-DE")} kWh`,
                            name,
                          ]}
                        />
                      }
                    />
                    {activeTypes.map((type) => (
                      <Line
                        key={type}
                        dataKey={type}
                        type="linear"
                        stroke={TYPE_COLORS[type]}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
            <button
              onClick={flipCard}
              disabled={isAnimating}
              className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10 disabled:opacity-50 cursor-pointer"
              aria-label="Mehr Informationen"
            >
              <Info className="size-4" />
            </button>
          </Card>
        </div>

        {/* BACK */}
        <div
          ref={backRef}
          className="absolute inset-0 backface-hidden h-full w-full"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", visibility: "hidden" }}
        >
          <Card className="relative h-full">
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-medium text-foreground/90">{t("cardBack.title")}</CardTitle>
            </CardHeader>
            <Separator className="mb-2 bg-black/10" />
            <CardContent className="pt-2 text-sm text-muted-foreground space-y-3 text-justify">
              <p>{t("usage.description")}</p>
            </CardContent>
            <button
              onClick={flipCard}
              disabled={isAnimating}
              className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10 disabled:opacity-50 cursor-pointer"
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
