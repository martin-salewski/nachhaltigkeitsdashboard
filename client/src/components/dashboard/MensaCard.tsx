import { useQuery } from "@tanstack/react-query";
import { BarChart2, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { DatePickerDemo } from "@/components/ui/datepicker"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Info, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import gsap from "gsap";
import { ChartBarMenu } from "../ui/barchart_menu";
import { format } from "date-fns"

interface MensaMealStats {
  id: number
  date: number
  category: string
  count: number
}
async function fetchMensaMealStats(
  year?: number,
  category?: string,
  count?: number
): Promise<MensaMealStats[]> {
  const params = new URLSearchParams();
  if (year) params.set("year", year.toString())
  if (count) params.set("count", count.toString())
  if (category) params.set("category", category.toString())
  const url = `http://localhost:3000/api/mensa_meal_stats${params.toString() ? `?${params}` : ""
  }`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch people stats");
  return res.json();
}

function MensaCard() {
  type BarRow = { name: string; value: number } 

async function fetchMensaBars(dateISO: string): Promise<BarRow[]> {
  const res = await fetch(`/api/mensa?date=${encodeURIComponent(dateISO)}`)
  if (!res.ok) throw new Error("Fetch fehlgeschlagen")
  return res.json()
}
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
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
    <div className="perspective-[1000px] h-full w-full ">
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
          <Card className="w-full h-full bg-white rounded-lg border border-gray-300 flex flex-col">
            <CardHeader>
              <CardTitle> 
                <h1 className="title"> Menü</h1>
              </CardTitle>
              <Separator className=" w-full h-2 bg-black/10" />
              <div className="flex w-full justify-end mb-2">
              <DatePickerDemo onDateChange={setSelectedDate} />
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 flex items-center justify-center">
              <ChartBarMenu />
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

export default MensaCard;
