import gsap from "gsap";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, X } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface FossilFuelRow {
  id: number;
  year: number;
  type: string;
  valueTons: number;
}

async function fetchFossilFuels(): Promise<FossilFuelRow[]> {
  const res = await fetch("http://localhost:3000/api/fossil_fuels");
  if (!res.ok) throw new Error("Failed to fetch fossil fuels");
  return res.json();
}

function FossilFuels() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);

  const { data: allData = [] } = useQuery({
    queryKey: ["fossil_fuels"],
    queryFn: fetchFossilFuels,
  });

  const years = [...new Set(allData.map((r) => r.year))].sort((a, b) => b - a);

  useEffect(() => {
    if (years.length > 0 && !selectedYear) {
      setSelectedYear(String(years[0]));
    }
  }, [years.length]);

  const activeYear = selectedYear ? parseInt(selectedYear) : years[0];
  const yearData = allData.filter((r) => r.year === activeYear);
  const erdoel = yearData.find((r) => r.type === "Erdöl")?.valueTons;
  const erdgas = yearData.find((r) => r.type === "Erdgas")?.valueTons;

  useEffect(() => {
    if (!frontRef.current || !backRef.current) return;
    frontRef.current.style.visibility = "visible";
    backRef.current.style.visibility = "hidden";
  }, []);

  const flipCard = useCallback(() => {
    if (isAnimating || !cardRef.current || !frontRef.current || !backRef.current) return;
    setIsAnimating(true);
    const tl = gsap.timeline({
      onComplete: () => { setIsFlipped((p) => !p); setIsAnimating(false); },
    });
    if (!isFlipped) {
      tl.to(cardRef.current, { rotateY: 90, duration: 0.3, ease: "power2.in" })
        .set(frontRef.current, { visibility: "hidden" })
        .set(backRef.current, { visibility: "visible" })
        .to(cardRef.current, { rotateY: 180, duration: 0.3, ease: "power2.out" });
    } else {
      tl.to(cardRef.current, { rotateY: 90, duration: 0.3, ease: "power2.in" })
        .set(backRef.current, { visibility: "hidden" })
        .set(frontRef.current, { visibility: "visible" })
        .to(cardRef.current, { rotateY: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [isFlipped, isAnimating]);

  return (
    <div className="perspective-[1000px] h-full w-full">
      <div ref={cardRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {/* FRONT */}
        <div ref={frontRef} style={{ backfaceVisibility: "hidden" }}>
          <Card className="relative h-full w-full">
            <CardContent>
              <div className="w-full flex flex-col">
                <h1 className="title">{t("fossilFuels.title")}</h1>
                <Separator className="bg-black/10 h-2 w-full mt-1 mb-3" />
                <div className="flex flex-row justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm text-black/50">{t("fossilFuels.oil")}</p>
                    <p className="text-sm font-bold text-black/80">
                      {erdoel !== undefined ? `${erdoel} t` : "—"}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-black/50">{t("fossilFuels.gas")}</p>
                    <p className="text-sm font-bold text-black/80">
                      {erdgas !== undefined ? `${erdgas} t` : "—"}
                    </p>
                  </div>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger size="sm" className="w-fit px-2 py-1 text-xs">
                      <SelectValue placeholder={t("year")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{t("year")}</SelectLabel>
                        {years.map((y) => (
                          <SelectItem key={y} className="text-xs" value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
          className="absolute inset-0 h-full w-full"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", visibility: "hidden" }}
        >
          <Card className="relative h-full gap-2">
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-medium text-foreground/90">{t("cardBack.title")}</CardTitle>
            </CardHeader>
            <Separator className="mb-2 bg-black/10" />
            <CardContent className="pt-2 text-sm text-muted-foreground" />
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

export default FossilFuels;
