// src/components/DashboardExport.tsx
import { type DashboardExportData } from '../Types/dashboard.types';

export const DashboardExport = ({ currentData }: { currentData: any }) => {
  
  const handleDownload = async () => {
    // 1. Daten für das PDF vorbereiten (Mapping von deinem App-State auf das Interface)
    const exportData: DashboardExportData = {
      title: "Finanz-Dashboard Q1",
      userName: "Max Mustermann",
      date: new Date().toLocaleDateString(),
      stats: [
        { label: "Gesamtumsatz", value: "15.000 €" },
        { label: "Aktive Projekte", value: 12 }
      ],
      tableData: currentData.items // Deine echten Daten aus dem React State
    };

    // 2. Den API-Call machen
    const response = await fetch('http://localhost:3000/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exportData),
    });

    // 3. Den Datei-Download im Browser triggern
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Export_${exportData.date}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <button 
      onClick={handleDownload}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
    >
      Als PDF speichern
    </button>
  );
};