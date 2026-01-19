import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, X } from "lucide-react";

interface StatCardProps {
  value: string;
  label: string;
  change?: string;
  changeType?: "positive" | "negative";
}

export function StatCard({ value, label, change, changeType }: StatCardProps) {
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
          <Card
            className="relative h-full"
            style={{ fontFamily: '"SimStd", sans-serif' }}
          >
            <CardContent>
              <div>
                <div className="flex justify-end w-full">
                  {change && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        changeType === "positive"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {changeType === "positive" ? "↗" : "↘"}
                      {change}
                    </span>
                  )}
                </div>

                <div className="w-full flex items-start flex-col">
                  <p className="text-5xl font-bold text-black/80">{value}</p>
                  <Separator className="bg-black/10 h-2 w-full" />
                  <p className="text-sm text-black/60 mt-1">{label}</p>
                </div>
              </div>
            </CardContent>

            {/* Button wie bei Emissions */}
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
          <Card
            className="relative h-full"
            style={{ fontFamily: '"SimStd", sans-serif' }}
          >
            <CardContent className="h-full">
              {/* BACK CONTENT hier einfügen */}
            </CardContent>

            {/* Close Button wie bei Emissions */}
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
