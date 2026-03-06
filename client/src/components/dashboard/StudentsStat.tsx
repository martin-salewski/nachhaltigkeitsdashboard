import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PeopleStatsRecord {
  year: number;
  month: number;
  students: number;
  employees: number;
  professors: number;
}

async function fetchPeopleStatsRecord(): Promise<PeopleStatsRecord[]> {
  const url = "http://localhost:3000/api/people_stats?latest=1";
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
  const { data, isFetching, isPending } = usePeopleStats();
  const row = data?.[0];
  const students = row?.students ?? 0;

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
              <div className="w-full h-full flex items-start flex-col">
                <div className="flex flex-row gap-x-3 items-baseline">
                  <p className="text-5xl font-bold text-black/80 mt-4">
                    {isPending ? "…" : students}
                  </p>
                </div>
                <Separator className="bg-black/10 h-2 w-full" />
                <h1 className="title">StudentInnen</h1>
                {isFetching && <p className="text-xs text-black/40 mt-1">aktualisiere…</p>}
              </div>
            </CardContent>

            <button
              onClick={flipCard}
              disabled={isAnimating}
              className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10 disabled:opacity-50"
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
            <CardContent className="h-full w-full"></CardContent>

            <button
              onClick={flipCard}
              disabled={isAnimating}
              className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10 disabled:opacity-50"
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