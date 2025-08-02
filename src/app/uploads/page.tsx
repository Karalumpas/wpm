import UploadDropzone from '@/components/UploadDropzone';
import CsvUploadHistory from '@/components/CsvUploadHistory';

export default function UploadPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Upload CSV</h1>
      <UploadDropzone />
      <CsvUploadHistory />
    </div>
  );
}
