import { useRef, useState } from "react";
import { gsap } from "gsap/gsap-core";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";
import { ChartBarStacked } from "../ui/stackedbarchart";

function StudentChart() {
  const heading = "Personal";
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
        {/* FRONT */}
        <div
          className="flex rounded-lg w-140 h-90 p-8 border shadow-lg"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <div className="flex flex-col w-full">
            <div className="flex flex-col gap-1">
              <p className="font-['Simple'] font-bold opacity-60 flex flex-start text-[10]">
                {heading}
              </p>
              <div className="h-[1px] w-full bg-gray-300"></div>
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
              <div className="flex justify-center">
                <ChartBarStacked></ChartBarStacked>
              </div>
            </div>
            <div className="flex flex-row justify-between"></div>
          </div>
        </div>
        <div
          className="w-90 h-lg rounded-lg p-8 border shadow-lg absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        ></div>
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
  );
}
export default StudentChart;
