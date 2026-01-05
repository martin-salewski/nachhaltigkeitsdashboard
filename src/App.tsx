import { useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import TotalScore from "./components/cards/totalScore";
import Students from "./components/cards/students";
import Employees from "./components/cards/employee";
import Profs from "./components/cards/profs";
import Goals from "./components/cards/goals";
import Emissions from "./components/cards/emissions";
import Travel from "./components/cards/travel";
import HeatMix from "./components/cards/heatMix";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-3">
        <TotalScore />
        <Students />
        <Employees />
        <Profs />
      </div>
      <div className="flex flex-row gap-3 flex-start">
        <div className="flex flex-row gap-3">
          <Goals />
        </div>
        <Emissions />
        <Travel />
      </div>
      <div>
        <HeatMix />
      </div>
    </div>
  );
}

export default App;
