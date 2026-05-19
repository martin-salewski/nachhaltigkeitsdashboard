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
import { useTranslation } from "react-i18next";

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
  "jan", "feb", "mär", "apr", "mai", "jun",
  "jul", "aug", "sep", "okt", "nov", "dez",
];

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

  const url = `/api/emissions${
    params.toString() ? `?${params}` : ""
  }`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch emissions");
  return res.json();
}

async function fetchPeriods(): Promise<Period[]> {
  const res = await fetch("/api/emissions/periods");
  if (!res.ok) throw new Error("Failed to fetch periods");
  return res.json();
}

export function EmissionsCard() {
  const { t } = useTranslation();
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

  useEffect(() => {
    if (periods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(`${periods[0].year}-${periods[0].month}`);
    }
  }, [periods, selectedPeriod]);

  const { selectedYear, selectedMonth } = useMemo(() => {
    if (!selectedPeriod)
      return { selectedYear: undefined, selectedMonth: undefined };
    const [year, month] = selectedPeriod.split("-").map(Number);
    return { selectedYear: year, selectedMonth: month };
  }, [selectedPeriod]);

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

  const chartData = useMemo(() => {
    return emissionsData.map((item) => ({
      day: item.day,
      value: item.valueCo2Kg,
    }));
  }, [emissionsData]);

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
    <div
      className="perspective-[1000px] h-full w-full"
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
              <CardTitle className="flex flex-col gap-2">
                <h1 className="title">{t("emissions.title")}</h1>
                <Separator className="bg-black/10 h-2" />
                <div className="flex gap-2 w-full justify-end">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="selector">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gesamt">{t("filter.all")}</SelectItem>
                      <SelectItem value="strom">{t("filter.electricity")}</SelectItem>
                      <SelectItem value="heizung">{t("filter.heating")}</SelectItem>
                      <SelectItem value="mobilitaet">{t("filter.mobility")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="selector">
                      <SelectValue placeholder={t("month")} />
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
                    {t("loading")}
                  </div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  {t("noData")}
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{ left: 0, right: 12, top: 12, bottom: 0 }}
                  >
                    <CartesianGrid vertical={true} horizontal={true} stroke="#e5e7eb" />
                    <YAxis
                      dataKey="value"
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={35}
                      tick={{ fontSize: 10 }}
                      domain={[0, maxValue]}
                      ticks={[0, maxValue / 4, maxValue / 2, (maxValue * 3) / 4, maxValue]}
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
            <button
              onClick={flipCard}
              className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10 cursor-pointer"
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
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-medium text-foreground/90">
                {t("cardBack.title")}
              </CardTitle>
            </CardHeader>
            <Separator className="mb-2" />
            <CardContent className="pt-2 overflow-hidden">
              <div className="space-y-4 text-sm text-muted-foreground text-justify">
                <p>
                  <strong className="text-foreground">{t("emissions.title")}</strong>{" "}
                  {t("emissions.description")}
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">{t("categories")}</h4>
                  <ul className="space-y-1 text-xs">
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#2B76BB]" />
                      <span>{t("emissions.cat.all")}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#4DBAF7]" />
                      <span>{t("emissions.cat.electricity")}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#1D3A6A]" />
                      <span>{t("emissions.cat.heating")}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#7DB8FF]" />
                      <span>{t("emissions.cat.mobility")}</span>
                    </li>
                  </ul>
                </div>
                <p className="text-xs">
                  {t("emissions.dataSource")} {selectedPeriodLabel}{" "}
                  {selectedYear}
                </p>
              </div>
            </CardContent>
            <button
              onClick={flipCard}
              className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10 cursor-pointer"
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
