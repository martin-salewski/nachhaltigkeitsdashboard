import { ChartLineInteractive } from "../ui/linechart";
import { useRef, useState } from "react";
import gsap from "gsap";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function LearningPlace() {
  const heading = "Lernort";
  const [isFlipped, setIsFlipped] = useState(false);
  const innerRef = useRef(null);
  const flip = () => {
    setIsFlipped((prev) => {
      const next = !prev;

      gsap.to(innerRef.current, {
        rotateY: next ? 180 : 0,
        duration: 0.8,
        ease: "power3.inOut",
        transformPerspective: 1000,
      });

      return next;
    });
  };

  return (
    <div style={{ perspective: 1000 }}>
      <div
        className="relative"
        ref={innerRef}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="w-90 h-120 rounded-lg p-8 border shadow-lg"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <div>
            <div className="flex flex-row">
              <div className="flex w-full flex-col">
                <div className="flex justify-between w-full">
                  <div className=" flex flex-col items-start">
                    <p className="text-[10] font-['Simple'] opacity-60 font-bold flex flex-start">
                      {heading}
                    </p>
                    <div className="w-full h-[1px] bg-gray-300"></div>
                  </div>
                  <div className="flex justify-end items-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="font-['Simple'] opacity-60 text-md border-1">
                        Jahr
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel className="font-['Simple'] opacity-60 text-md border-1">
                          2026
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="font-['Simple'] opacity-60 text-md border-1">
                          2027
                        </DropdownMenuItem>
                        <DropdownMenuItem className="font-['Simple'] opacity-60 text-md border-1">
                          2028
                        </DropdownMenuItem>
                        <DropdownMenuItem className="font-['Simple'] opacity-60 text-md border-1">
                          2029
                        </DropdownMenuItem>
                        <DropdownMenuItem className="font-['Simple'] opacity-60 text-md border-1">
                          2030
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex flex-col gap-8 items-start text-[14px]">
                  <div className=" flex flex-row w-full">
                    <p>Anzahl der Lehrberatungen</p>
                    <div className="flex justify-end">
                      <p className="font-bold">10</p>
                    </div>
                  </div>
                  <div className="flex flex-row w-full">
                    <p>Anzahl der Lernplätze im Selbststudium</p>
                    <p className="font-bold flex-end">10</p>
                  </div>
                  <div className="justify-around flex flex-row w-full">
                    <p>Anzahl Forschungsprojekte</p>
                    <p className="font-bold">10</p>
                  </div>
                  <div className="justify-around flex flex-row w-full">
                    <p>Anzahl Werkstudentenstellen</p>
                    <p className="font-bold">10</p>
                  </div>
                  <div className="justify-around flex flex-row w-full">
                    <p>Studierendenzufriedenheit</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  flip();
                }}
                aria-label="Info Anzeigen"
                className="absolute top-2 right-2 bg-gray-400 rounded-full w-5 h-5 text-white flex items-center justify-center font-['Helvetica']"
              >
                i
              </button>
            </div>
          </div>
        </div>
        <div
          className="w-xl h-lg rounded-lg border shadow-lg absolute inset-0"
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
            className="absolute top-2 right-2 bg-gray-400 rounded-full w-5 h-5 text-white flex items-center justify-center font-['Helvetica']"
          >
            i
          </button>
        </div>
      </div>
    </div>
  );
}

export default LearningPlace;
