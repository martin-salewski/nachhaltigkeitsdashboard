// shared/dashboard.types.ts
export interface DashboardExportData {
    title: string;
    userName: string;
    date: string;
    stats: {
      label: string;
      value: string | number;
    }[];
    tableData: {
      id: number | string;
      description: string;
      amount: number;
      status: string;
    }[];
  }