"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import VideosTable from "@/components/Dashboard/Tables/VideosTable";

export default function VideosPage() {
  return (
    <DashboardLayout 
      title="Videos" 
      subtitle="Manage your music videos"
    >
      <VideosTable />
    </DashboardLayout>
  );
} 