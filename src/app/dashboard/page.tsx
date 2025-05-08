"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardHome from "@/components/Dashboard/DashboardHome";
import AdminTools from '@/components/Dashboard/AdminTools';
import { isAdmin } from '@/services/authService';

export default function Dashboard() {
  return (
    <DashboardLayout>
      {isAdmin() && <AdminTools />}
      <DashboardHome />
    </DashboardLayout>
  );
} 