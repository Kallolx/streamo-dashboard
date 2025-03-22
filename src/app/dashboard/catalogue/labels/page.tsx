"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import LabelsTable from "@/components/Dashboard/LabelsTable";

export default function LabelsPage() {
  return (
    <DashboardLayout 
      title="Labels" 
      subtitle="Manage your music labels"
    >
      <LabelsTable />
    </DashboardLayout>
  );
} 