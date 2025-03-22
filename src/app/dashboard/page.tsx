"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardHome from "@/components/Dashboard/DashboardHome";

export default function Dashboard() {
  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle="Welcome back, James"
    >
      <DashboardHome />
    </DashboardLayout>
  );
} 