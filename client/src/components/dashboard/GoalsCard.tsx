import { Timeline } from "../ui/timeline";
import type { TimelineItem } from "../ui/timeline";
import gsap from "gsap";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useRef, useCallback, useEffect } from "react";
import { Info, X } from "lucide-react";

export function GoalsCard() {
  const items: TimelineItem[] = [
    { title: "Reduktion der CO₂-Emissionen um 50 % bis 2028" },
    {
      title:
        "Reduktion des Restmüllaufkommens pro Studierendem um 30 %",
    },
    { title: "10 neue Forschungsprojekte mit Nachhaltigkeitsbezug" },
    { title: "jährlich mindestens 3 Nachhaltigkeitsaktionen" },
  ];

  const heading = "Nachhaltigkeitsziele";

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

  return (
    <div
      className="perspective-[1000px] w-full h-full"
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
          <Card className="relative w-full h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex flex-col gap-2">
                <h1 className="title">{heading}</h1>
                <Separator className="bg-black/10 h-2" />
                <div className="flex w-full justify-end">
                  <Select>
                    <SelectTrigger className="selector">
                      <SelectValue placeholder="Jahr" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Jahr</SelectLabel>
                        <SelectItem value="2026">2026</SelectItem>
                        <SelectItem value="2027">2027</SelectItem>
                        <SelectItem value="2028">2028</SelectItem>
                        <SelectItem value="2029">2029</SelectItem>
                        <SelectItem value="2030">2030</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-2">
              <Timeline items={items} />
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
          className="absolute inset-0 backface-hidden h-full w-full"
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
                Diese Karte zeigt die Nachhaltigkeitsziele der Hochschule und
                dient als Orientierung für das jeweilige Jahr. Sofern diese nicht im selben Jahr erreicht werden, werden sie weiterhin für die kommenden Jahre angezeigt
              </p>
            </CardContent>

            <button
              onClick={flipCard}
              disabled={isAnimating}
              className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10 disabled:opacity-50"
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
