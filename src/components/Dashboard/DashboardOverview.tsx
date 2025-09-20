import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/store/useStore';
import StatCard from './StatCard';
import AttendanceChart from './AttendanceChart';
import EngagementChart from './EngagementChart';
import RiskStudentsList from './RiskStudentsList';
import {
  Users,
  Calendar,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Clock
} from 'lucide-react';

export default function DashboardOverview() {
  const { user } = useAuth();
  const { students, attendanceRecords, classSessions } = useStore();

  // Calculate stats based on role
  const getStats = () => {
    if (user?.role === 'student') {
      const student = students.find(s => s.email === user.email);
      if (!student) return [];

      return [
        {
          title: 'My Attendance Rate',
          value: `${student.attendanceRate}%`,
          icon: <Calendar size={24} />,
          color: student.attendanceRate >= 80 ? 'green' : student.attendanceRate >= 60 ? 'amber' : 'red',
          trend: { value: 2.5, isPositive: true }
        },
        {
          title: 'Engagement Score',
          value: `${student.engagementScore}%`,
          icon: <TrendingUp size={24} />,
          color: student.engagementScore >= 75 ? 'green' : student.engagementScore >= 50 ? 'amber' : 'red'
        },
        {
          title: 'Classes Attended',
          value: `${student.attendedClasses}/${student.totalClasses}`,
          icon: <BookOpen size={24} />,
          color: 'blue'
        },
        {
          title: 'Study Time',
          value: `${student.timeSpent}h`,
          subtitle: 'This month',
          icon: <Clock size={24} />,
          color: 'purple'
        }
      ] as const;
    }

    // Teacher/Counselor stats
    const totalStudents = students.length;
    const avgAttendance = Math.round(
      students.reduce((sum, s) => sum + s.attendanceRate, 0) / totalStudents
    );
    const highRiskStudents = students.filter(s => s.riskLevel === 'high').length;
    const avgEngagement = Math.round(
      students.reduce((sum, s) => sum + s.engagementScore, 0) / totalStudents
    );
    const todayAttendance = attendanceRecords.filter(
      r => r.date === new Date().toISOString().split('T')[0]
    ).length;

    return [
      {
        title: 'Total Students',
        value: totalStudents,
        icon: <Users size={24} />,
        color: 'blue',
        trend: { value: 5.2, isPositive: true }
      },
      {
        title: 'Average Attendance',
        value: `${avgAttendance}%`,
        icon: <Calendar size={24} />,
        color: avgAttendance >= 80 ? 'green' : avgAttendance >= 60 ? 'amber' : 'red',
        trend: { value: 1.8, isPositive: true }
      },
      {
        title: 'High Risk Students',
        value: highRiskStudents,
        icon: <AlertTriangle size={24} />,
        color: 'red'
      },
      {
        title: 'Avg Engagement',
        value: `${avgEngagement}%`,
        icon: <TrendingUp size={24} />,
        color: avgEngagement >= 75 ? 'green' : avgEngagement >= 50 ? 'amber' : 'red',
        trend: { value: -0.5, isPositive: false }
      }
    ] as const;
  };

  const stats = getStats();
  const highRiskStudents = students.filter(s => s.riskLevel === 'high');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role === 'student' ? 'My Dashboard' : 'Dashboard Overview'}
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.role === 'student' 
            ? 'Track your attendance and engagement progress'
            : 'Monitor student attendance and engagement patterns'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart />
        <EngagementChart />
      </div>

      {/* Risk Students - Only for teachers and counselors */}
      {user?.role !== 'student' && highRiskStudents.length > 0 && (
        <RiskStudentsList students={highRiskStudents} />
      )}
    </div>
  );
}