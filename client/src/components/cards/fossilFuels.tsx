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

function FossilFuels() {
  const heading = "Fossile Brennstoffe";
  const erdöl = "Erdöl";
  const erdgas = "Erdgas";
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
          className="flex rounded-lg w-90 h-45 p-8 border shadow-lg"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <div className="flex flex-col w-full gap-1">
            <div className="flex flex-col">
              <p className="font-['Simple'] font-bold opacity-60 flex flex-start text-[10]">
                {heading}
              </p>
              <div className="h-[1px] w-full bg-gray-300"></div>
              <div className="flex flex-row justify-between mt-6">
                <div className="flex flex-col">
                  <p className="font-'Simple'] text-[8] opacity-60 font-light">
                    {erdöl}
                  </p>
                  <div>
                    <p className="font-'Simple'] text-[8] font-bold">20 t</p>
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="font-['Simple'] text-[8] opacity-60 font-light">
                    {erdgas}
                  </p>
                  <div>
                    <p className="font-'Simple'] text-[8] font-bold">10 t</p>
                  </div>
                </div>
                <div className="flex mb-10 justify-end items-end">
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
              <div className="flex flex-row justify-between"></div>
            </div>
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
export default FossilFuels;
