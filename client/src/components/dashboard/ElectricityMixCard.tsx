import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useQuery } from "@tanstack/react-query";
import { DonutChart } from "../ui/donutchart_electricity";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EnergyMixRow {
  id: number;
  year: number;
  source: string;
  percentage: number;
}

const SOURCE_ORDER = ["Solar", "Wind", "Wasserkraft", "Biomasse", "Erdgas", "Kohle"];

const SOURCE_I18N: Record<string, string> = {
  Solar:      "energySources.solar",
  Wind:       "energySources.wind",
  Wasserkraft:"energySources.hydro",
  Biomasse:   "energySources.biomass",
  Erdgas:     "energySources.naturalGas",
  Kohle:      "energySources.coal",
};

async function fetchEnergyMix(): Promise<EnergyMixRow[]> {
  const res = await fetch("/api/energy_mix");
  if (!res.ok) throw new Error("Failed to fetch energy mix");
  return res.json();
}

function ElectricityMix() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);

  const { data: allData = [] } = useQuery({
    queryKey: ["energy_mix"],
    queryFn: fetchEnergyMix,
  });

  const years = [...new Set(allData.map((r) => r.year))].sort((a, b) => b - a);

  // Default to latest year once data loads
  useEffect(() => {
    if (years.length > 0 && !selectedYear) {
      setSelectedYear(String(years[0]));
    }
  }, [years.length]);

  const activeYear = selectedYear ? parseInt(selectedYear) : years[0];
  const yearData = allData.filter((r) => r.year === activeYear);
  const sources = SOURCE_ORDER.filter((s) => yearData.some((r) => r.source === s));
  const labels = sources.map((s) => t(SOURCE_I18N[s] ?? s));
  const chartData = sources.map((source) => yearData.find((r) => r.source === source)?.percentage ?? 0);

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
    <div className="perspective-[1000px] h-full w-full">
      <div ref={cardRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {/* FRONT */}
        <div ref={frontRef} style={{ backfaceVisibility: "hidden" }} className="backface-hidden h-full w-full">
          <Card className="relative h-full w-full">
            <CardHeader>
              <CardTitle>
                <h1 className="title">{t("electricityMix.title")}</h1>
                <Separator className="bg-black/10 h-2 mb-2" />
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
            <CardContent>
              <DonutChart labels={labels} data={chartData} />
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
          <Card className="relative h-full w-full">
            <CardHeader className="mb-1">
              <CardTitle className="text-base font-medium text-foreground/90">{t("cardBack.title")}</CardTitle>
            </CardHeader>
            <Separator className="mb-2 bg-black/10" />
            <CardContent className="mt-2 text-sm text-muted-foreground text-justify">
              <p>{t("electricityMix.description")}</p>
            </CardContent>
            <button
              onClick={flipCard}
              disabled={isAnimating}
              className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10 disabled:opacity-50 cursor-pointer"
              aria-label="Zurück"
            >
              <X className="size-4" />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ElectricityMix;
