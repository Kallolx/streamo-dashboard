"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import TracksTable from "@/components/Dashboard/Tables/TracksTable";

export default function TracksPage() {
  return (
    <DashboardLayout 
      title="Tracks" 
      subtitle="Manage your music tracks"
    >
      <TracksTable />
    </DashboardLayout>
  );
} 