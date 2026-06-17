import gsap from "gsap";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useState, useRef, useCallback, useEffect } from "react";
import { Info, X, Thermometer, Droplets, Cloud/*, Wind, CloudFog*/ } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

interface SensorRow {
  id: number;
  timestamp: string;
  location: string;
  temperature: number;
  humidity: number;
  co2: number;
}

const PERIOD_VALUES = ["24h", "1w", "1m"] as const;

async function fetchLocations(): Promise<string[]> {
  const res = await fetch("/api/sensor_data/locations");
  if (!res.ok) throw new Error("Failed to fetch locations");
  return res.json();
}

async function fetchSensorData(location: string, period: string): Promise<SensorRow[]> {
  const res = await fetch(`/api/sensor_data?location=${encodeURIComponent(location)}&period=${period}`);
  if (!res.ok) throw new Error("Failed to fetch sensor data");
  return res.json();
}

function getStatus(key: "temperature" | "humidity" | "co2", value: number, temp?: number): "gut" | "mittel" | "schlecht" {
  if (key === "co2")         return value < 800 ? "gut" : value < 1400 ? "mittel" : "schlecht";
  if (key === "temperature") return value >= 21 && value <= 23 ? "gut" : value >= 18 && value <= 26 ? "mittel" : "schlecht";
  if (key === "humidity") {
    const t = temp ?? 21;
    if (t >= 14 && t <= 17) {
      if (value >= 40 && value <= 60) return "gut";
      if (value >= 30 && value <= 65) return "mittel";
      return "schlecht";
    }
    if (t >= 18 && t <= 24) {
      if (value >= 40 && value <= 55) return "gut";
      if (value >= 30 && value <= 65) return "mittel";
      return "schlecht";
    }
    if (t >= 25 && t <= 28) {
      if (value >= 30 && value <= 50) return "gut";
      if (value >= 25 && value <= 60) return "mittel";
      return "schlecht";
    }
    if (t >= 29 && t <= 34) {
      if (value >= 20 && value <= 40) return "gut";
      if (value > 40 && value <= 45) return "mittel";
      return "schlecht";
    }
    // Fallback außerhalb definierter Temperaturbereiche
    if (value >= 40 && value <= 55) return "gut";
    if (value >= 30 && value <= 65) return "mittel";
    return "schlecht";
  }
  return "gut";
}

// getStatus cases for future sensors (commented out until sensors provide these values):
// if (key === "pm25") return value < 12 ? "gut" : value < 35 ? "mittel" : "schlecht";
// if (key === "pm10") return value < 54 ? "gut" : value < 154 ? "mittel" : "schlecht";
// voc: return value < 250 ? "gut" : value < 500 ? "mittel" : "schlecht";

const statusBar = { gut: "bg-green-500", mittel: "bg-orange-400", schlecht: "bg-red-500" } as const;

interface MetricConfig {
  key: "temperature" | "humidity" | "co2";
  label: string;
  unit: string;
  icon: React.ReactNode;
  decimals: number;
  color: string;
}

function useMetricRows(t: (key: string) => string) {
  const ROW1: MetricConfig[] = [
    { key: "temperature", label: t("airQuality.metrics.temperature"), unit: "°C",  icon: <Thermometer className="w-3.5 h-3.5" />, decimals: 1, color: "#4DBAF7" },
    { key: "humidity",    label: t("airQuality.metrics.humidity"),    unit: "%",   icon: <Droplets className="w-3.5 h-3.5" />,    decimals: 1, color: "#1F8FCE" },
  ];
  const ROW2: MetricConfig[] = [
    { key: "co2", label: t("airQuality.metrics.co2"), unit: "ppm", icon: <Cloud className="w-3.5 h-3.5" />, decimals: 0, color: "#1D3A6A" },
  ];
  return { ROW1, ROW2 };
}

// Commented out until sensors provide these values:
// const ROW3: MetricConfig[] = [
//   { key: "pm25", label: "PM2.5", unit: "µg/m³", icon: <CloudFog className="w-3.5 h-3.5" />, decimals: 1, color: "#4D719C" },
//   { key: "pm10", label: "PM10",  unit: "µg/m³", icon: <CloudFog className="w-3.5 h-3.5" />, decimals: 1, color: "#7196C6" },
// ];
// const ROW4: MetricConfig[] = [
//   { key: "voc", label: "VOC", unit: "ppb", icon: <Wind className="w-3.5 h-3.5" />, decimals: 0, color: "#7DB8FF" },
// ];

function formatTs(ts: string, period: string): string {
  const d = new Date(ts);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  if (period === "24h") return `${hh}:${mm}`;
  const day = d.getDate().toString().padStart(2, "0");
  const mon = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${day}.${mon}. ${hh}:${mm}`;
}

function CustomTooltip({ active, payload, unit, period }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const ts: string | undefined = entry.payload?.ts;
  return (
    <div className="bg-white border border-black/10 rounded px-2 py-1 text-xs shadow-sm text-black/70">
      <div>{Number(entry.value).toFixed(1)} {unit}</div>
      {ts && <div className="text-black/40 mt-0.5">{formatTs(ts, period)}</div>}
    </div>
  );
}

function Metric({
  cfg, data, period, borderRight = false, borderBottom = false,
}: {
  cfg: MetricConfig;
  data: SensorRow[];
  period: string;
  borderRight?: boolean;
  borderBottom?: boolean;
}) {
  const latest = data[data.length - 1];
  if (!latest) return <div className="flex-1" />;

  const value = latest[cfg.key] as number;
  const tempForHumidity = cfg.key === "humidity" ? (latest.temperature as number) : undefined;
  const status = getStatus(cfg.key, value, tempForHumidity);
  const barCls = statusBar[status];
  const sparkData = data.map((row, i) => ({ i, v: row[cfg.key] as number, ts: row.timestamp }));
  const gradId = `grad-${cfg.key}`;

  return (
    <div className={[
      "flex flex-col min-w-0 min-h-0 flex-1",
      borderRight  ? "border-r border-black/8" : "",
      borderBottom ? "border-b border-black/8" : "",
    ].join(" ")}>
      <div className="flex items-stretch gap-2 px-3 pt-2 pb-1">
        <div className={`w-[4px] rounded-full shrink-0 self-stretch ${barCls}`} />
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-xs text-black/60 font-medium leading-none">{cfg.label}</span>
            <span className="text-black/50">{cfg.icon}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-black/90 leading-none">
              {value.toFixed(cfg.decimals)}
            </span>
            <span className="text-xs text-black/60">{cfg.unit}</span>
          </div>
        </div>
      </div>
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
              content={<CustomTooltip unit={cfg.unit} period={period} />}
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

export function AirQualityCard() {
  const { t } = useTranslation();
  const { ROW1, ROW2 } = useMetricRows(t);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState("24h");

  const cardRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);

  const { data: locations = [] } = useQuery<string[]>({
    queryKey: ["sensor-locations"],
    queryFn: fetchLocations,
  });

  useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      setSelectedLocation(locations[0]);
    }
  }, [locations, selectedLocation]);

  const { data = [] } = useQuery<SensorRow[]>({
    queryKey: ["sensor-data", selectedLocation, selectedPeriod],
    queryFn: () => fetchSensorData(selectedLocation, selectedPeriod),
    enabled: !!selectedLocation,
    refetchInterval: 60_000,
  });

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
              <CardTitle>
                <h1 className="title">{t("airQuality.title")}</h1>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 flex flex-col">
              <Separator className="bg-black/10 h-2 mb-2" />

              <div className="flex gap-2 justify-end mb-2">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="selector">
                    <SelectValue placeholder={t("airQuality.room")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{t("airQuality.room")}</SelectLabel>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="selector">
                    <SelectValue placeholder={t("airQuality.period")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{t("airQuality.period")}</SelectLabel>
                      {PERIOD_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>{t(`airQuality.periods.${v}`)}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex border-b border-black/8" style={{ flex: "1" }}>
                  <Metric cfg={ROW1[0]} data={data} period={selectedPeriod} />
                </div>

                <div className="flex border-b border-black/8" style={{ flex: "1" }}>
                  <Metric cfg={ROW1[1]} data={data} period={selectedPeriod} />
                </div>

                <div className="flex" style={{ flex: "1" }}>
                  {ROW2.map((cfg) => (
                    <Metric key={cfg.key} cfg={cfg} data={data} period={selectedPeriod} />
                  ))}
                </div>

                {/* Row 3: PM2.5 | PM10 — auskommentiert, Sensor liefert keine Feinstaubdaten */}
                {/* <div className="flex border-b border-black/8" style={{ flex: "1" }}>
                  {ROW3.map((cfg, i) => (
                    <Metric key={cfg.key} cfg={cfg} data={data} borderRight={i === 0} />
                  ))}
                </div> */}

                {/* Row 4: VOC — auskommentiert, Sensor liefert keine VOC-Daten */}
                {/* <div className="flex" style={{ flex: "1.4" }}>
                  {ROW4.map((cfg) => (
                    <Metric key={cfg.key} cfg={cfg} data={data} />
                  ))}
                </div> */}
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
            <CardContent className="pt-2 text-xs text-muted-foreground space-y-3 text-justify">
              <p>{t("airQuality.back.description")}</p>
              <ul className="space-y-5 mt-1">

                <li className="flex items-start gap-2 flex-col">
                  <span className="flex items-center gap-2"><Droplets className="w-3.5 h-3.5 shrink-0" /> {t("airQuality.metrics.humidity")}</span>
                  <p lang="de" className="ml-5 text-xs text-black/60 text-left">{t("airQuality.back.moisture")}</p>
                  <p className="ml-5 text-xs text-black/50 font-medium mt-0.5">Relative Luftfeuchtigkeitsbereiche</p>
                  <table className="ml-5 text-xs border-collapse leading-4">
                    <thead>
                      <tr>
                        <th className="text-left font-normal pr-2 pb-0.5 text-black/50">°C</th>
                        <th className="text-left font-normal pr-2 pb-0.5 text-green-600">Gut</th>
                        <th className="text-left font-normal pb-0.5 text-orange-500">Mittel</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="pr-2 text-black/70">14–17</td><td className="pr-2 text-green-600">40–60 %</td><td className="text-orange-500">30–40 % / 60–65 %</td></tr>
                      <tr><td className="pr-2 text-black/70">18–24</td><td className="pr-2 text-green-600">40–55 %</td><td className="text-orange-500">30–40 % / 55–65 %</td></tr>
                      <tr><td className="pr-2 text-black/70">25–28</td><td className="pr-2 text-green-600">30–50 %</td><td className="text-orange-500">25–30 % / 50–60 %</td></tr>
                      <tr><td className="pr-2 text-black/70">29–34</td><td className="pr-2 text-green-600">20–40 %</td><td className="text-orange-500">40–45 %</td></tr>
                    </tbody>
                  </table>
                  <p className="ml-5 text-xs text-red-600 mt-0.5 text-left">{t("airQuality.back.moistureRedNote")}</p>
                </li>
                {([
                  { icon: <Thermometer className="w-3.5 h-3.5 shrink-0" />, good: t("airQuality.back.temperature"), medium: t("airQuality.back.temperatureRange"), bad: t("airQuality.back.temperatureBad") },
                  { icon: <Cloud className="w-3.5 h-3.5 shrink-0" />, good: t("airQuality.back.co2"), medium: t("airQuality.back.co2Range"), bad: t("airQuality.back.co2Bad") },
                  // { icon: <CloudFog className="w-3.5 h-3.5 shrink-0" />, good: t("airQuality.back.pm25"), medium: t("airQuality.back.pm25Range"), bad: t("airQuality.back.pm25Bad") },
                  // { icon: <CloudFog className="w-3.5 h-3.5 shrink-0" />, good: t("airQuality.back.pm10"), medium: t("airQuality.back.pm10Range"), bad: t("airQuality.back.pm10Bad") },
                  // { icon: <Wind className="w-3.5 h-3.5 shrink-0" />, good: t("airQuality.back.voc"), medium: t("airQuality.back.vocRange"), bad: t("airQuality.back.vocBad") },
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
