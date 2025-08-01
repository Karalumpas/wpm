'use client';

import { useState } from 'react';

export default function UploadDropzone() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    setLoading(true);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      setMessage('Uploaded');
    } else {
      setMessage('Error');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        accept=".csv"
        multiple
        onChange={handleChange}
        disabled={loading}
      />
      {message && <p>{message}</p>}
    </div>
  );
}
