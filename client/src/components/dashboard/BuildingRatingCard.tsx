import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ChartRadialText } from "../ui/radialchart";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useTranslation } from "react-i18next";

interface BuildingRatingRecord {
  year: number
  month: number
  score: number
  co2PerPerson?: number | null
}

async function fetchBuildingRatingRecord(score?: number): Promise<BuildingRatingRecord[]> {
  const params = new URLSearchParams();
  if (score) params.set("score", String(score));

  const queryString = params.toString();
  const url = `http://localhost:3000/api/building_rating${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch building rating");
  return res.json();
}


export function BuildingRatingCard() {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);
  const [score, setScore] = useState<number | undefined>(undefined);
  const { data, isFetching, isPending } = useQuery({
    queryKey: ["building_rating", score],
    queryFn: () => fetchBuildingRatingRecord(score),
  });


  useEffect(() => {
    if (!frontRef.current || !backRef.current) return;
    frontRef.current.style.visibility = "visible";
    backRef.current.style.visibility = "hidden";
  }, []);

  const flipCard = useCallback(() => {
    if (
      isAnimating ||
      !cardRef.current ||
      !frontRef.current ||
      !backRef.current
    )
      return;

    setIsAnimating(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsFlipped((prev) => !prev);
        setIsAnimating(false);
      },
    });

    if (!isFlipped) {
      tl.to(cardRef.current, {
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
      tl.to(cardRef.current, {
        rotateY: 90,
        duration: 0.3,
        ease: "power2.in",
      })
        .set(backRef.current, { visibility: "hidden" })
        .set(frontRef.current, { visibility: "visible" })
        .to(cardRef.current,       {
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
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <div
          ref={frontRef}
          style={{ backfaceVisibility: "hidden" }}
          className="backface-hidden h-full w-full"
        >
          <Card className="relative h-full w-full pb-4">
            <CardHeader className="">
              <CardTitle>
                <h1 className="title mt-2">
                  {t("buildingRating.title")}
                </h1>
                <Separator className="bg-black/10 h-2" />
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-xs text-black/50 mb-3">
                {t("buildingRating.subtitle")}
              </p>

              {isPending || isPending ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse text-muted-foreground text-sm">
                    {t("loading")}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <div className="flex flex-row justify-center">
                      <ChartRadialText
                        score={Number(data?.[0]?.score ?? 10)}
                        size="md"
                      />
                    </div>
                  </div>
                </div>
              )}

              {isFetching && !(isPending || isPending) ? (
                <p className="mt-3 text-[10px] text-muted-foreground">
                  {t("updating")}
                </p>
              ) : null}
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
          <Card className="relative h-full">
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-medium text-foreground/90">
                {t("cardBack.title")}
              </CardTitle>
            </CardHeader>

            <Separator className="mb-2 bg-black/10" />

            <CardContent className="pt-2 text-sm text-muted-foreground space-y-3 text-justify">
              <p>
                {t("buildingRating.description")}
              </p>

              <div className="text-xs space-y-1">
                <p>
                  <span className="font-medium text-foreground">0–30:</span>{" "}
                  {t("buildingRating.score.low")}
                </p>
                <p>
                  <span className="font-medium text-foreground">31–70:</span>{" "}
                  {t("buildingRating.score.medium")}
                </p>
                <p>
                  <span className="font-medium text-foreground">71–100:</span>{" "}
                  {t("buildingRating.score.high")}
                </p>
              </div>
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
