'use client';

import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import ArtistsTable from '@/components/Dashboard/ArtistsTable';

export default function ArtistsPage() {
  return (
    <DashboardLayout 
      title="Artists" 
      subtitle="Manage your artists collection"
    >
      <ArtistsTable />
    </DashboardLayout>
  );
} 