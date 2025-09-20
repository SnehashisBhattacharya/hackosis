import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore, Student } from '@/store/useStore';
import { Search, Mail, Phone, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

export default function StudentsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const { students, generateRiskExplanation } = useStore();

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <TrendingDown className="h-4 w-4" />;
      case 'low': return <TrendingUp className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-600 mt-2">
          Monitor individual student performance and engagement
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <div className="grid gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                {/* Student Info */}
                <div className="flex items-center space-x-4">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {student.name}
                    </h3>
                    <p className="text-gray-600">{student.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={getRiskColor(student.riskLevel)} className="flex items-center gap-1">
                        {getRiskIcon(student.riskLevel)}
                        {student.riskLevel.toUpperCase()} RISK
                      </Badge>
                      {student.alerts.length > 0 && (
                        <Badge variant="outline" className="text-amber-600">
                          {student.alerts.length} Alert{student.alerts.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {student.attendanceRate}%
                  </p>
                  <p className="text-sm text-gray-600">Attendance</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${getEngagementColor(student.engagementScore)}`}>
                    {student.engagementScore}%
                  </p>
                  <p className="text-sm text-gray-600">Engagement</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {student.assignmentsSubmitted}/{student.totalAssignments}
                  </p>
                  <p className="text-sm text-gray-600">Assignments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {student.timeSpent}h
                  </p>
                  <p className="text-sm text-gray-600">Study Time</p>
                </div>
              </div>

              {/* Risk Explanation */}
              {student.riskLevel !== 'low' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Risk Factors:</strong> {generateRiskExplanation(student)}
                  </p>
                </div>
              )}

              {/* Active Alerts */}
              {student.alerts.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Active Alerts:</p>
                  <div className="flex flex-wrap gap-2">
                    {student.alerts.map((alert, index) => (
                      <Badge key={index} variant="outline" className="text-amber-600">
                        {alert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredStudents.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No students found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}