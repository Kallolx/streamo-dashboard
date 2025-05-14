"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Info } from "@phosphor-icons/react";

export default function RoyaltiesPage() {
  return (
    <DashboardLayout title="Royalty" subtitle="Manage all track royalties">
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="mb-6 text-blue-400">
          <Info size={64} weight="thin" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-4">No Royalty Data Available Yet</h2>
        <p className="text-gray-300 max-w-2xl mb-3">
          Royalty data will be available after your first month of distribution. New CSV data will be uploaded on a monthly basis once your tracks start generating royalties.
        </p>
        <p className="text-gray-400 text-sm max-w-2xl">
          Once available, you'll be able to track earnings from your distributed music across all platforms in this section.
        </p>
      </div>
    </DashboardLayout>
  );
}
