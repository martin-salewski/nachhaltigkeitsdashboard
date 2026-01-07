import { Timeline } from "../ui/timeline";
import type { TimelineItem } from "../ui/timeline";
import gsap from "gsap";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRef, useState } from "react";

const items: TimelineItem[] = [
  {
    title: "Reduktion der CO₂-Emissionen um 50 % bis 2028",
  },
  {
    title: "Reduktion des Restmüllaufkommens pro Studierendem um 30 % bis 2027",
  },
  { title: "10 neue Forschungsprojekte mit Nachhaltigkeitsbezug bis 2028" },
  { title: "jährlich mindestens 3 Nachhaltigkeitsaktionen" },
];

function Goals() {
  const [isFlipped, setIsFlipped] = useState(false);
  const innerRef = useRef(null);
  const flip = () => {
    setIsFlipped((prev) => {
      const next = !prev;

      gsap.to(innerRef.current, {
        rotateY: next ? 180 : 0,
        duration: 0.8,
        ease: "power3.inOut",
        transformPerspective: 10000,
      });

      return next;
    });
  };

  const heading = "Nachhaltigkeitsziele";
  return (
    <div style={{ perspective: 1000 }}>
      <div
        className="relative"
        ref={innerRef}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="h-110 w-100 rounded-lg p-8 border bg-white shadow-lg relative"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <div className="w-full flex flex-col items-end gap-[8px]">
            <p className="text-[12] font-['Simple'] opacity-60 font-bold flex flex-start w-full text-start">
              {heading}
            </p>
            <Separator />
            <Select>
              <SelectTrigger className="w-fit">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Fruits</SelectLabel>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="blueberry">Blueberry</SelectItem>
                  <SelectItem value="grapes">Grapes</SelectItem>
                  <SelectItem value="pineapple">Pineapple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={() => {
              flip();
            }}
            aria-label="Info Anzeigen"
            className="absolute top-3 right-3 bg-black/20 rounded-full text-sm font-bold w-5 h-5 text-white flex items-center justify-center font-['Helvetica']"
          >
            i
          </button>
          <div className="mt-4">
            <Timeline items={items} />
          </div>
        </div>
        <div
          className="w-100 h-110 rounded-lg p-8 border bg-white shadow-lg absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <button
            onClick={() => {
              flip();
            }}
            aria-label="Info Anzeigen"
            className="absolute top-3 right-3 bg-black/20 rounded-full w-5 h-5 text-white flex items-center justify-center font-['Helvetica']"
          >
            x
          </button>
        </div>
      </div>
    </div>
  );
}

export default Goals;
