import React, { useState } from "react";
import { DonutChart } from "../ui/donutchart";
import { useRef } from "react";
function ElectricityMix() {
  const heading = "Strommix";
  const [isFlipped, setIsFlipped] = useState(false);
  const innerRef = useRef(null);

  return (
    <div className="max-w-lg w-90 h-90 max-h-lg rounded-lg p-8 border shadow-lg relative">
      <div className="flex flex-col gap-3">
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
  );
}
export default ElectricityMix;
