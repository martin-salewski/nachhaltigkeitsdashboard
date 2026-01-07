import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info } from "lucide-react";

export function BuildingRatingCard() {
  const score = 92;

  return (
    <Card
      className="relative h-full"
      style={{ fontFamily: '"SimStd", sans-serif' }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground/90 flex flex-col gap-2">
          <h1 className="text-xl/4 font-bold text-black/60">
            Gesamtbewertung des Gebäudes
          </h1>
          <Separator className="bg-black/10 h-2" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-black/50 mb-6">
          CO2-Emissionen des Gebäudes pro Person im Monatsdurchschnitt
        </p>
        <div className="flex items-center justify-center">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#2B76BB"
                strokeWidth="6"
                strokeDasharray={`${score * 2.51} ${100 * 2.51}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-black/80">{score}</span>
              <span className="text-xs text-black/50">{score}/100</span>
            </div>
          </div>
        </div>
      </CardContent>
      <button
        className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        aria-label="Mehr Informationen"
      >
        <Info className="size-4" />
      </button>
    </Card>
  );
}
