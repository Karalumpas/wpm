'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShopProvider } from '@/components/ShopContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ProductsView from '@/components/ProductsView';
import ShopsView from '@/components/ShopsView';
import UploadView from '@/components/UploadView';
import DashboardView from '@/components/DashboardView';

// Main App Component
export default function WpmApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialView = searchParams.get('view') || 'dashboard';
  const [activeView, setActiveView] = useState(initialView);

  const handleSetView = (view: string) => {
    setActiveView(view);
    router.push(`/?view=${view}`, { scroll: false });
  };

  const renderView = () => {
    switch (activeView) {
      case 'products':
        return <ProductsView />;
      case 'shops':
        return <ShopsView />;
      case 'upload':
        return <UploadView />;
      case 'dashboard':
      default:
        return <DashboardView />;
    }
  };

  return (
    <ShopProvider>
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar activeView={activeView} setActiveView={handleSetView} />
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="p-6 overflow-y-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </ShopProvider>
  );
}
