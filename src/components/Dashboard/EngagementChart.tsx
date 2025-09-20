import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '@/store/useStore';

export default function EngagementChart() {
  const { students } = useStore();

  const engagementData = students.map(student => ({
    name: student.name.split(' ')[0], // First name only
    score: student.engagementScore,
    attendance: student.attendanceRate
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Engagement</CardTitle>
        <CardDescription>
          Engagement scores vs attendance rates by student
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              formatter={(value, name) => [
                `${value}%`, 
                name === 'score' ? 'Engagement Score' : 'Attendance Rate'
              ]}
            />
            <Bar 
              dataKey="score" 
              fill="#10B981" 
              name="score"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="attendance" 
              fill="#3B82F6" 
              name="attendance"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}