import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

function FossilFuels() {
  const heading = "Fossile Brennstoffe";
  const erdoel = "Erdöl";
  const erdgas = "Erdgas";

  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);

  // initial: front visible, back hidden
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
        setIsFlipped((p) => !p);
        setIsAnimating(false);
      },
    });

    if (!isFlipped) {
      tl.to(cardRef.current, { rotateY: 90, duration: 0.3, ease: "power2.in" })
        .set(frontRef.current, { visibility: "hidden" })
        .set(backRef.current, { visibility: "visible" })
        .to(cardRef.current, {
          rotateY: 180,
          duration: 0.3,
          ease: "power2.out",
        });
    } else {
      tl.to(cardRef.current, { rotateY: 90, duration: 0.3, ease: "power2.in" })
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
        <div ref={frontRef} style={{ backfaceVisibility: "hidden" }}>
          <Card className="relative h-full w-full">
            <CardContent>
              <div className="w-full flex flex-col">
                <h1 className="font-['SimStd'] font-bold text-black/60 text-md leading-none">
                  {heading}
                </h1>
                <Separator className="bg-black/10 h-2 w-full mt-1 mb-3" />
                <div className="flex flex-row justify-between">
                
                  <div className="flex flex-col">
                    <p className="text-sm text-black/50">{erdoel}</p>
                    <p className="text-sm font-bold text-black/80">20 t</p>
                  </div>

                  <div className="flex flex-col">
                    <p className="text-sm text-black/50">{erdgas}</p>
                    <p className="text-sm font-bold text-black/80">10 t</p>
                  </div>
                

                <Select>
                    <SelectTrigger size="sm" className="w-fit px-2 py-1 text-xs">
                      <SelectValue placeholder="Jahr" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Jahr</SelectLabel>
                        <SelectItem className="text-xs" value="2026">
                          2026
                        </SelectItem>
                        <SelectItem className="text-xs" value="2027">
                          2027
                        </SelectItem>
                        <SelectItem className="text-xs" value="2028">
                          2028
                        </SelectItem>
                        <SelectItem className="text-xs" value="2029">
                          2029
                        </SelectItem>
                        <SelectItem className="text-xs" value="2030">
                          2030
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
          className="absolute inset-0 h-full w-full"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            visibility: "hidden",
          }}
        >
          <Card className="relative h-full gap-2">
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

export default FossilFuels;
