import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore, Student } from '@/store/useStore';
import { QrCode, Mic, Type, Database, CheckCircle } from 'lucide-react';
import QRScanner from './QRScanner';
import { Combobox } from '@headlessui/react';

export default function AttendanceCapture() {
  const [isRecording, setIsRecording] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [query, setQuery] = useState('');

  const { addAttendanceRecord, students, attendanceRecords } = useStore();
  const today = new Date().toISOString().split('T')[0];

  const alreadyMarked = (studentId: string) =>
    attendanceRecords.some(r => r.studentId === studentId && r.date === today);

  // ---------------- QR Scan ----------------
  const handleQRScan = (data: string) => {
    const student = students.find(s => s.qrCode === data);
    if (!student || alreadyMarked(student.id)) return;

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

  // ---------------- Voice Check-in ----------------
  const handleVoiceStart = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript.trim().toLowerCase();
      console.log("Heard:", spokenText);

      // Match spoken name to student
      const student = students.find(s => s.name.toLowerCase() === spokenText);

      if (student && !alreadyMarked(student.id)) {
        addAttendanceRecord({
          studentId: student.id,
          studentName: student.name,
          date: today,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          method: 'voice',
          status: 'present'
        });
        setLastScanned(student.name);
      } else {
        alert("No matching student found or already marked!");
      }

      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };
  };

  // ---------------- Text Check-in ----------------
  const filteredStudents = query === ''
    ? students
    : students.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.email.toLowerCase().includes(query.toLowerCase())
      );

  const handleStudentSelect = (student: Student) => {
    if (!student || alreadyMarked(student.id)) return;

    addAttendanceRecord({
      studentId: student.id,
      studentName: student.name,
      date: today,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      method: 'text',
      status: 'present'
    });

    setSelectedStudent(student);
    setLastScanned(student.name);
    setQuery('');
  };

  // ---------------- LMS Sync ----------------
  const handleLMSSync = () => {
    const student = students[2]; // Example dummy LMS sync
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

  // ---------------- Render ----------------
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

            {/* QR Code */}
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

            {/* Voice */}
            <TabsContent value="voice" className="mt-6 text-center">
              <h3 className="text-lg font-medium mb-2">Voice Check-in</h3>
              <p className="text-gray-600 mb-4">Say a student's name to mark present</p>
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
                {isRecording && <p className="text-sm text-gray-600 mt-2">Listening for student name...</p>}
              </div>
            </TabsContent>

            {/* Text */}
            <TabsContent value="text" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Text Check-in</h3>
                <p className="text-gray-600 mb-4">Select student name to mark present</p>
                <Combobox
                  value={selectedStudent}
                  onChange={(student: Student | null) => {
                    if (!student) return;
                    handleStudentSelect(student);
                  }}
                >
                  <div className="relative">
                    <Combobox.Input
                      className="w-full border rounded p-2"
                      placeholder="Type or select student"
                      onChange={(e) => setQuery(e.target.value)}
                      displayValue={(student: Student | null) => student?.name || ''}
                    />
                    <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto">
                      {filteredStudents.map((student) => (
                        <Combobox.Option
                          key={student.id}
                          value={student}
                          className={({ active }) =>
                            `cursor-pointer select-none p-2 ${active ? 'bg-blue-100' : ''}`
                          }
                        >
                          {student.name} ({student.email})
                        </Combobox.Option>
                      ))}
                      {filteredStudents.length === 0 && (
                        <div className="p-2 text-gray-500">No students found</div>
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>

                {lastScanned && (
                  <div className="flex items-center gap-2 text-green-600 mt-2">
                    <CheckCircle size={20} />
                    <span>Last marked present: {lastScanned}</span>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* LMS */}
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
