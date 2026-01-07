import { ChartBarHorizontal } from "../ui/barchart";
import { ChartLineInteractive } from "../ui/linechart";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Travel() {
  const heading = "Anreise";
  return (
    <div className="w-fit min-w-lg h-fit rounded-lg p-8 border shadow-lg relative">
      <div className="flex items-start flex-col h-fit w-fit">
        <div className="w-fit h-fit flex flex-row">
          <div className="w-fit h-fit flex flex-col">
            <div className="w-fit h-14 gap-1 flex flex-col items-start">
              <div className="w-fit">
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

        <ChartBarHorizontal></ChartBarHorizontal>
      </div>
    </div>
  );
}

export default Travel;
