import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ChartRadialText } from "../ui/radialchart";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function BuildingRatingCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);

  const { isPending, error, data, isFetching, isLoading } = useQuery({
    queryKey: ["score"],
    queryFn: async () => {
      const response = await fetch("/random-api?min=1&max=100");
      return await response.json();
    },
  });

  {
    isPending ? <div>Loading...</div> : null;
  }

  {
    isLoading ? <div>Loading...</div> : null;
  }

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
        .to(cardRef.current, {
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
        });
    }
  }, [isFlipped, isAnimating]);

  const score = Number(data?.[0] ?? 10);

  return (
    <div
      className="perspective-[1000px]"
      style={{ fontFamily: '"SimStd", sans-serif' }}
    >
      <div
        ref={cardRef}
        className="relative h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <div
          ref={frontRef}
          style={{ backfaceVisibility: "hidden" }}
          className="backface-hidden"
        >
          <Card className="relative h-full">
            <CardHeader className="">
              <CardTitle className="text-base font-medium text-foreground/90 flex flex-col gap-2">
                <h1 className="text-xl/4 font-bold text-black/60">
                  Gesamtbewertung des Gebäudes
                </h1>
                <Separator className="bg-black/10 h-2" />
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-xs text-black/50 mb-4">
                CO₂-Emissionen des Gebäudes pro Person im Monatsdurchschnitt
              </p>

              {isPending || isLoading ? (
                <div className="flex items-center justify-center h-[180px]">
                  <div className="animate-pulse text-muted-foreground text-sm">
                    Laden...
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <div className="flex flex-row justify-center">
                      <ChartRadialText score={Number(data?.[0] ?? 10)} />
                    </div>
                  </div>
                </div>
              )}

              {isFetching && !(isPending || isLoading) ? (
                <p className="mt-3 text-[10px] text-muted-foreground">
                  Aktualisiere…
                </p>
              ) : null}
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

        {/* BACK */}
        <div
          ref={backRef}
          className="absolute inset-0 backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            visibility: "hidden",
          }}
        >
          <Card className="relative h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-foreground/90">
                Über diese Karte
              </CardTitle>
            </CardHeader>

            <Separator className="mb-2 bg-black/10" />

            <CardContent className="pt-2 text-sm text-muted-foreground space-y-3">
              <p>
                Diese Bewertung fasst Kennzahlen zur Gebäude-Performance
                zusammen. Der Score wird aus den CO₂-Emissionen pro Person
                (Monatsdurchschnitt) abgeleitet.
              </p>

              <div className="text-xs space-y-1">
                <p>
                  <span className="font-medium text-foreground">0–30:</span>{" "}
                  kritisch
                </p>
                <p>
                  <span className="font-medium text-foreground">31–70:</span>{" "}
                  mittel
                </p>
                <p>
                  <span className="font-medium text-foreground">71–100:</span>{" "}
                  gut
                </p>
              </div>
            </CardContent>

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
