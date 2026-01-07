import { AnreiseCard } from "@/components/dashboard/AnreiseCard";
import { EmissionsCard } from "@/components/dashboard/EmissionsCard";
import { BuildingRatingCard } from "@/components/dashboard/BuildingRatingCard";
import { StatCard } from "@/components/dashboard/StatCard";

function App() {
  return (
    <div
      className="min-h-screen p-6"
      style={{ fontFamily: '"SimStd", sans-serif' }}
    >
      <div className="grid xl:grid-cols-12 gap-8 lg:grid-cols-9 md:grid-cols-6 sm:grid-cols-1">
        <div className="xl:col-span-3 lg:col-span-3 md:col-span-3 md:row-span-3 sm:col-span-1 row-span-2">
          <BuildingRatingCard />
        </div>
        <div className="row-span-1 xl:col-span-3 lg:col-span-2 md:col-span-3 sm:col-span-1">
          <StatCard
            value="100"
            label="Emissionen"
            change="10%"
            changeType="positive"
          />
        </div>
        <div className="row-span-1 xl:col-span-3 lg:col-span-2 md:col-span-3 sm:col-span-1">
          <StatCard
            value="100"
            label="Emissionen"
            change="10%"
            changeType="positive"
          />
        </div>
        <div className="row-span-1 xl:col-span-3 lg:col-span-2 md:col-span-3 sm:col-span-1">
          <StatCard
            value="100"
            label="Emissionen"
            change="10%"
            changeType="positive"
          />
        </div>
        <div className="row-span-2 xl:col-span-6 lg:col-span-6 md:col-span-6 sm:col-span-1">
          <EmissionsCard />
        </div>
        <div className="row-span-2 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-1">
          <AnreiseCard />
        </div>
      </div>
    </div>
  );
}

export default App;
