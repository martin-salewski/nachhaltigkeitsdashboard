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

export function LearningPlaceCard() {
 

  const heading = "Lernort";
  const progress = 45;

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
                
                <div className="flex flex-row">
                <div className="flex flex-row items-start w-full">
                  <p className="text-sm font-['Helvetica'] font-medium text-black/60">Anzahl der Lehrberatungen</p>
                  </div>
                  <div className="flex justify-end items-center w-full">
                  <p className="text-sm font-bold font-['Helvetica']">120</p>
                  </div>
                </div>
                <Separator className="gap-2 mb-4"/>
                <div className="flex flex-row">
                  <p className="flex items-start w-full text-sm font-['Helvetica'] font-medium text-black/60">Anzahl der Lernplätze im Selbststudium</p>
                  <p className="flex justify-end items-center text-sm font-bold font-['Helvetica']">40</p>
                </div>
                <Separator className="gap-2 mb-4"/>
                <div className="flex flex-row">
                <div className="flex items-start w-full">
                  <p className="flex items-start w-full text-sm font-['Helvetica'] font-medium text-black/60">Anzahl der Forschungsprojekte</p>
                  <div className="flex justify-end items-center w-full">
                  <p className="text-sm font-bold font-['Helvetica']">17</p>
                  </div>
                </div>
                </div>
                <Separator className="gap-2 mb-4"/>
                <div className="flex flex-row">
                <div className="flex justify-start w-full">
                  <p className="text-sm font-['Helvetica'] font-medium text-black/60">Anzahl der WerkstudentInnen</p>
                  </div>
                  <div className="flex justify-end items-center w-full">
                  <p className="text-sm font-bold font-['Helvetica']">17</p>
                  </div>
                </div>
                
                <Separator className="gap-2 mb-4"/>
                <div className="flex justify-start">
                  <p className="text-sm font-['Helvetica'] mb-2 font-medium text-black/60">Studierendenzufriedenheit</p>
                </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full text-white bg-(--color-chart-1) font-medium flex items-center justify-center font-['Helvetica'] text-xs rounded-full"
                  style={{ width: `${progress}%` }}
                >
                  {progress}%
                </div>
              </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
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
                dient als Orientierung für die kommenden Jahre.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li>Ziele sind zeitlich definiert (z.B. bis 2027/2028).</li>
                <li>Sie können als Grundlage für Maßnahmen dienen.</li>
              </ul>
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
