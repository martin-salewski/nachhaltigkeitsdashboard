import { Download } from "lucide-react";

function DownloadButton() {
  return (
    <button
      className=" bg-white rounded-lg h-10 flex gap-x-2 flex-row justify-center items-center w-45 border py-6"
      type="button"
    >
      <Download></Download>
      <p>Download Report</p>
    </button>
  );
}
export default DownloadButton;
