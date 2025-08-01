'use client';

import { useEffect, useState } from 'react';
import { UploadEntry } from '@/lib/types';

export default function CsvUploadHistory() {
  const [entries, setEntries] = useState<UploadEntry[]>([]);

  useEffect(() => {
    fetch('/api/upload/history')
      .then((res) => res.json())
      .then(setEntries);
  }, []);

  return (
    <div className="mt-4">
      <h2 className="font-bold mb-2">Previous uploads</h2>
      <ul className="space-y-1">
        {entries.map((e) => (
          <li key={e.id} className="text-sm">
            {e.filename} - {e.type} -{' '}
            {new Date(e.uploadedAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
