'use client';

import { useState } from 'react';

export default function SyncResultModal({ results }: { results: { sku: string; success: boolean; error?: string }[] }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-4 rounded max-w-md w-full space-y-2">
        <h2 className="font-bold">Sync result</h2>
        <ul className="text-sm max-h-60 overflow-auto">
          {results.map((r) => (
            <li key={r.sku} className={r.success ? 'text-green-600' : 'text-red-600'}>
              {r.sku}: {r.success ? 'OK' : r.error}
            </li>
          ))}
        </ul>
        <button className="mt-2 border px-2 py-1 rounded" onClick={() => setOpen(false)}>Close</button>
      </div>
    </div>
  );
}
