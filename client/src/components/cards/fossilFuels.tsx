import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, X } from "lucide-react";

function FossilFuels() {
  const heading = "Fossile Brennstoffe";
  const erdoel = "Erdöl";
  const erdgas = "Erdgas";

  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);

  // initial: front visible, back hidden
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
        setIsFlipped((p) => !p);
        setIsAnimating(false);
      },
    });

    if (!isFlipped) {
      tl.to(cardRef.current, { rotateY: 90, duration: 0.3, ease: "power2.in" })
        .set(frontRef.current, { visibility: "hidden" })
        .set(backRef.current, { visibility: "visible" })
        .to(cardRef.current, {
          rotateY: 180,
          duration: 0.3,
          ease: "power2.out",
        });
    } else {
      tl.to(cardRef.current, { rotateY: 90, duration: 0.3, ease: "power2.in" })
        .set(backRef.current, { visibility: "hidden" })
        .set(frontRef.current, { visibility: "visible" })
        .to(cardRef.current, { rotateY: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [isFlipped, isAnimating]);

  return (
    <div className="perspective-[1000px] h-full">
      <div
        ref={cardRef}
        className="relative h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <div ref={frontRef} style={{ backfaceVisibility: "hidden" }}>
          <Card className="relative h-full w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-foreground/90 flex flex-col gap-2">
                <h1 className="font-['SimStd'] font-bold text-black/60 text-[10px]">
                  {heading}
                </h1>
                <Separator className="bg-black/10 h-2" />
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex justify-between mt-2">
                <div className="flex flex-col">
                  <p className="text-[10px] text-black/50">{erdoel}</p>
                  <p className="text-sm font-bold text-black/80">20 t</p>
                </div>

                <div className="flex flex-col">
                  <p className="text-[10px] text-black/50">{erdgas}</p>
                  <p className="text-sm font-bold text-black/80">10 t</p>
                </div>
              </div>
            </CardContent>

            {/* Info button like Emissions */}
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
          className="absolute inset-0"
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
            <CardContent className="pt-2 text-sm text-muted-foreground"></CardContent>

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

export default FossilFuels;
