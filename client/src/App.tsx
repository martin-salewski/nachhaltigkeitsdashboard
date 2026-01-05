import { AnreiseCard } from "@/components/dashboard/AnreiseCard";
import { EmissionsCard } from "@/components/dashboard/EmissionsCard";

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        <AnreiseCard />
        <EmissionsCard />
      </div>
    </div>
  );
}

export default App;
