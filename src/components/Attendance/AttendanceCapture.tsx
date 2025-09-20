import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore, Student, AttendanceRecord } from '@/store/useStore';
import { QrCode, Mic, Type, Database, CheckCircle } from 'lucide-react';
import QRScanner from './QRScanner';

export default function AttendanceCapture() {
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const { addAttendanceRecord, students, attendanceRecords } = useStore();

  const today = new Date().toISOString().split('T')[0];

  // Helper: check if attendance already exists
  const alreadyMarked = (studentId: string) =>
    attendanceRecords.some(r => r.studentId === studentId && r.date === today);

  // QR Scan Handler
  const handleQRScan = (data: string) => {
    const student = students.find(s => s.qrCode === data);
    if (!student) return;
    if (alreadyMarked(student.id)) return;

    addAttendanceRecord({
      studentId: student.id,
      studentName: student.name,
      date: today,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      method: 'qr',
      status: 'present',
      location: 'Room 101'
    });
    setLastScanned(student.name);
  };

  // Voice Handler
  const handleVoiceStart = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const student = students[1]; // Demo: second student
      if (!student || alreadyMarked(student.id)) return;

      addAttendanceRecord({
        studentId: student.id,
        studentName: student.name,
        date: today,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        method: 'voice',
        status: 'present'
      });
      setLastScanned(student.name);
    }, 3000);
  };

  // Text Submit Handler
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const student = students.find(s =>
      s.name.toLowerCase().includes(textInput.toLowerCase()) ||
      s.email.toLowerCase().includes(textInput.toLowerCase())
    );

    if (!student || alreadyMarked(student.id)) return;

    addAttendanceRecord({
      studentId: student.id,
      studentName: student.name,
      date: today,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      method: 'text',
      status: 'present'
    });
    setTextInput('');
    setLastScanned(student.name);
  };

  // LMS Sync Handler
  const handleLMSSync = () => {
    const student = students[2]; // Demo: third student
    if (!student || alreadyMarked(student.id)) return;

    addAttendanceRecord({
      studentId: student.id,
      studentName: student.name,
      date: today,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      method: 'lms',
      status: 'present'
    });
    setLastScanned(student.name);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance Check-in</h1>
        <p className="text-gray-600 mt-2">Multiple methods to capture student attendance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check-in Methods</CardTitle>
          <CardDescription>Choose your preferred method for student attendance tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="qr" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="qr" className="flex items-center gap-2">
                <QrCode size={16} /> QR Code
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic size={16} /> Voice
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Type size={16} /> Text
              </TabsTrigger>
              <TabsTrigger value="lms" className="flex items-center gap-2">
                <Database size={16} /> LMS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qr" className="mt-6">
              <div className="space-y-4 text-center">
                <h3 className="text-lg font-medium mb-2">QR Code Scanner</h3>
                <p className="text-gray-600 mb-4">Students scan their unique QR codes to check in</p>
                <QRScanner onScan={handleQRScan} students={students} />
                {lastScanned && (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle size={20} />
                    <span>Last scanned: {lastScanned}</span>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="voice" className="mt-6 text-center">
              <h3 className="text-lg font-medium mb-2">Voice Check-in</h3>
              <p className="text-gray-600 mb-4">Students speak their name or ID for attendance</p>
              <div className="bg-gray-50 rounded-lg p-8">
                <Button
                  onClick={handleVoiceStart}
                  disabled={isRecording}
                  size="lg"
                  className={`${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                >
                  <Mic className={`mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
                  {isRecording ? 'Recording...' : 'Start Voice Check-in'}
                </Button>
                {isRecording && <p className="text-sm text-gray-600 mt-2">Listening for student name or ID...</p>}
              </div>
            </TabsContent>

            <TabsContent value="text" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Text Check-in</h3>
                <p className="text-gray-600 mb-4">Enter student name or ID manually</p>
                <form onSubmit={handleTextSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="student-input">Student Name or ID</Label>
                    <Input
                      id="student-input"
                      placeholder="Enter student name or ID"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                    />
                  </div>
                  <Button type="submit">
                    <CheckCircle className="mr-2" size={16} /> Mark Present
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="lms" className="mt-6 text-center">
              <h3 className="text-lg font-medium mb-2">LMS Integration</h3>
              <p className="text-gray-600 mb-4">Sync attendance from Learning Management System</p>
              <div className="bg-gray-50 rounded-lg p-8">
                <Button onClick={handleLMSSync} size="lg">
                  <Database className="mr-2" /> Sync from LMS
                </Button>
                <p className="text-sm text-gray-600 mt-2">Fetch latest attendance logs from connected LMS</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
