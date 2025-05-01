'use client';

import { useState, Suspense } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Import tab components
import ReleaseCreate from './release-create';
import TrackCreate from './track-create';
import VideoCreate from './video-create';
import ArtistCreate from './artist-create';
import LabelCreate from './label-create';

const catalogueTabs = [
  { id: 'releases', name: 'Releases', title: 'Create New Release', description: 'Add a new release to your catalogue' },
  { id: 'tracks', name: 'Tracks', title: 'Create New Track', description: 'Add a new track to your catalogue' },
  { id: 'videos', name: 'Videos', title: 'Create New Video', description: 'Add a new video to your catalogue' },
  { id: 'artists', name: 'Artists', title: 'Create New Artist', description: 'Add a new artist to your catalogue' },
  { id: 'labels', name: 'Labels', title: 'Create New Label', description: 'Add a new label to your catalogue' },
];

// Component to handle tabs with useSearchParams
function TabContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') || 'releases';
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const activeTabData = catalogueTabs.find(tab => tab.id === activeTab) || catalogueTabs[0];

  // Render the appropriate component based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'releases':
        return <ReleaseCreate />;
      case 'tracks':
        return <TrackCreate />;
      case 'videos':
        return <VideoCreate />;
      case 'artists':
        return <ArtistCreate />;
      case 'labels':
        return <LabelCreate />;
      default:
        return <ReleaseCreate />;
    }
  };

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto">
          {catalogueTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-5 py-2 rounded-full whitespace-nowrap ${
                activeTab === tab.id ? 'bg-[#A365FF] text-white' : 'bg-[#1A1E24] text-gray-300 hover:bg-[#252A33]'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{activeTabData.title}</h1>
        <p className="text-gray-400">{activeTabData.description}</p>
      </div>

      {/* Content Area */}
      <div className="rounded-lg p-8">
        {renderTabContent()}
      </div>
    </div>
  );
}

// Loading fallback to display while suspense is resolving
function TabContentLoading() {
  return (
    <div className="p-6">
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    </div>
  );
}

export default function CreateNewPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<TabContentLoading />}>
        <TabContent />
      </Suspense>
    </DashboardLayout>
  );
} 