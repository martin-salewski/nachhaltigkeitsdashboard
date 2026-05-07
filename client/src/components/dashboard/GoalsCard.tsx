import { useQuery } from "@tanstack/react-query";
import { Timeline } from "../ui/timeline";
import type { TimelineItem } from "../ui/timeline";
import gsap from "gsap";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useRef, useCallback, useEffect } from "react";
import { Info, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SustainabilityGoal {
  id: number;
  title: string;
  description: string | null;
  targetYear: number;
  targetValue: number | null;
  unit: string | null;
  isCompleted: number;
}

async function fetchGoals(): Promise<SustainabilityGoal[]> {
  const res = await fetch("http://localhost:3000/api/sustainability_goals");
  if (!res.ok) throw new Error("Failed to fetch sustainability goals");
  return res.json();
}

export function GoalsCard() {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);

  const { data: goals = [] } = useQuery({
    queryKey: ["sustainability_goals"],
    queryFn: fetchGoals,
  });

  const items: TimelineItem[] = goals.map((g) => ({
    title: t(`goals.items.${g.id}.title`, { defaultValue: g.title })
      + (g.targetValue && g.unit ? ` (${g.targetValue}${g.unit})` : ""),
    year: g.targetYear,
    completed: g.isCompleted === 1,
    completedLabel: t("goals.completed"),
  }));

  useEffect(() => {
    if (!frontRef.current || !backRef.current) return;
    frontRef.current.style.visibility = "visible";
    backRef.current.style.visibility = "hidden";
  }, []);

  const flipCard = useCallback(() => {
    if (isAnimating || !cardRef.current || !frontRef.current || !backRef.current) return;
    setIsAnimating(true);
    const tl = gsap.timeline({
      onComplete: () => { setIsFlipped((prev) => !prev); setIsAnimating(false); },
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
    <div className="perspective-[1000px] w-full h-full" style={{ fontFamily: '"SimStd", sans-serif' }}>
      <div ref={cardRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {/* FRONT */}
        <div ref={frontRef} style={{ backfaceVisibility: "hidden" }} className="backface-hidden h-full w-full">
          <Card className="relative w-full h-full">
            <CardHeader className="pb-1">
              <CardTitle className="flex flex-col gap-2">
                <h1 className="title">{t("goals.title")}</h1>
                <Separator className="bg-black/10 h-2" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {items.length > 0 ? (
                <Timeline items={items} />
              ) : (
                <p className="text-sm text-muted-foreground">{t("loading")}</p>
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
              <p>{t("goals.description")}</p>
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
