import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Info, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import gsap from "gsap";

export function Mensa() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const flipCard = useCallback(() => {
    if (
      isAnimating ||
      !cardRef.current ||
      !frontRef.current ||
      !backRef.current
    )
      return;

    setIsAnimating(true);
    const timeline = gsap.timeline({
      onComplete: () => {
        setIsFlipped(!isFlipped);
        setIsAnimating(false);
      },
    });

    if (!isFlipped) {
      // Flip to back
      timeline
        .to(cardRef.current, {
          rotateY: 90,
          duration: 0.3,
          ease: "power2.in",
        })
        .set(frontRef.current, { visibility: "hidden" })
        .set(backRef.current, { visibility: "visible" })
        .to(cardRef.current, {
          rotateY: 180,
          duration: 0.3,
          ease: "power2.out",
        });
    } else {
      // Flip to front
      timeline
        .to(cardRef.current, {
          rotateY: 90,
          duration: 0.3,
          ease: "power2.in",
        })
        .set(backRef.current, { visibility: "hidden" })
        .set(frontRef.current, { visibility: "visible" })
        .to(cardRef.current, {
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
        });
    }
  }, [isFlipped, isAnimating]);

  return (
    <div
      className="perspective-[1000px]"
      style={{ fontFamily: '"SimStd", sans-serif' }}
    >
      <div
        ref={cardRef}
        className="relative transform-style-3d"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div
          ref={frontRef}
          className="backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Card className="relative">
            <CardHeader className="">
              <CardTitle className="text-base font-medium text-foreground/90 flex flex-col gap-2">
                <h1 className="text-xl/4 font-bold text-black/60">Anreise</h1>
                <Separator className="bg-black/10 h-2" />
                <div className="flex gap-2 w-full justify-end">
                  <Select>
                    <SelectTrigger
                      size="sm"
                      className="h-5 text-[10px] w-auto text-black/60 border-black/10 [&_svg]:text-black/60"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gesamt">gesamt</SelectItem>
                      <SelectItem value="studierende">Studierende</SelectItem>
                      <SelectItem value="mitarbeiter">Mitarbeiter</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger
                      size="sm"
                      className="h-5 text-[10px] w-auto text-black/60 border-black/10 [&_svg]:text-black/60"
                    >
                      <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem
                          key={`${period.year}-${period.semester}`}
                          value={`${period.year}-${period.semester}`}
                        >
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="">
              {isLoading ? (
                <div className="flex items-center justify-center h-[180px]">
                  <div className="animate-pulse text-muted-foreground text-sm">
                    Laden...
                  </div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">
                  Keine Daten verfügbar
                </div>
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="h-[180px] w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 0, right: 50 }}
                  >
                    <CartesianGrid
                      horizontal={false}
                      strokeDasharray="4 4"
                      stroke="#e5e7eb"
                    />
                    <YAxis
                      dataKey="mode"
                      type="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      width={60}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        chartConfig[value as keyof typeof chartConfig]?.label ??
                        value
                      }
                    />
                    <XAxis
                      dataKey="count"
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => value.toLocaleString("de-DE")}
                      domain={[0, maxCount]}
                      tickCount={5}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          hideLabel
                          formatter={(value) => [
                            `${Number(value).toLocaleString("de-DE")} Personen`,
                            "",
                          ]}
                        />
                      }
                    />
                    <Bar
                      dataKey="count"
                      layout="vertical"
                      radius={[0, 4, 4, 0]}
                      barSize={28}
                    >
                      <LabelList
                        dataKey="percentage"
                        position="right"
                        offset={12}
                        className="fill-black/60 text-[11px]"
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
            {/* Info icon */}
            <button
              onClick={flipCard}
              className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10"
              aria-label="Mehr Informationen"
            >
              <Info className="size-4" />
            </button>
          </Card>
        </div>

        {/* Back of card */}
        <div
          ref={backRef}
          className="absolute inset-0 backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            visibility: "hidden",
          }}
        >
          <Card className="relative h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-foreground/90">
                Über diese Karte
              </CardTitle>
            </CardHeader>
            <Separator className="mb-2" />
            <CardContent className="pt-2 overflow-hidden">
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Anreise</strong> zeigt die
                  Verteilung der Verkehrsmittel, mit denen Studierende und
                  Mitarbeitende zur Hochschule kommen.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Kategorien:</h4>
                  <ul className="space-y-1 text-xs">
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#1D3A6A]" />
                      <span>ÖPNV – Öffentlicher Nahverkehr</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#2B76BB]" />
                      <span>Auto – PKW-Nutzung</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#4DBAF7]" />
                      <span>Fahrrad – Radfahrer</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#7DB8FF]" />
                      <span>zu Fuß – Fußgänger</span>
                    </li>
                  </ul>
                </div>
                <p className="text-xs">
                  Datenquelle: Mobilitätsbefragung {selectedPeriodLabel}
                </p>
              </div>
            </CardContent>
            {/* Close icon */}
            <button
              onClick={flipCard}
              className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10"
              aria-label="Zurück zur Ansicht"
            >
              <X className="size-4" />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
