import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartBarStackedStudentsDepartment } from "../ui/stackedbarchart_students_department";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface StudentDepartmentData {
  id: number;
  year: number;
  department: string;
  gender: string;
  count: number;
}

async function fetchStudentDepartment(year?: number): Promise<StudentDepartmentData[]> {
  const params = new URLSearchParams();
  if (year) params.set("year", year.toString());
  const url = `/api/student_department${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch student department data");
  return res.json();
}

async function fetchAvailableYears(): Promise<number[]> {
  const res = await fetch("/api/student_department/years");
  if (!res.ok) throw new Error("Failed to fetch years");
  return res.json();
}

function StudentsDepartmentCard() {
  const { t } = useTranslation();
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const { data } = useQuery({
    queryKey: ["student-department", year],
    queryFn: () => fetchStudentDepartment(year),
  });

  const { data: availableYears } = useQuery({
    queryKey: ["student-department-years"],
    queryFn: fetchAvailableYears,
  });

  useEffect(() => {
    if (availableYears && availableYears.length > 0 && !availableYears.includes(year)) {
      setYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears]);

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
    if (isAnimating || !cardRef.current || !frontRef.current || !backRef.current) return;

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
    <div className="relative h-full w-full" style={{ perspective: 1000 }}>
      <div
        ref={cardRef}
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <div ref={frontRef} className="h-full w-full" style={{ backfaceVisibility: "hidden" }}>
          <Card className="relative bg-white w-full h-full flex flex-col">
            <CardHeader>
              <CardTitle>
                <h1 className="title">{t("studentsDepartment.title")}</h1>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 flex flex-col">
              <Separator className="bg-black/10 h-2" />

              <div className="flex justify-end items-end mt-2">
                <Select
                  value={year ? String(year) : undefined}
                  onValueChange={(val) => setYear(Number(val))}
                >
                  <SelectTrigger className="selector">
                    <SelectValue placeholder={t("year")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{t("year")}</SelectLabel>
                      {availableYears?.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-h-0 w-full mt-2">
                <ChartBarStackedStudentsDepartment data={data ?? []} />
              </div>
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
          className="absolute inset-0 h-full w-full"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <Card className="relative bg-white w-full h-full">
            <CardHeader>
              <CardTitle>
                <h1 className="font-bold opacity-60 flex flex-start text-lg font-['SimStd']">
                  {t("cardBack.title")}
                </h1>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Separator className="bg-black/10 h-2" />
              <div className="mt-3 text-sm text-muted-foreground space-y-2">
                <p>{t("studentsDepartment.description")}</p>
              </div>
            </CardContent>

            <button
              onClick={flipCard}
              disabled={isAnimating}
              className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10 disabled:opacity-50 cursor-pointer"
              aria-label="Zurück"
            >
              <X />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default StudentsDepartmentCard;
