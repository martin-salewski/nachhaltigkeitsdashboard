import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendBadgeProps {
  current: number;
  previous: number;
}

export function TrendBadge({ current, previous }: TrendBadgeProps) {
  if (previous === 0) return null;

  const diff = current - previous;
  const pct = Math.round((diff / previous) * 100);

  if (pct === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500">
        <Minus className="size-3" />
        0%
      </span>
    );
  }

  const positive = pct > 0;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        positive
          ? "bg-green-100 text-green-600"
          : "bg-red-100 text-red-500"
      }`}
    >
      {positive
        ? <TrendingUp className="size-3" />
        : <TrendingDown className="size-3" />
      }
      {positive ? "+" : ""}{pct}%
    </span>
  );
}
