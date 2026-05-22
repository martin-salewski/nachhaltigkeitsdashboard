import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useRef, useCallback, useEffect } from "react";
import { Info, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import gsap from "gsap";
import Vegan from "@/assets/icons/vegan.svg";
import Veggie from "@/assets/icons/veggie.svg";
import { ReactSVG } from "react-svg";
import { useTranslation } from "react-i18next";

interface MensaMenuItem {
  id: number;
  date: string;
  name: string;
  category: "vegan" | "vegetarisch" | "fleisch";
  allergens: string | null;
  priceStudent: number;
  priceStaff: number;
  co2Grams: number;
}

async function fetchMensaMenu(date: string): Promise<MensaMenuItem[]> {
  const res = await fetch(`/api/mensa_menu?date=${date}`);
  if (!res.ok) throw new Error("Fehler beim Laden des Speiseplans");
  return res.json();
}

function formatPrice(price: number): string {
  return price.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
}

function co2Color(grams: number): string {
  if (grams <= 799) return "text-green-600";
  if (grams <= 1300) return "text-orange-500";
  return "text-red-600";
}

function CategoryIcon({ category }: { category: string }) {
  if (category === "vegan") {
    return (
      <span className="inline-flex" style={{ verticalAlign: "-4px" }}>
        <ReactSVG src={Vegan} beforeInjection={(svg) => svg.classList.add("w-13", "h-4")} />
      </span>
    );
  }
  if (category === "vegetarisch") {
    return (
      <span className="inline-flex" style={{ verticalAlign: "-4px" }}>
        <ReactSVG src={Veggie} beforeInjection={(svg) => svg.classList.add("w-13", "h-4")} />
      </span>
    );
  }
  return null;
}

const WEEKDAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

function getWeekDates(): Date[] {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun,1=Mon,...
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getCalendarWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function WeekSlider({ dayIndex, onChange }: { dayIndex: number; onChange: (i: number) => void }) {
  const dates = getWeekDates();
  const kw = getCalendarWeek(dates[0]);
  const rangeLabel = `KW${kw}  ${formatShortDate(dates[0])} – ${formatShortDate(dates[4])}`;
  return (
    <div className="flex items-center gap-0">
      <span className="font-[HelveticaNowText] text-[10px] text-black/40 whitespace-nowrap mr-3">{rangeLabel}</span>
      <button
        onClick={() => onChange(Math.max(0, dayIndex - 1))}
        disabled={dayIndex === 0}
        className="text-black/40 hover:text-black/80 disabled:opacity-20 cursor-pointer -mr-1"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="font-[HelveticaNowText] text-xs text-black/80 min-w-20 text-center">
        {WEEKDAYS[dayIndex]}
      </span>
      <button
        onClick={() => onChange(Math.min(4, dayIndex + 1))}
        disabled={dayIndex === 4}
        className="text-black/40 hover:text-black/80 disabled:opacity-20 cursor-pointer -ml-1"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function MealPlanCard() {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const today = new Date();
  const todayDow = today.getDay();
  const initialDay = todayDow >= 1 && todayDow <= 5 ? todayDow - 1 : 0;
  const [dayIndex, setDayIndex] = useState(initialDay);

  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const weekDates = getWeekDates();
  const dateString = toLocalDateString(weekDates[dayIndex]);

  const { data: menu = [], isLoading, isError } = useQuery({
    queryKey: ["mensa", dateString],
    queryFn: () => fetchMensaMenu(dateString),
  });

  const { data: mealStats = [] } = useQuery({
    queryKey: ["mensa_meal_stats", dateString],
    queryFn: async () => {
      const res = await fetch(`/api/mensa_meal_stats?date=${dateString}`);
      if (!res.ok) throw new Error("Fehler beim Laden der Statistik");
      return res.json() as Promise<{ category: string; count: number }[]>;
    },
  });

  const statByCategory = Object.fromEntries(mealStats.map((s) => [s.category, s.count]));

  useEffect(() => {
    if (!frontRef.current || !backRef.current) return;
    frontRef.current.style.visibility = "visible";
    backRef.current.style.visibility = "hidden";
  }, []);

  const flipCard = useCallback(() => {
    if (isAnimating || !cardRef.current || !frontRef.current || !backRef.current)
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
      <div
        ref={cardRef}
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <div
          ref={frontRef}
          style={{ backfaceVisibility: "hidden" }}
          className="backface-hidden h-full w-full overflow-y-auto"
        >
          <Card className="w-full min-h-full bg-white rounded-lg border border-gray-300">
            <CardHeader>
              <CardTitle>
                <h1 className="title">{t("mealPlan.title")}</h1>
              </CardTitle>
              <Separator className="w-full h-2 bg-black/10" />
              <div className="flex w-full justify-end mb-2">
                <WeekSlider dayIndex={dayIndex} onChange={setDayIndex} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <p className="text-sm text-muted-foreground">{t("loading")}</p>
              )}
              {isError && (
                <p className="text-sm text-red-500">{t("mealPlan.error")}</p>
              )}
              {!isLoading && !isError && menu.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("mealPlan.noMenu")}</p>
              )}
              <div>
                {menu.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex flex-row justify-between py-1.5">
                      <div className="max-w-100">
                        <p className="font-[HelveticaNowText] font-normal text-xs text-black/80">
                          {item.name}{" "}
                          <span className="font-[HelveticaNowText] font-normal text-xs text-black/40">({item.allergens})</span>
                          {" "}<CategoryIcon category={item.category} />
                        </p>
                      </div>
                      <div className="flex flex-row shrink-0">
                        <div className="flex flex-col items-end w-20">
                          <p className="font-bold font-['SimStd'] text-xs tabular-nums">{formatPrice(item.priceStudent)}</p>
                          <span className="font-[HelveticaNowText] text-[10px] text-black/40">Studiepreis</span>
                        </div>
                        <div className="flex flex-col items-end w-20">
                          <p className="font-bold font-['SimStd'] text-xs tabular-nums">{formatPrice(item.priceStaff)}</p>
                          <span className="font-[HelveticaNowText] text-[10px] text-black/40">nicht Studi</span>
                        </div>
                        <div className="flex flex-col items-end w-16">
                          <p className={`font-bold font-['SimStd'] text-xs tabular-nums ${co2Color(item.co2Grams)}`}>{item.co2Grams} g</p>
                          <span className="font-[HelveticaNowText] text-[10px] text-black/40">CO²</span>
                        </div>
                      </div>
                    </div>
                    {index < menu.length - 1 && (
                      <Separator className="w-full h-2 bg-black/10" />
                    )}
                  </div>
                ))}
              </div>
              {mealStats.length > 0 && (
                <>
                  <Separator className="w-full h-2 bg-black/10 mt-1" />
                  <div className="flex gap-4 pt-1.5">
                    <div className="flex flex-col items-center">
                      <span className="font-bold font-['SimStd'] text-xs tabular-nums text-green-600">{statByCategory["vegan"] ?? 0}</span>
                      <span className="font-[HelveticaNowText] text-[10px] text-black/40">Vegan</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-bold font-['SimStd'] text-xs tabular-nums text-lime-600">{statByCategory["vegetarisch"] ?? 0}</span>
                      <span className="font-[HelveticaNowText] text-[10px] text-black/40">Vegetarisch</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-bold font-['SimStd'] text-xs tabular-nums text-orange-500">{statByCategory["fleisch"] ?? 0}</span>
                      <span className="font-[HelveticaNowText] text-[10px] text-black/40">Fleisch</span>
                    </div>
                  </div>
                </>
              )}
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
          <Card className="relative h-full w-full" data-card-id="strom">
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-medium text-foreground/90">
                {t("cardBack.title")}
              </CardTitle>
            </CardHeader>
            <Separator className="mb-2 bg-black/10" />
            <CardContent className="pt-2 flex flex-col gap-4">
              <p className="font-[HelveticaNowText] text-xs text-black/70 leading-relaxed text-justify">
                {t("mealPlan.back.description")}
              </p>
              <div className="flex gap-6">
                <div className="flex flex-col gap-1.5 shrink-0">
                  <p className="font-[HelveticaNowText] text-[10px] text-black/40 uppercase tracking-wide mb-0.5">{t("mealPlan.back.co2Label")}</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-600 shrink-0" />
                    <span className="font-[HelveticaNowText] text-xs text-black/70">{t("mealPlan.back.co2Good")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                    <span className="font-[HelveticaNowText] text-xs text-black/70">{t("mealPlan.back.co2Medium")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-600 shrink-0" />
                    <span className="font-[HelveticaNowText] text-xs text-black/70">{t("mealPlan.back.co2Bad")}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-[HelveticaNowText] text-[10px] text-black/40 uppercase tracking-wide mb-0.5">{t("mealPlan.back.allergenLabel")}</p>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-0.5">
                    {[
                      ["Gl", "Gluten"],
                      ["We", "Weizen"],
                      ["Ro", "Roggen"],
                      ["Ge", "Gerste"],
                      ["Ha", "Hafer"],
                      ["Di", "Dinkel"],
                      ["Ei", "Eier"],
                      ["Fi", "Fisch"],
                      ["Kr", "Krebstiere"],
                      ["La", "Milch / Laktose"],
                      ["So", "Soja"],
                      ["Pal", "Erdnüsse"],
                      ["Nu", "Schalenfrüchte"],
                      ["Sl", "Senf"],
                      ["Se", "Sesam"],
                      ["Sf", "Schwefeldioxid / Sulfite"],
                      ["Lu", "Lupine"],
                      ["Wt", "Weichtiere"],
                    ].map(([abbr, full]) => (
                      <div key={abbr} className="flex items-baseline gap-1">
                        <span className="font-[HelveticaNowText] text-[10px] font-semibold text-black/60 w-6 shrink-0">{abbr}</span>
                        <span className="font-[HelveticaNowText] text-[10px] text-black/50">{full}</span>
                      </div>
                    ))}
                  </div>
                </div>
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

export default MealPlanCard;
