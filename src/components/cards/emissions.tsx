import { ChartLineInteractive } from "../ui/linechart";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Emissions() {
  const heading = "Emissionen";
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div className="w-fit w-fit h-fit rounded-lg p-8 border shadow-lg relative">
      <div>
        <div className="w-fit h-fit flex flex-row">
          <div className="w-fit h-fit flex flex-col">
            <div className="w-fit h-14 gap-1 flex flex-col">
              <div className="w-fit flex flex-col items-start">
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
          </div>
          <button
            onClick={() => setIsFlipped((prev) => !prev)}
            aria-label="Info Anzeigen"
            className="absolute top-2 right-2 bg-gray-400 rounded-full w-5 h-5 text-white flex items-center justify-center font-['Helvetica']"
          >
            i
          </button>
          {/*          <div className="absolute top-2 right-2 bg-gray-400 rounded-full w-5 h-5 text-white flex items-center justify-center font-['Helvetica']">
            i
          </div> */}
        </div>

        <ChartLineInteractive></ChartLineInteractive>
      </div>
    </div>
  );
}

export default Emissions;
