function Employees() {
  const heading = 278;
  const description = "Beschälftigte";
  return (
    <div className="w-2xs h-fit rounded-lg p-8 border shadow-lg relative">
      <div className="w-fit h-fit flex flex-row">
        <div className="w-fit h-fit flex flex-col">
          <div className="w-fit h-14 gap-1 flex flex-col items-start">
            <div className="w-fit">
              <p className="text-4xl font-['Simple'] font-bold flex flex-start">
                {heading}
              </p>
              <div className="w-full min-w-60 h-[1px] bg-gray-300"></div>
            </div>
            <p className="base font-['Simple'] font-normal text-[15px] opacity-60 flex flex-start">
              {description}
            </p>
          </div>
        </div>
        <div className="absolute top-2 right-2 bg-gray-400 rounded-full w-5 h-5 text-white flex items-center justify-center font-['Helvetica']">
          i
        </div>
      </div>
    </div>
  );
}

export default Employees;
