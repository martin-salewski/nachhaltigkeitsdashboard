import { useQueryClient, useQuery } from "@tanstack/react-query";
import { ChartRadialText } from "../ui/raidalchart";

function TotalScore() {
  const queryClient = useQueryClient();

  const { isPending, error, data, isFetching, isLoading } = useQuery({
    queryKey: ["score"],
    queryFn: async () => {
      const response = await fetch("/random-api?min=1&max=100");
      return await response.json();
    },
  });

  {
    isPending ? <div>Loading...</div> : null;
  }

  {
    isLoading ? <div>Loading...</div> : null;
  }

  const heading = "Gesamtbewertung des Gebäudes";
  const description =
    "CO2-Emissionen des Gebäudes pro Person im Monatsdurchschnitt";
  return (
    <div className="w-fit h-fit rounded-lg p-8 border shadow-lg relative">
      <div className="flex flex-row">
        <div className="flex flex-col">
          <div className="w-80 h-14 gap-1 flex flex-col items-start">
            <div>
              <p className="text-[10] font-['Simple'] opacity-60 font-bold flex flex-start">
                {heading}
              </p>
              <div className="w-full h-[1px] bg-gray-300"></div>
            </div>
            <p className="text-[10px] font-['Simple'] font-normal flex flex-start">
              {description}
            </p>
          </div>
          <div className="flex flex-row justify-center pt-6">
            <ChartRadialText score={Number(data?.[0] ?? 10)} />
          </div>
        </div>
        <div className="absolute top-2 right-2 bg-gray-400 rounded-full w-5 h-5 text-white flex items-center justify-center font-['Helvetica']">
          i
        </div>
      </div>
    </div>
  );
}

export default TotalScore;
