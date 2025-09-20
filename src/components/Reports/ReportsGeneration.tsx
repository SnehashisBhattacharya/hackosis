import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useStore } from '@/store/useStore';
import { CalendarIcon, Download, FileText, BarChart3, Users } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function ReportsGeneration() {
  const [reportType, setReportType] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { students, attendanceRecords } = useStore();

  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Student Attendance & Engagement Report', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${format(new Date(), 'PPP')}`, 20, 45);
    doc.text(`Report Type: ${reportType}`, 20, 55);
    
    if (startDate && endDate) {
      doc.text(`Period: ${format(startDate, 'PPP')} - ${format(endDate, 'PPP')}`, 20, 65);
    }
    
    // Summary Statistics
    doc.setFontSize(16);
    doc.text('Summary Statistics', 20, 85);
    
    doc.setFontSize(12);
    const avgAttendance = Math.round(
      students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length
    );
    const avgEngagement = Math.round(
      students.reduce((sum, s) => sum + s.engagementScore, 0) / students.length
    );
    const highRiskCount = students.filter(s => s.riskLevel === 'high').length;
    
    doc.text(`Total Students: ${students.length}`, 20, 100);
    doc.text(`Average Attendance: ${avgAttendance}%`, 20, 110);
    doc.text(`Average Engagement: ${avgEngagement}%`, 20, 120);
    doc.text(`High Risk Students: ${highRiskCount}`, 20, 130);
    
    // Student Details
    doc.setFontSize(16);
    doc.text('Student Details', 20, 150);
    
    doc.setFontSize(10);
    let yPosition = 165;
    students.forEach((student, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.text(
        `${index + 1}. ${student.name} - Attendance: ${student.attendanceRate}% - Engagement: ${student.engagementScore}% - Risk: ${student.riskLevel.toUpperCase()}`,
        20,
        yPosition
      );
      yPosition += 10;
    });
    
    doc.save(`attendance-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const generateExcelReport = () => {
    const workbook = XLSX.utils.book_new();
    
    // Summary Sheet
    const summaryData = [
      ['Report Generated', format(new Date(), 'PPP')],
      ['Report Type', reportType],
      ['Total Students', students.length],
      ['Average Attendance', `${Math.round(students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length)}%`],
      ['Average Engagement', `${Math.round(students.reduce((sum, s) => sum + s.engagementScore, 0) / students.length)}%`],
      ['High Risk Students', students.filter(s => s.riskLevel === 'high').length]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Students Sheet
    const studentsData = [
      ['Name', 'Email', 'Attendance Rate', 'Engagement Score', 'Risk Level', 'Classes Attended', 'Total Classes', 'Assignments Submitted', 'Total Assignments', 'Study Time (hours)']
    ];
    
    students.forEach(student => {
      studentsData.push([
        student.name,
        student.email,
        `${student.attendanceRate}%`,
        `${student.engagementScore}%`,
        student.riskLevel.toUpperCase(),
        student.attendedClasses,
        student.totalClasses,
        student.assignmentsSubmitted,
        student.totalAssignments,
        student.timeSpent
      ]);
    });
    
    const studentsSheet = XLSX.utils.aoa_to_sheet(studentsData);
    XLSX.utils.book_append_sheet(workbook, studentsSheet, 'Students');
    
    // Attendance Records Sheet
    const attendanceData = [
      ['Student Name', 'Date', 'Time', 'Method', 'Status', 'Location']
    ];
    
    attendanceRecords.forEach(record => {
      attendanceData.push([
        record.studentName,
        record.date,
        record.time,
        record.method.toUpperCase(),
        record.status.toUpperCase(),
        record.location || ''
      ]);
    });
    
    const attendanceSheet = XLSX.utils.aoa_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'Attendance Records');
    
    XLSX.writeFile(workbook, `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (reportType === 'pdf') {
      generatePDFReport();
    } else if (reportType === 'excel') {
      generateExcelReport();
    }
    
    setIsGenerating(false);
  };

  const reportTypes = [
    { value: 'pdf', label: 'PDF Report', icon: FileText },
    { value: 'excel', label: 'Excel Spreadsheet', icon: BarChart3 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports Generation</h1>
        <p className="text-gray-600 mt-2">
          Generate comprehensive attendance and engagement reports
        </p>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>
            Configure the parameters for your report generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Report Type
            </label>
            <Select onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report format" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon size={16} />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Select start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                End Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Select end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleGenerateReport}
              disabled={!reportType || isGenerating}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Preview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length)}%
                </p>
                <p className="text-sm text-gray-600">Avg Attendance</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(students.reduce((sum, s) => sum + s.engagementScore, 0) / students.length)}%
                </p>
                <p className="text-sm text-gray-600">Avg Engagement</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {students.filter(s => s.riskLevel === 'high').length}
                </p>
                <p className="text-sm text-gray-600">High Risk</p>
              </div>
              <Users className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}