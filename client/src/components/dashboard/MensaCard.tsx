import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useRef, useCallback, useEffect } from "react";
import { Info, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import gsap from "gsap";
import { ChartBarMenu } from "../ui/barchart_menu";
import { DatePickerDemo } from "@/components/ui/datepicker";
import { useTranslation } from "react-i18next";

interface MensaMenuItem {
  id: number;
  date: string;
  name: string;
  category: "vegan" | "vegetarisch" | "fleisch";
  co2Grams: number;
}

async function fetchMensaMenu(date: string): Promise<MensaMenuItem[]> {
  const res = await fetch(`/api/mensa_menu?date=${date}`);
  if (!res.ok) throw new Error("Failed to fetch mensa menu");
  return res.json();
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function MensaCard() {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const dateString = selectedDate ? toLocalDateString(selectedDate) : toLocalDateString(new Date());

  const { data: menuItems = [] } = useQuery({
    queryKey: ["mensa_menu_co2", dateString],
    queryFn: () => fetchMensaMenu(dateString),
  });

  // Compute average CO2 per category
  const chartData = (["fleisch", "vegetarisch", "vegan"] as const).map((cat) => {
    const items = menuItems.filter((m) => m.category === cat);
    const avg = items.length > 0
      ? Math.round(items.reduce((sum, m) => sum + m.co2Grams, 0) / items.length)
      : 0;
    const label = cat === "fleisch" ? "Fleisch" : cat === "vegetarisch" ? "Vegetarisch" : "Vegan";
    return { meal: label, CO2: avg, category: cat };
  });

  useEffect(() => {
    if (!frontRef.current || !backRef.current) return;
    frontRef.current.style.visibility = "visible";
    backRef.current.style.visibility = "hidden";
  }, []);

  const flipCard = useCallback(() => {
    if (isAnimating || !cardRef.current || !frontRef.current || !backRef.current) return;
    setIsAnimating(true);
    const timeline = gsap.timeline({
      onComplete: () => { setIsFlipped((prev) => !prev); setIsAnimating(false); },
    });
    if (!isFlipped) {
      timeline
        .to(cardRef.current, { rotateY: 90, duration: 0.3, ease: "power2.in" })
        .set(frontRef.current, { visibility: "hidden" })
        .set(backRef.current, { visibility: "visible" })
        .to(cardRef.current, { rotateY: 180, duration: 0.3, ease: "power2.out" });
    } else {
      timeline
        .to(cardRef.current, { rotateY: 90, duration: 0.3, ease: "power2.in" })
        .set(backRef.current, { visibility: "hidden" })
        .set(frontRef.current, { visibility: "visible" })
        .to(cardRef.current, { rotateY: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [isFlipped, isAnimating]);

  return (
    <div className="perspective-[1000px] h-full w-full">
      <div ref={cardRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {/* FRONT */}
        <div ref={frontRef} style={{ backfaceVisibility: "hidden" }} className="backface-hidden h-full w-full">
          <Card className="w-full h-full bg-white rounded-lg border border-gray-300 flex flex-col">
            <CardHeader>
              <CardTitle>
                <h1 className="title">{t("mensa.title")}</h1>
              </CardTitle>
              <Separator className="w-full h-2 bg-black/10" />
              <div className="flex w-full justify-end mb-2">
                <DatePickerDemo onDateChange={setSelectedDate} />
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 flex items-center justify-center">
              <ChartBarMenu data={chartData} />
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
          <Card className="relative h-full w-full">
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-medium text-foreground/90">{t("cardBack.title")}</CardTitle>
            </CardHeader>
            <Separator className="mb-2 bg-black/10" />
            <CardContent className="pt-2 space-y-4 text-sm text-muted-foreground text-justify">
              <p>{t("mensa.description")}</p>
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

export default MensaCard;
