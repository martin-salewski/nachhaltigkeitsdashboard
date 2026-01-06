import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  value: string;
  label: string;
  change?: string;
  changeType?: "positive" | "negative";
}

export function StatCard({ value, label, change, changeType }: StatCardProps) {
  return (
    <Card
      className="relative"
      style={{ fontFamily: '"SimStd", sans-serif' }}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-4xl font-bold text-black/80">{value}</p>
            <p className="text-sm text-black/60 mt-1">{label}</p>
          </div>
          {change && (
            <span
              className={`text-xs px-2 py-1 rounded ${
                changeType === "positive"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {changeType === "positive" ? "↗" : "↘"}
              {change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

