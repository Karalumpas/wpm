'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UploadDropzone from '@/components/UploadDropzone';
import CsvUploadHistory from '@/components/CsvUploadHistory';

export default function UploadView() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Importer Produkter fra CSV</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Upload fil</CardTitle>
                </CardHeader>
                <CardContent>
                    <UploadDropzone onUploadSuccess={() => { /* refresh history */ console.log('refresh')}} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Upload Historik</CardTitle>
                </CardHeader>
                <CardContent>
                    <CsvUploadHistory />
                </CardContent>
            </Card>
        </div>
    );
}
