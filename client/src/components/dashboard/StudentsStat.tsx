import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TrendBadge } from "@/components/ui/TrendBadge";

interface PeopleStatsRecord {
  year: number;
  month: number;
  students: number;
  employees: number;
  professors: number;
}

async function fetchPeopleStatsRecord(): Promise<PeopleStatsRecord[]> {
  const url = "http://localhost:3000/api/people_stats?latest=2";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch people stats");
  return res.json();
}

function usePeopleStats() {
  return useQuery({
    queryKey: ["students_stat"],
    queryFn: fetchPeopleStatsRecord,
  });
}

export function StudentsStat() {
  const { t } = useTranslation();
  const { data, isFetching, isPending } = usePeopleStats();
  const current = data?.[0]?.students ?? 0;
  const previous = data?.[1]?.students ?? 0;
  const students = current;

  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!frontRef.current || !backRef.current) return;
    frontRef.current.style.visibility = "visible";
    backRef.current.style.visibility = "hidden";
  }, []);

  const flipCard = useCallback(() => {
    if (isAnimating || !cardRef.current || !frontRef.current || !backRef.current) return;

    setIsAnimating(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsFlipped((prev) => !prev);
        setIsAnimating(false);
      },
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
        <div ref={frontRef} style={{ backfaceVisibility: "hidden" }}>
          <Card className="absolute inset-0 h-full w-full" style={{ fontFamily: '"SimStd", sans-serif' }}>
            <CardContent>
              <div className="w-full h-full flex items-start flex-col gap-0.5">
                <div className="flex flex-row gap-x-3 items-baseline mt-4">
                  <p className="text-5xl font-bold text-black/80">
                    {isPending ? "…" : students}
                  </p>
                  {!isPending && previous > 0 && (
                    <TrendBadge current={current} previous={previous} />
                  )}
                </div>
                <Separator className="bg-black/10 h-2 w-full" />
                <h1 className="title">{t("students.title")}</h1>
                {isFetching && <p className="text-xs text-black/40 mt-1">{t("loading")}</p>}
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

        <div
          ref={backRef}
          className="absolute inset-0 h-full w-full"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", visibility: "hidden" }}
        >
          <Card className="relative h-full w-full" style={{ fontFamily: '"SimStd", sans-serif' }}>
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-medium text-foreground/90">{t("cardBack.title")}</CardTitle>
            </CardHeader>
            <Separator className="mb-1 bg-black/10" />
            <CardContent className="pt-1 text-xs leading-relaxed text-muted-foreground text-justify">
              <p>{t("students.description")}</p>
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
