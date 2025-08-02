'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShopSelector } from './ShopSelector';
import { useShop } from './ShopContext';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/manager', label: 'Manager' },
  { href: '/sync', label: 'Sync' },
  { href: '/uploads', label: 'Uploads' },
];

export default function Header() {
  const pathname = usePathname();
  const { selectedShop, setSelectedShop } = useShop();
  const current = '/' + pathname.split('/')[1];
  const titleMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/manager': 'WooCommerce Manager',
    '/sync': 'Sync',
    '/uploads': 'Uploads',
  };
  const title = titleMap[current] || '';

  return (
    <header className="bg-white border-b mb-6">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        <nav className="flex gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname.startsWith(item.href)
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <ShopSelector selected={selectedShop} onChange={setSelectedShop} />
      </div>
      {title && (
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      )}
    </header>
  );
}
