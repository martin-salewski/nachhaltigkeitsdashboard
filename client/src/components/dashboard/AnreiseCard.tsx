import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
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

interface CommuteData {
  id: number;
  year: number;
  month: number;
  mode: string;
  percentage: number;
  personCount: number | null;
}

interface Period {
  year: number;
  semester: number;
  label: string;
}


// Color mapping for transport modes
const MODE_COLORS: Record<string, string> = {
  "zu Fuß": "#7DB8FF",
  Fahrrad: "#4DBAF7",
  Auto: "#2B76BB",
  ÖPNV: "#1D3A6A",
};

// Chart configuration for transport modes
const chartConfig = {
  percentage: {
    label: "Anteil",
  },
  zuFuss: {
    label: "zu Fuß",
    color: "#7DB8FF",
  },
  Fahrrad: {
    label: "Fahrrad",
    color: "#4DBAF7",
  },
  Auto: {
    label: "Auto",
    color: "#2B76BB",
  },
  OEPNV: {
    label: "ÖPNV",
    color: "#1D3A6A",
  },
} satisfies ChartConfig;

async function fetchCommuteStats(
  year?: number,
  semester?: number,
  category?: string
): Promise<CommuteData[]> {
  const params = new URLSearchParams();
  if (year) params.set("year", year.toString());
  if (semester) params.set("semester", semester.toString());
  if (category) params.set("category", category);

  const url = `/api/commute-stats${
    params.toString() ? `?${params}` : ""
  }`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch commute stats");
  return res.json();
}

async function fetchPeriods(): Promise<Period[]> {
  const res = await fetch("/api/commute-stats/periods");
  if (!res.ok) throw new Error("Failed to fetch periods");
  return res.json();
}

export function AnreiseCard() {
  const { t } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState<string>("gesamt");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const { data: periods = [] } = useQuery({
    queryKey: ["commute-periods"],
    queryFn: fetchPeriods,
  });

  // Set default period to the latest one when periods load
  useEffect(() => {
    if (periods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(`${periods[0].year}-${periods[0].semester}`);
    }
  }, [periods, selectedPeriod]);

  // Parse selected period into year and semester
  const { selectedYear, selectedSemester } = useMemo(() => {
    if (!selectedPeriod)
      return { selectedYear: undefined, selectedSemester: undefined };
    const [year, semester] = selectedPeriod.split("-").map(Number);
    return { selectedYear: year, selectedSemester: semester };
  }, [selectedPeriod]);

  // Get the label for the selected period
  const selectedPeriodLabel = useMemo(() => {
    const period = periods.find(
      (p) => p.year === selectedYear && p.semester === selectedSemester
    );
    return period?.label || "";
  }, [periods, selectedYear, selectedSemester]);

  const { data: commuteData = [], isLoading } = useQuery({
    queryKey: [
      "commute-stats",
      selectedYear,
      selectedSemester,
      selectedCategory,
    ],
    queryFn: () =>
      fetchCommuteStats(selectedYear, selectedSemester, selectedCategory),
    enabled: !!selectedYear && !!selectedSemester,
  });

  // Transform data for recharts - sort by personCount descending
  const chartData = useMemo(() => {
    return [...commuteData]
      .sort((a, b) => (b.personCount || 0) - (a.personCount || 0))
      .map((item) => ({
        mode: item.mode,
        count: item.personCount || 0,
        percentage: `${Math.round(item.percentage)}%`,
        fill: MODE_COLORS[item.mode] || "#3a6b8c",
      }));
  }, [commuteData]);

  // Calculate max value for chart domain
  const maxCount = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.count), 0);
    // Round up to nearest 1000 for evenly spaced ticks
    return Math.ceil(max / 1000) * 1000;
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
      // Flip to back
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
      // Flip to front
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
      className="perspective-[1000px] h-full w-full"
      style={{ fontFamily: '"SimStd", sans-serif' }}
    >
      <div
        ref={cardRef}
        className="relative transform-style-3d h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div
          ref={frontRef}
          className="backface-hidden h-full w-full"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Card className="relative h-full w-full" data-card-id="travel">
            <CardHeader className="">
              <CardTitle className="flex flex-col gap-2">
                <h1 className="title">{t("commute.title")}</h1>
                <Separator className="bg-black/10 h-2" />
                <div className="flex gap-2 w-full justify-end">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger
                      size="sm"
                      className="selector"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gesamt">{t("filter.all")}</SelectItem>
                      <SelectItem value="studierende">{t("filter.students")}</SelectItem>
                      <SelectItem value="mitarbeiter">{t("filter.employees")}</SelectItem>
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
                      <SelectValue placeholder={t("semester")} />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem
                          key={`${period.year}-${period.semester}`}
                          value={`${period.year}-${period.semester}`}
                        >
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 min-w-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-full w-full">
                  <div className="animate-pulse text-muted-foreground text-sm">
                    {t("loading")}
                  </div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full w-full text-muted-foreground text-sm">
                  {t("noData")}
                </div>
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="h-full w-full mt-2"
                >
                  <BarChart
                    accessibilityLayer
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 0, right: 50 }}
                  >
                    <CartesianGrid
                      horizontal={false}
                      strokeDasharray="4 4"
                      stroke="#e5e7eb"
                    />
                    <YAxis
                      dataKey="mode"
                      type="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      width={60}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        chartConfig[value as keyof typeof chartConfig]?.label ??
                        value
                      }
                    />
                    <XAxis
                      dataKey="count"
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => value.toLocaleString("de-DE")}
                      domain={[0, maxCount]}
                      tickCount={5}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          hideLabel
                          formatter={(value) => [
                            `${Number(value).toLocaleString("de-DE")} ${t("persons")}`,
                            "",
                          ]}
                        />
                      }
                    />
                    <Bar
                      dataKey="count"
                      layout="vertical"
                      radius={[0, 4, 4, 0]}
                      barSize={28}
                    >
                      <LabelList
                        dataKey="percentage"
                        position="right"
                        offset={12}
                        className="fill-black/60 text-[11px]"
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
            {/* Info icon */}
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
          <Card className="relative h-full w-full">
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-medium text-foreground/90">
                {t("cardBack.title")}
              </CardTitle>
            </CardHeader>
            <Separator className="mb-2" />
            <CardContent className="pt-2 overflow-hidden">
              <div className="space-y-4 text-sm text-muted-foreground text-justify">
                <p>
                  <strong className="text-foreground text">{t("commute.title")}</strong> {t("commute.description")}
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">{t("categories")}</h4>
                  <ul className="space-y-1 text-xs">
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#1D3A6A]" />
                      <span>{t("commute.cat.oepnv")}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#2B76BB]" />
                      <span>{t("commute.cat.auto")}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#4DBAF7]" />
                      <span>{t("commute.cat.bicycle")}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#7DB8FF]" />
                      <span>{t("commute.cat.walking")}</span>
                    </li>
                  </ul>
                </div>
                <p className="text-xs">
                  {t("commute.dataSource")} {selectedPeriodLabel}
                </p>
              </div>
            </CardContent>
            {/* Close icon */}
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
