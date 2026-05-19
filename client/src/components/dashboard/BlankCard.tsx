import gsap from "gsap";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useRef, useCallback, useEffect } from "react";
import { Info, X, Thermometer, Droplets, Cloud, Wind, CloudFog } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

interface AirQualityRow {
  id: number;
  timestamp: string;
  temperature: number;
  co2: number;
  moisture: number;
  voc: number;
  pm25: number;
  pm10: number;
}

async function fetchAirQuality(): Promise<AirQualityRow[]> {
  const res = await fetch("http://localhost:3000/api/air_quality?limit=48");
  if (!res.ok) throw new Error("Failed to fetch air quality");
  return res.json();
}

function getStatus(key: keyof Omit<AirQualityRow, "id" | "timestamp">, value: number): "gut" | "mittel" | "schlecht" {
  if (key === "co2")         { return value < 800 ? "gut" : value < 1400 ? "mittel" : "schlecht"; }
  if (key === "moisture")    { return value >= 40 && value <= 60 ? "gut" : value >= 30 && value <= 70 ? "mittel" : "schlecht"; }
  if (key === "temperature") { return value >= 20 && value <= 24 ? "gut" : value >= 18 && value <= 27 ? "mittel" : "schlecht"; }
  if (key === "pm25")        { return value < 12 ? "gut" : value < 35 ? "mittel" : "schlecht"; }
  if (key === "pm10")        { return value < 54 ? "gut" : value < 154 ? "mittel" : "schlecht"; }
  /* voc */                    return value < 250 ? "gut" : value < 500 ? "mittel" : "schlecht";
}

const statusBar = { gut: "bg-green-500", mittel: "bg-orange-400", schlecht: "bg-red-500" } as const;

interface MetricConfig {
  key: keyof Omit<AirQualityRow, "id" | "timestamp">;
  label: string;
  unit: string;
  icon: React.ReactNode;
  decimals: number;
  color: string;
}

// Layout rows: [half, half] | [full] | [half, half] | [full]
const ROW1: MetricConfig[] = [
  { key: "temperature", label: "Temperatur",       unit: "°C",   icon: <Thermometer className="w-3.5 h-3.5" />, decimals: 1, color: "#4DBAF7" },
  { key: "moisture",    label: "Luftfeuchtigkeit", unit: "%",    icon: <Droplets className="w-3.5 h-3.5" />,    decimals: 1, color: "#1F8FCE" },
];
const ROW2: MetricConfig[] = [
  { key: "co2",         label: "CO₂",             unit: "ppm",  icon: <Cloud className="w-3.5 h-3.5" />,       decimals: 0, color: "#1D3A6A" },
];
const ROW3: MetricConfig[] = [
  { key: "pm25",        label: "PM2.5",            unit: "µg/m³",icon: <CloudFog className="w-3.5 h-3.5" />,     decimals: 1, color: "#4D719C" },
  { key: "pm10",        label: "PM10",             unit: "µg/m³",icon: <CloudFog className="w-3.5 h-3.5" />,     decimals: 1, color: "#7196C6" },
];
const ROW4: MetricConfig[] = [
  { key: "voc",         label: "VOC",              unit: "ppb",  icon: <Wind className="w-3.5 h-3.5" />,        decimals: 0, color: "#7DB8FF" },
];

function CustomTooltip({ active, payload, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-black/10 rounded px-2 py-1 text-xs shadow-sm text-black/70">
      {Number(payload[0].value).toFixed(1)} {unit}
    </div>
  );
}

function Metric({
  cfg, data, borderRight = false, borderBottom = false,
}: {
  cfg: MetricConfig;
  data: AirQualityRow[];
  borderRight?: boolean;
  borderBottom?: boolean;
}) {
  const latest = data[data.length - 1];
  if (!latest) return <div className="flex-1" />;

  const value = latest[cfg.key] as number;
  const status = getStatus(cfg.key, value);
  const barCls = statusBar[status];
  const sparkData = data.map((row, i) => ({ i, v: row[cfg.key] as number }));
  const gradId = `grad-${cfg.key}`;

  return (
    <div className={[
      "flex flex-col min-w-0 min-h-0 flex-1",
      borderRight  ? "border-r border-black/8" : "",
      borderBottom ? "border-b border-black/8" : "",
    ].join(" ")}>
      {/* Label + value with vertical status line */}
      <div className="flex items-stretch gap-2 px-3 pt-2 pb-1">
        <div className={`w-[4px] rounded-full shrink-0 self-stretch ${barCls}`} />
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-xs text-black/40 font-medium leading-none">{cfg.label}</span>
            <span className="text-black/30">{cfg.icon}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-black/80 leading-none">
              {value.toFixed(cfg.decimals)}
            </span>
            <span className="text-xs text-black/40">{cfg.unit}</span>
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div className="flex-1 min-h-0 px-1 pb-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData} margin={{ top: 2, right: 4, left: 4, bottom: 2 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={cfg.color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={cfg.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Tooltip
              content={<CustomTooltip unit={cfg.unit} />}
              cursor={{ stroke: cfg.color, strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke={cfg.color}
              strokeWidth={1.5}
              fill={`url(#${gradId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function BlankCard() {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { data = [] } = useQuery({
    queryKey: ["air-quality"],
    queryFn: fetchAirQuality,
    refetchInterval: 60_000,
  });

  const cardRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!frontRef.current || !backRef.current) return;
    frontRef.current.style.visibility = "visible";
    backRef.current.style.visibility = "hidden";
  }, []);

  const flipCard = useCallback(() => {
    if (isAnimating || !cardRef.current || !frontRef.current || !backRef.current) return;
    setIsAnimating(true);
    const tl = gsap.timeline({
      onComplete: () => { setIsFlipped((p) => !p); setIsAnimating(false); },
    });
    if (!isFlipped) {
      tl.to(cardRef.current, { rotateY: 90, duration: 0.3, ease: "power2.in" })
        .set(frontRef.current, { visibility: "hidden" })
        .set(backRef.current, { visibility: "visible" })
        .to(cardRef.current, { rotateY: 180, duration: 0.3, ease: "power2.out" });
    } else {
      tl.to(cardRef.current, { rotateY: 90, duration: 0.3, ease: "power2.in" })
        .set(backRef.current, { visibility: "hidden" })
        .set(frontRef.current, { visibility: "visible" })
        .to(cardRef.current, { rotateY: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [isFlipped, isAnimating]);

  return (
    <div className="perspective-[1000px] w-full h-full" style={{ fontFamily: '"SimStd", sans-serif' }}>
      <div ref={cardRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>

        {/* FRONT */}
        <div ref={frontRef} style={{ backfaceVisibility: "hidden" }} className="h-full w-full">
          <Card className="relative w-full h-full flex flex-col">
            <CardHeader className="pb-1">
              <CardTitle><h1 className="title">Luftqualität</h1></CardTitle>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 flex flex-col">
              <Separator className="bg-black/10 h-2 mb-3" />

              {/* Vertical layout: small | full | small | full */}
              <div className="flex flex-col flex-1 min-h-0">

                {/* Row 1: Temperatur | Luftfeuchtigkeit */}
                <div className="flex border-b border-black/8" style={{ flex: "1" }}>
                  {ROW1.map((cfg, i) => (
                    <Metric key={cfg.key} cfg={cfg} data={data} borderRight={i === 0} />
                  ))}
                </div>

                {/* Row 2: CO₂ full width */}
                <div className="flex border-b border-black/8" style={{ flex: "1.4" }}>
                  {ROW2.map((cfg) => (
                    <Metric key={cfg.key} cfg={cfg} data={data} />
                  ))}
                </div>

                {/* Row 3: PM2.5 | PM10 */}
                <div className="flex border-b border-black/8" style={{ flex: "1" }}>
                  {ROW3.map((cfg, i) => (
                    <Metric key={cfg.key} cfg={cfg} data={data} borderRight={i === 0} />
                  ))}
                </div>

                {/* Row 4: VOC full width */}
                <div className="flex" style={{ flex: "1.4" }}>
                  {ROW4.map((cfg) => (
                    <Metric key={cfg.key} cfg={cfg} data={data} />
                  ))}
                </div>

              </div>
            </CardContent>

            <button
              onClick={flipCard}
              disabled={isAnimating}
              className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10 disabled:opacity-50 cursor-pointer"
            >
              <Info className="size-4" />
            </button>
          </Card>
        </div>

        {/* BACK */}
        <div
          ref={backRef}
          className="absolute inset-0 h-full w-full"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", visibility: "hidden" }}
        >
          <Card className="relative h-full">
            <CardHeader className="pb-1">
              <CardTitle>
                <h1 className="font-bold opacity-60 text-lg font-['SimStd']">{t("cardBack.title")}</h1>
              </CardTitle>
            </CardHeader>
            <Separator className="mb-2 bg-black/10" />
            <CardContent className="pt-2 text-sm text-muted-foreground space-y-3 text-justify">
              <p>{t("airQuality.back.description")}</p>
              <ul className="space-y-2 mt-1">
                <li className="flex items-center gap-2"><Thermometer className="w-3.5 h-3.5 shrink-0" /> {t("airQuality.back.temperature")}</li>
                <li className="flex items-center gap-2"><Droplets className="w-3.5 h-3.5 shrink-0" /> {t("airQuality.back.moisture")}</li>
                {([
                  { icon: <Cloud className="w-3.5 h-3.5 shrink-0" />, good: t("airQuality.back.co2"), medium: t("airQuality.back.co2Range"), bad: t("airQuality.back.co2Bad") },
                  { icon: <CloudFog className="w-3.5 h-3.5 shrink-0" />, good: t("airQuality.back.pm25"), medium: t("airQuality.back.pm25Range"), bad: t("airQuality.back.pm25Bad") },
                  { icon: <CloudFog className="w-3.5 h-3.5 shrink-0" />, good: t("airQuality.back.pm10"), medium: t("airQuality.back.pm10Range"), bad: t("airQuality.back.pm10Bad") },
                  { icon: <Wind className="w-3.5 h-3.5 shrink-0" />, good: t("airQuality.back.voc"), medium: t("airQuality.back.vocRange"), bad: t("airQuality.back.vocBad") },
                ] as const).map((row, i) => (
                  <li key={i} className="flex items-start gap-2 flex-col">
                    <span className="flex items-center gap-2">{row.icon} <span>{row.good.split(" — ")[0]}</span></span>
                    <div className="flex flex-col gap-0.5 ml-5">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-600 shrink-0" />
                        <span className="text-xs">{row.good.split(" — ")[1]} · {t("airQuality.back.good")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                        <span className="text-xs">{row.medium} · {t("airQuality.back.medium")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-red-600 shrink-0" />
                        <span className="text-xs">{row.bad} · {t("airQuality.back.bad")}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
            <button
              onClick={flipCard}
              disabled={isAnimating}
              className="absolute top-3 right-3 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10 disabled:opacity-50 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </Card>
        </div>

      </div>
    </div>
  );
}
