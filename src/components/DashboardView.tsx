'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useShopContext } from '@/components/ShopContext';
import { Store } from 'lucide-react';

export default function DashboardView() {
    const { selectedShop } = useShopContext();
    // Fetch dashboard specific data here
    if (!selectedShop) {
        return (
          <div className="text-center py-12 text-gray-500">
            <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Vælg en shop for at se dashboardet</p>
          </div>
        );
    }
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader><CardTitle>Samlet Omsætning</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">12,345 kr</p></CardContent></Card>
                <Card><CardHeader><CardTitle>Antal Produkter</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">1,234</p></CardContent></Card>
                <Card><CardHeader><CardTitle>Lavt Lager</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">56</p></CardContent></Card>
                <Card><CardHeader><CardTitle>Udsolgte Varer</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">12</p></CardContent></Card>
            </div>
            {/* Add more charts and stats here */}
        </div>
    );
}
