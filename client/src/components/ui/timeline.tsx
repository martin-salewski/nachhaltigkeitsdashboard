export type TimelineItem = {
  title: string;
  description?: string;
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative border-l border-dashed border-gray-300 list-none pl-0">
      {items.map((item, index) => (
        <li key={index} className="relative mb-6 ml-4">
          <span className="absolute -left-5.5 mt-1 flex h-3 w-3 rounded-full bg-[var(--hscolor-1)]" />
          <div className="space-y-1">
            <p className="text-xs font-['Helvetica'] flex flex-start ml-7">
              {item.title}
            </p>
            {item.description && (
              <p className="text-[11px] text-gray-500">{item.description}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
