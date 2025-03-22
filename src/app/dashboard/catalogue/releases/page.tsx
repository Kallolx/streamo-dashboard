"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import ReleasesTable from "@/components/Dashboard/ReleasesTable";

export default function ReleasesPage() {
  return (
    <DashboardLayout 
      title="Releases" 
      subtitle="Manage your music releases"
    >
      <ReleasesTable />
    </DashboardLayout>
  );
} 