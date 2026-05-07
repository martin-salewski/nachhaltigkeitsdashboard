export type TimelineItem = {
  title: string;
  year?: number;
  completed?: boolean;
  completedLabel?: string;
};

/* export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ul className="relative border-l border-dashed border-gray-300 list-none pl-0">
      {items.map((item, index) => (
        <li key={index} className="relative mb-6 ml-4">
          <span className="absolute -left-5.5 mt-1 flex h-3 w-3 rounded-full bg-[var(--hscolor-1)]" />
          <div className="space-y-1">
            <p className="text-xs font-['Helvetica'] flex flex-start ml-7">
              {item.title}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
} */

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ul className="relative">
      {items.map((goal, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <li key={idx} className="relative flex gap-3">
            {/* year label left of dot */}
            <span className="text-xs text-muted-foreground/60 w-8 text-right mt-1 shrink-0 font-['HelveticaNowText']">
              {goal.year ?? ""}
            </span>

            {/* dot + dashed line */}
            <div className="relative flex justify-center shrink-0">
              <span className="mt-1 h-3 w-3 rounded-full bg-(--color-chart-1)" />
              {!isLast && (
                <span
                  className="absolute top-3 -bottom-4 w-px border-l-2 border-dashed border-muted-foreground/40"
                  aria-hidden="true"
                />
              )}
            </div>

            {/* right content */}
            <p className={`text-xs leading-5 font-['HelveticaNowText'] w-full text-start pb-8 ${goal.completed ? "text-foreground/40" : "text-foreground/80"}`}>
              {goal.title}
              {goal.completed && (
                <span className="ml-1.5 text-foreground/50">{goal.completedLabel ?? "(abgeschlossen)"}</span>
              )}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
