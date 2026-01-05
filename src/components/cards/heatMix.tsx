import React from "react";
import { DonutChart } from "../ui/donutchart";
function HeatMix() {
  return (
    <DonutChart labels={["Desktop", "Tablet", "Mobile"]} data={[55, 25, 20]} />
  );
}
export default HeatMix;
