import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
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

interface WasteRow {
  id: number;
  year: number;
  week: number;
  category: string;
  valueTons: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Papier: "#7DB8FF",
  Rest: "#1D3A6A",
  Bio: "#4D719C",
  "Gelber Sack": "#4DBAF7",
};

const WASTE_I18N: Record<string, string> = {
  Papier:        "wasteCategories.paper",
  Rest:          "wasteCategories.residual",
  Bio:           "wasteCategories.organic",
  "Gelber Sack": "wasteCategories.recyclable",
};

const chartConfig = {
  valueTons:     { label: "Tonnen" },
  Papier:        { label: "Papier",      color: "#7DB8FF" },
  Rest:          { label: "Restmüll",    color: "#1D3A6A" },
  Bio:           { label: "Biomüll",     color: "#4D719C" },
  "Gelber Sack": { label: "Gelber Sack", color: "#4DBAF7" },
} satisfies ChartConfig;

async function fetchWaste(year?: number): Promise<WasteRow[]> {
  const url = year
    ? `/api/waste?year=${year}`
    : `/api/waste`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch waste data");
  return res.json();
}

export function TrashCard() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const { data: allData = [] } = useQuery({
    queryKey: ["waste"],
    queryFn: () => fetchWaste(),
  });

  const years = useMemo(
    () => [...new Set(allData.map((r) => r.year))].sort((a, b) => b - a),
    [allData]
  );

  useEffect(() => {
    if (years.length > 0 && !selectedYear) {
      setSelectedYear(String(years[0]));
    }
  }, [years, selectedYear]);

  const chartData = useMemo(() => {
    const year = selectedYear ? parseInt(selectedYear) : years[0];
    const yearRows = allData.filter((r) => r.year === year);
    const categories = ["Papier", "Rest", "Bio", "Gelber Sack"];
    return categories.map((cat) => {
      const rows = yearRows.filter((r) => r.category === cat);
      const total = rows.reduce((sum, r) => sum + r.valueTons, 0);
      return {
        category: t(WASTE_I18N[cat] ?? cat),
        valueTons: Math.round(total * 10) / 10,
        fill: CATEGORY_COLORS[cat] ?? "#3a6b8c",
      };
    });
  }, [allData, selectedYear, years, t]);


  useEffect(() => {
    if (!frontRef.current || !backRef.current) return;
    frontRef.current.style.visibility = "visible";
    backRef.current.style.visibility = "hidden";
  }, []);

  const flipCard = useCallback(() => {
    if (isAnimating || !cardRef.current || !frontRef.current || !backRef.current)
      return;

    setIsAnimating(true);
    const timeline = gsap.timeline({
      onComplete: () => {
        setIsFlipped((prev) => !prev);
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
      className="perspective-[1000px] flex h-full w-full"
      style={{ fontFamily: '"SimStd", sans-serif' }}
    >
      <div
        ref={cardRef}
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <div
          ref={frontRef}
          className="backface-hidden h-full w-full"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Card className="relative h-full w-full">
            <CardHeader>
              <CardTitle className="text-base font-medium text-foreground/90 flex flex-col gap-2">
                <h1 className="title">{t("trash.title")}</h1>
                <Separator className="bg-black/10 h-2" />
                <div className="flex w-full justify-end">
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
            <CardContent className="pb-6">
              <ChartContainer config={chartConfig} className="h-[140px] w-full">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ left: 0, right: 50, top: 0, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="4 4" stroke="#e5e7eb" />
                  <YAxis
                    dataKey="category"
                    type="category"
                    tickLine={false}
                    tickMargin={8}
                    axisLine={false}
                    width={88}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => v}
                  />
                  <XAxis
                    dataKey="valueTons"
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `${v} t`}
                  />
                  <Tooltip
                    cursor={false}
                    formatter={(value) => [`${value} t`, "Gesamt"]}
                  />
                  <Bar dataKey="valueTons" layout="vertical" radius={[0, 4, 4, 0]} barSize={22}>
                    <LabelList
                      dataKey="valueTons"
                      position="right"
                      offset={8}
                      className="fill-black/60 text-[11px]"
                      formatter={(v: number) => `${v} t`}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
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
            <Separator className="mb-2 bg-black/10" />
            <CardContent className="pt-2 text-sm text-muted-foreground space-y-3 text-justify">
              <p>{t("trash.description")}</p>
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
