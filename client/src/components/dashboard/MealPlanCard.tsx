import { useQuery } from "@tanstack/react-query";
import { BarChart2, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Info, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import gsap from "gsap";
import Vegan from "@/assets/icons/vegan.svg";
import Veggie from "@/assets/icons/veggie.svg";
import { ReactSVG } from "react-svg";

function MealPlanCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

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

    const timeline = gsap.timeline({
      onComplete: () => {
        setIsFlipped((prev) => !prev);
        setIsAnimating(false);
      },
    });

    if (!isFlipped) {
      timeline
        .to(cardRef.current, {
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
      timeline
        .to(cardRef.current, {
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
    <div className="perspective-[1000px] h-full w-full">
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
          <Card className=" w-full h-full bg-white rounded-lg border border-gray-300">
            <CardHeader>
              <CardTitle className="font-bold opacity-60 text-xl font-[SimStd']">
                Speiseplan
              </CardTitle>
              <Separator className=" w-full h-2 bg-black/10" />
              <div className="flex w-full justify-end">
                <Select>
                  <SelectTrigger className="w-fit">
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
            </CardHeader>
            <CardContent>
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col">
                  <p className="font-helvetica font-normal text-sm">
                    Kartoffel-Lauch-Eintopf mit Kräutern (Sl)
                  </p>
                  <ReactSVG
                    src={Vegan}
                    beforeInjection={(svg) => {
                      svg.classList.add("w-16", "h-8");
                    }}
                  ></ReactSVG>
                </div>
                <div className="flex flex-row justify-around gap-10 w-fill min-w-60">
                  <p className="font-bold font-['SimStd']">1,11 €</p>
                  <p className="font-bold font-['SimStd']">1,84 €</p>
                  <p className="font-bold font-['SimStd']">56 g</p>
                </div>
              </div>

              <Separator className=" w-full h-2 bg-black/10" />
              <div className="flex flex-row items-center">
                <div className="flex flex-col">
                  <p className="font-helvetica font-normal text-sm">
                    Maccaroni ´n Cheese (1, Gl, La, Sf, We) mit Käsesauce (2,
                    Ei, La)
                  </p>
                  <ReactSVG
                      src={Veggie}
                      beforeInjection={(svg) => {
                        svg.classList.add("w-16", "h-8");
                      }}
                    ></ReactSVG>
                </div>
                <div className="flex flex-row w-fill justify-around gap-10 min-w-60">
                  <p className="font-bold font-['SimStd']">2,70 €</p>
                  <p className="font-bold font-['SimStd']">4,47 €</p>
                  <p className="font-bold font-['SimStd']">1000 g</p>
                </div>
              </div>
              <Separator className=" w-full h-2 bg-black/10" />
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col">
                  <p className="font-helvetica font-normal text-sm">
                    Frisch gebackener bayerischer Fleischkäse mit Bratensauce
                    und kartoffelpüree
                  </p>
                </div>
                <div className="flex flex-row w-fill justify-around gap-10 min-w-60">
                  <p className="font-bold font-['SimStd']">3,10 €</p>
                  <p className="font-bold font-['SimStd']">5,13 €</p>
                  <p className="font-bold font-['SimStd']">848 g</p>
                </div>
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
          <Card className="relative h-full w-full" data-card-id="strom">
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

export default MealPlanCard;
