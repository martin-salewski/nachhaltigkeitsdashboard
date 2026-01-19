import { useLayoutEffect, useRef, useState, useCallback } from "react";
import Navbar from "@/components/ui/navbar";
import CO2Button from "@/components/ui/co2filter";
import { DashboardGrid } from "@/components/dashboard/DashboardCard";

import gsap from "gsap";
import { Flip } from "gsap/all";

gsap.registerPlugin(Flip);

function App() {
  const [showOnlyCO2, setShowOnlyCO2] = useState(false);

  const flipStateRef = useRef<Flip.FlipState | null>(null);

  const toggleCO2 = useCallback(() => {
    flipStateRef.current = Flip.getState("[data-card-id]");
    setShowOnlyCO2((p) => !p);
  }, []);

  useLayoutEffect(() => {
    if (!flipStateRef.current) return;

    Flip.from(flipStateRef.current, {
      duration: 0.7,
      scale: true,
      absolute: true,
      ease: "power1.inOut",
      stagger: 0.08,
      onEnter: (els) =>
        gsap.fromTo(els, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0 }),
    });

    flipStateRef.current = null;
  }, [showOnlyCO2]);

  return (
    <div
      className="min-h-screen p-6"
      style={{ fontFamily: '"SimStd", sans-serif' }}
    >
      <Navbar />

      <div className="mt-20 mb-10">
        <h1 className="font-bold text-2xl mb-1">Nachhaltigkeitsdashboard</h1>

        <p className="text-sm text-black/70 max-w-3xl">
          Willkommen auf dem Nachhaltigkeitsdashboard der Hochschule Mainz! Hier
          geben wir Einblick in unsere Aktivitäten und Fortschritte auf dem Weg
          zu mehr ökologischer, sozialer und ökonomischer Verantwortung,
          orientiert an unseren Nachhaltigkeitszielen (SDGs 4, 5, 6, 10, 11, 12,
          16 und 17). Gemeinsam gestalten wir eine zukunftsfähige Hochschule und
          freuen uns über Ihren Beitrag – mehr zu den 17 Nachhaltigkeitszielen
          finden Sie unter: https://sdgs.un.org/goals.
        </p>

        <div className="mt-4">
          <CO2Button onClick={toggleCO2} />
        </div>
      </div>

      <DashboardGrid showOnlyCO2={showOnlyCO2} />
    </div>
  );
}

export default App;
