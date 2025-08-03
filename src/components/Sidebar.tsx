'use client';

import { LayoutDashboard, ShoppingBag, Store, Upload } from 'lucide-react';

export default function Sidebar({ activeView, setActiveView }: { activeView: string; setActiveView: (view: string) => void; }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Produkter', icon: ShoppingBag },
    { id: 'shops', label: 'Shops', icon: Store },
    { id: 'upload', label: 'CSV Import', icon: Upload },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r p-4 flex flex-col">
      <div className="font-bold text-xl mb-8 px-2">WPM</div>
      <nav className="flex flex-col gap-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === item.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
