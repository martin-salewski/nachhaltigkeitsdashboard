import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Info, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import gsap from "gsap";
import Vegan from "@/assets/icons/vegan.svg";
import Veggie from "@/assets/icons/veggie.svg";
import { ReactSVG } from "react-svg";
import { DatePickerDemo } from "../ui/datepicker";

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
  const res = await fetch(`http://localhost:3000/api/mensa_menu?date=${date}`);
  if (!res.ok) throw new Error("Fehler beim Laden des Speiseplans");
  return res.json();
}
  function formatPrice(price: number): string {
    return price.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €";
  }
  function CategoryIcon({ category }: { category: string }) {
    if (category === "vegan") {
      return (
        <ReactSVG
          src={Vegan}
          beforeInjection={(svg) => svg.classList.add("w-16", "h-8")}
        />
      );
    }
    if (category === "vegetarisch") {
      return (
        <ReactSVG
          src={Veggie}
          beforeInjection={(svg) => svg.classList.add("w-16", "h-8")}
        />
      );
    }
    return null;
  }

function MealPlanCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  function toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  
  const dateString = selectedDate
    ? toLocalDateString(selectedDate)
    : toLocalDateString(new Date());

    const { data: menu = [], isLoading, isError } = useQuery({
      queryKey: ["mensa", dateString],
      queryFn: () => fetchMensaMenu(dateString),
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
              <CardTitle>
                <h1 className="title"> Speiseplan</h1>  
              </CardTitle>
              <Separator className=" w-full h-2 bg-black/10" />
              <div className="flex w-full justify-end">
              <div className="flex w-full justify-end mb-2">
              <DatePickerDemo onDateChange={setSelectedDate} />
              </div>
              </div>
            </CardHeader>
            <CardContent>
            {isLoading && (
                <p className="text-sm text-muted-foreground">Lädt...</p>
              )}
              {isError && (
                <p className="text-sm text-red-500">
                  Fehler beim Laden des Speiseplans.
                </p>
              )}
              {!isLoading && !isError && menu.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Kein Speiseplan für diesen Tag.
                </p>
              )}
              {menu.map((item, index) => (
                <div key={item.id}>
                  <div className="flex flex-row justify-between items-center py-1">
                    <div className="flex flex-col">
                      
                      <p className="font['HelveticaNowText'] font-normal text-xs text-black/80">
                        {item.name} <span className="font-[HelveticaNowText] font-normal text-xs text-black/40">
                       ({item.allergens})
                      </span>
                      </p>
                      
                      <CategoryIcon category={item.category} />
                    </div>
                    <div className="flex flex-row justify-around w-fill min-w-60">
                      <p className="font-bold font-['SimStd'] text-xs">
                        {formatPrice(item.priceStudent)}
                      </p>
                      <p className="font-bold font-['SimStd'] text-xs">
                        {formatPrice(item.priceStaff)}
                      </p>
                      <p className="font-bold font-['SimStd'] text-xs">
                        {item.co2Grams} g
                      </p>
                    </div>
                  </div>
                  {index < menu.length - 1 && (
                    <Separator className="w-full h-2 bg-black/10" />
                  )}
                </div>
              ))}
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
