import React, { useState } from "react";
import { DonutChart } from "../ui/donutchart";
import { useRef } from "react";
import { gsap } from "gsap/gsap-core";
function HeatMix() {
  const heading = "Fernwärmemix";
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
          className="w-90 h-100 max-h-lg rounded-lg p-8 border shadow-lg"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-end">
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
            <div className="flex flex-col items-start">
              <p className="font-['simple'] opacity-60 text-[10] font-bold">
                {heading}
              </p>
              <div className="w-full h-[1px] bg-gray-300"></div>
            </div>
            <DonutChart
              labels={[
                "Müll-KWK",
                "Klärschlamm",
                "Solar",
                "Wärmepumpe",
                "Gask-KWK",
                "Biomasse",
              ]}
              data={[55, 25, 20, 80, 90, 7]}
            />
          </div>
        </div>
        <div
          className="w-90 h-100 rounded-lg p-8 border shadow-lg absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <button
            onClick={() => {
              flip();
            }}
            aria-label="Grafik anzeigen"
            className="absolute top-2 right-2 bg-gray-400 rounded-full w-5 h-5 text-white flex items-center justify-center font-['Helvetica']"
          >
            i
          </button>
        </div>
      </div>
    </div>
  );
}
export default HeatMix;
