import { Button } from "../ui/button";
import { Timeline } from "../ui/timeline";
import type { TimelineItem } from "../ui/timeline";
import Arrow from "../../assets/icons/Vector.svg";
import gsap from "gsap";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);
  });

  const heading = "Nachhaltigkeitsziele";
  return (
    <div className="w-xl max-w-xs h-fit rounded-lg p-8 border shadow-lg relative">
      <div className="flex flex-row">
        <div className="flex flex-col">
          <div className="w-80 h-14 gap-1 flex flex-col items-start">
            <div>
              <p className="text-[10] font-['Simple'] opacity-60 font-bold flex flex-start">
                {heading}
              </p>
              <div className="w-full h-[1px] bg-gray-300"></div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="font-['Simple'] opacity-60 text-md">
                Jahr
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className="font-['Simple'] opacity-60 text-md">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="font-['Simple'] opacity-60 text-md">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="font-['Simple'] opacity-60 text-md">
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem className="font-['Simple'] opacity-60 text-md">
                  Team
                </DropdownMenuItem>
                <DropdownMenuItem className="font-['Simple'] opacity-60 text-md">
                  Subscription
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            ;
          </div>
        </div>
        <div className="absolute top-2 right-2 bg-gray-400 rounded-full w-5 h-5 text-white flex items-center justify-center font-['Helvetica']">
          i
        </div>
      </div>
      <Timeline items={items}></Timeline>
    </div>
  );
}

export default Goals;
