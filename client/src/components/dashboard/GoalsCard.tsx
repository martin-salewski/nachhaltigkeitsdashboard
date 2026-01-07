import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import { useState } from "react";

export function GoalsCard() {
  const [selectedYear, setSelectedYear] = useState("2026");

  const goals = [
    {
      id: 1,
      text: (
        <>
          Reduktion der CO<sub>2</sub>-Emissionen um 50 % bis 2028
        </>
      ),
    },
  ];

  return (
    <Card
      className="relative h-full"
      style={{ fontFamily: '"SimStd", sans-serif' }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground/90 flex flex-col gap-2">
          <h1 className="text-xl/4 font-bold text-black/60">
            Nachhaltigkeitsziele
          </h1>
          <Separator className="bg-black/10 h-2" />
          <div className="flex justify-end">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger
                size="sm"
                className="h-5 text-[10px] w-auto text-black/60 border-black/10 [&_svg]:text-black/60"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
                <SelectItem value="2028">2028</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#2B76BB] mt-1.5 flex-shrink-0" />
              <p className="text-sm text-black/70">{goal.text}</p>
            </div>
          ))}
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

