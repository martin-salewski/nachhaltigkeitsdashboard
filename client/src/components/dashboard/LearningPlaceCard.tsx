import gsap from "gsap";
import { useQuery } from "@tanstack/react-query";
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
import { useTranslation } from "react-i18next";

interface LearningFacilityRow {
  id: number;
  year: number;
  consultations: number | null;
  selfStudyPlaces: number | null;
  researchProjects: number | null;
  studentAssistants: number | null;
  satisfactionPercent: number | null;
}

async function fetchLearningFacilities(): Promise<LearningFacilityRow[]> {
  const res = await fetch("http://localhost:3000/api/learning_facilities");
  if (!res.ok) throw new Error("Failed to fetch learning facilities");
  return res.json();
}

export function LearningPlaceCard() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<string>("");

  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { data: allData = [] } = useQuery({
    queryKey: ["learning_facilities"],
    queryFn: fetchLearningFacilities,
  });

  const years = [...new Set(allData.map((r) => r.year))].sort((a, b) => b - a);

  useEffect(() => {
    if (years.length > 0 && !selectedYear) {
      setSelectedYear(String(years[0]));
    }
  }, [years.length]);

  const activeYear = selectedYear ? parseInt(selectedYear) : years[0];
  const row = allData.find((r) => r.year === activeYear);

  const progress = row?.satisfactionPercent ?? 0;

  const cardRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!frontRef.current || !backRef.current) return;
    frontRef.current.style.visibility = "visible";
    backRef.current.style.visibility = "hidden";
  }, []);

  const flipCard = useCallback(() => {
    if (isAnimating || !cardRef.current || !frontRef.current || !backRef.current)
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
        .to(cardRef.current, { rotateY: 180, duration: 0.3, ease: "power2.out" });
    } else {
      tl.to(cardRef.current, { rotateY: 90, duration: 0.3, ease: "power2.in" })
        .set(backRef.current, { visibility: "hidden" })
        .set(frontRef.current, { visibility: "visible" })
        .to(cardRef.current, { rotateY: 0, duration: 0.3, ease: "power2.out" });
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
            <CardHeader className="pb-1">
              <CardTitle className="flex flex-col gap-2">
                <h1 className="title">{t("learningPlace.title")}</h1>
                <Separator className="bg-black/10 h-2" />
                <div className="flex w-full justify-end">
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="selector">
                      <SelectValue placeholder={t("year")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{t("year")}</SelectLabel>
                        {years.map((y) => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-row">
                  <div className="flex flex-row items-start w-full">
                    <p className="text-sm font-['Helvetica'] font-medium text-black/60">{t("learningPlace.consultations")}</p>
                  </div>
                  <div className="flex justify-end items-center w-full">
                    <p className="text-sm font-bold font-['Helvetica']">{row?.consultations ?? "—"}</p>
                  </div>
                </div>
                <Separator className="gap-2 mb-4"/>
                <div className="flex flex-row">
                  <p className="flex items-start w-full text-sm font-['Helvetica'] font-medium text-black/60">{t("learningPlace.selfStudy")}</p>
                  <p className="flex justify-end items-center text-sm font-bold font-['Helvetica']">{row?.selfStudyPlaces ?? "—"}</p>
                </div>
                <Separator className="gap-2 mb-4"/>
                <div className="flex flex-row">
                  <div className="flex items-start w-full">
                    <p className="flex items-start w-full text-sm font-['Helvetica'] font-medium text-black/60">{t("learningPlace.research")}</p>
                    <div className="flex justify-end items-center w-full">
                      <p className="text-sm font-bold font-['Helvetica']">{row?.researchProjects ?? "—"}</p>
                    </div>
                  </div>
                </div>
                <Separator className="gap-2 mb-4"/>
                <div className="flex flex-row">
                  <div className="flex justify-start w-full">
                    <p className="text-sm font-['Helvetica'] font-medium text-black/60">{t("learningPlace.workingStudents")}</p>
                  </div>
                  <div className="flex justify-end items-center w-full">
                    <p className="text-sm font-bold font-['Helvetica']">{row?.studentAssistants ?? "—"}</p>
                  </div>
                </div>
                <Separator className="gap-2 mb-4"/>
                <div className="flex justify-start">
                  <p className="text-sm font-['Helvetica'] mb-2 font-medium text-black/60">{t("learningPlace.satisfaction")}</p>
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
            <CardContent className="pt-2" />

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
          <Card className="relative h-full">
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-medium text-foreground/90">
                {t("cardBack.title")}
              </CardTitle>
            </CardHeader>

            <Separator className="mb-2 bg-black/10" />

            <CardContent className="pt-2 text-sm text-muted-foreground space-y-3 text-justify">
              <p>{t("learningPlace.description")}</p>
            </CardContent>

            <button
              onClick={flipCard}
              disabled={isAnimating}
              className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10 disabled:opacity-50 cursor-pointer"
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
