import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Student, useStore } from '@/store/useStore';
import { AlertTriangle, Mail, Phone } from 'lucide-react';

interface RiskStudentsListProps {
  students: Student[];
}

export default function RiskStudentsList({ students }: RiskStudentsListProps) {
  const { generateRiskExplanation } = useStore();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Students At Risk
        </CardTitle>
        <CardDescription>
          Students requiring immediate attention based on engagement patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.map((student) => (
            <div 
              key={student.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{student.name}</h4>
                  <p className="text-sm text-gray-600">{student.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getRiskColor(student.riskLevel)}>
                      {student.riskLevel.toUpperCase()} RISK
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Attendance: {student.attendanceRate}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-2 max-w-xs">
                  {generateRiskExplanation(student)}
                </p>
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
            </div>
          ))}
          
          {students.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No high-risk students at this time</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}