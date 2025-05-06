"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import TracksTable from "@/components/Dashboard/Tables/TracksTable";

export default function TracksPage() {
  return (
    <DashboardLayout 
      title="Videos" 
      subtitle="Manage your videos"
    >
      <TracksTable />
    </DashboardLayout>
  );
} 