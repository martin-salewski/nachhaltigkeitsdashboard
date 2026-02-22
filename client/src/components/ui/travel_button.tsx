import { TramFront } from "lucide-react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/all";
import { DashboardGrid } from "../dashboard/DashboardFilter";

function TravelButton() {
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
    <button
      aria-label="CO₂"
      className={`flex items-center gap-2 px-3 py-2 transition-colors rounded-lg border border-gray-300 ${
        showOnlyCO2 ? "bg-[#2B76BB]" : "bg-white hover:bg-gray-100"
      }`}
      onClick={toggleCO2}
      type="button"
    >
      <TramFront className={`w-5 h-5 ${showOnlyCO2 ? "text-white" : "text-[#2B76BB]"}`} />
    </button>
  );
}

export default TravelButton;
