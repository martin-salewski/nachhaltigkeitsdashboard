import { useCallback, useEffect, useRef, useState } from "react";
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
import { ChartBarStacked } from "../ui/stackedbarchart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function StudentChart() {
  const heading = "StudentInnen";

  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!frontRef.current || !backRef.current) return;
    frontRef.current.style.visibility = "visible";
    backRef.current.style.visibility = "hidden";
  }, []);

  const flip = useCallback(() => {
    if (
      isAnimating ||
      !wrapperRef.current ||
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
      tl.to(wrapperRef.current, {
        rotateY: 90,
        duration: 0.3,
        ease: "power2.in",
      })
        .set(frontRef.current, { visibility: "hidden" })
        .set(backRef.current, { visibility: "visible" })
        .to(wrapperRef.current, {
          rotateY: 180,
          duration: 0.3,
          ease: "power2.out",
        });
    } else {
      tl.to(wrapperRef.current, {
        rotateY: 90,
        duration: 0.3,
        ease: "power2.in",
      })
        .set(backRef.current, { visibility: "hidden" })
        .set(frontRef.current, { visibility: "visible" })
        .to(wrapperRef.current, {
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
        });
    }
  }, [isFlipped, isAnimating]);

  return (
    <div className="relative" style={{ perspective: 1000 }}>
      <div
        ref={wrapperRef}
        className="relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <div ref={frontRef} style={{ backfaceVisibility: "hidden" }}>
          <Card className="relative bg-white w-full h-full">
            <CardHeader>
              <CardTitle>
                <h1 className="font-bold opacity-60 flex flex-start text-lg font-['SimStd']">
                  {heading}
                </h1>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Separator className="bg-black/10 h-2" />

              <div className="flex justify-end items-end mt-2">
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

              <div className="flex justify-center">
                <ChartBarStacked />
              </div>
            </CardContent>

            <button
              onClick={flip}
              disabled={isAnimating}
              className="absolute top-3 right-3 bg-gray-300 rounded-full w-5 h-5 text-white flex items-center justify-center disabled:opacity-50"
              aria-label="Mehr Informationen"
            >
              i
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
          }}
        >
          <Card className="relative bg-white w-full h-full">
            <CardHeader>
              <CardTitle>
                <h1 className="font-bold opacity-60 flex flex-start text-lg font-['SimStd']">
                  Über diese Karte
                </h1>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Separator className="bg-black/10 h-2" />
              <div className="mt-3 text-sm text-muted-foreground space-y-2">
                <p>blabla</p>
              </div>
            </CardContent>

            <button
              onClick={flip}
              disabled={isAnimating}
              className="absolute top-3 right-3 bg-gray-300 rounded-full w-5 h-5 text-white flex items-center justify-center disabled:opacity-50"
              aria-label="Zurück"
            >
              i
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default StudentChart;
