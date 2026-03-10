declare module "react-svg" {
  import * as React from "react";

  export interface ReactSVGProps {
    src: string;
    beforeInjection?: (svg: SVGSVGElement) => void;
    className?: string;
  }

  export const ReactSVG: React.FC<ReactSVGProps>;
}
