import { Cloudy } from "lucide-react";

function CO2Button({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-label="CO₂"
      className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-300"
      onClick={onClick}
      type="button"
    >
      <Cloudy className="w-5 h-5" />
    </button>
  );
}

export default CO2Button;
