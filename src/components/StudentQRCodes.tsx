import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useStore, Student } from '@/store/useStore';
import { QRCodeCanvas } from 'qrcode.react';

export default function StudentQRCodes() {
  const { students } = useStore();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Student QR Codes</h1>
      <p className="text-gray-600">Each student has a unique QR code for attendance check-in.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {students.map((student: Student) => (
          <Card key={student.id} className="flex flex-col items-center p-4">
            <CardHeader className="text-center">
              <CardTitle>{student.name}</CardTitle>
              <CardDescription className="text-sm text-gray-500">{student.email}</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center mt-4">
              <QRCodeCanvas value={student.qrCode} size={128} level="H" />
              <p className="mt-2 text-gray-600 text-sm">Scan to mark attendance</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
