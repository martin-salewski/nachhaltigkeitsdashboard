import { Download } from "lucide-react";
import { type DashboardExportData } from "../../Types/dashboard.types"; // Dein Interface

interface DownloadButtonProps {
  data?: any;
}

function DownloadButton({ data }: DownloadButtonProps) {
  
  const downloadPDF = async () => {
    // 1. Daten in das Format des Interfaces bringen
    const exportData: DashboardExportData = {
      title: "Mein Projekt Report",
      userName: "Max Mustermann",
      date: new Date().toLocaleDateString('de-DE'),
      stats: [
        { label: "Umsatz", value: data.totalRevenue || "0 €" },
        { label: "Projekte", value: data.projectCount || 0 }
      ],
      tableData: data.items.map((item: any) => ({
        id: item.id,
        description: item.name,
        amount: item.price,
        status: item.status
      }))
    };

    try {
      // 2. Request an dein echtes Backend (Port 3000)
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData), // Jetzt schicken wir das korrekte Objekt!
      });

      if (!response.ok) throw new Error("Export fehlgeschlagen");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Report_${exportData.date}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url); // Aufräumen
    } catch (error) {
      console.error("PDF Fehler:", error);
      alert("Fehler beim Erstellen des PDFs");
    }
  };

  return (
    <button
      className="bg-white rounded-lg flex gap-x-2 flex-row justify-center items-center border px-3 py-2 transition-colors hover:bg-gray-100 cursor-pointer"
      type="button" 
      onClick={downloadPDF}
    >
      <Download className="w-5 h-5" />
      <p className="text-sm">Download Report</p>
    </button>
  );
}

export default DownloadButton;