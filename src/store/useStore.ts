import { create } from 'zustand';

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  attendanceRate: number;
  engagementScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  totalClasses: number;
  attendedClasses: number;
  assignmentsSubmitted: number;
  totalAssignments: number;
  quizAttempts: number;
  totalQuizzes: number;
  timeSpent: number; // in hours
  lastActive: string;
  alerts: string[];
  qrCode: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  method: 'qr' | 'voice' | 'text' | 'lms' | 'manual';
  status: 'present' | 'absent' | 'late';
  location?: string;
}

export interface ClassSession {
  id: string;
  name: string;
  date: string;
  time: string;
  duration: number;
  totalStudents: number;
  presentStudents: number;
}

interface AppState {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  classSessions: ClassSession[];
  selectedDate: string;
  lastMarkedPresent: string | null;

  // Actions
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  updateStudentEngagement: (studentId: string, data: Partial<Student>) => void;
  setSelectedDate: (date: string) => void;
  calculateRiskLevel: (student: Student) => 'low' | 'medium' | 'high';
  generateRiskExplanation: (student: Student) => string;
}

// ---------------- Helper: generate unique QR code ----------------
const generateQRCode = (student: { name: string; id: string }) => {
  const sanitizedName = student.name.toUpperCase().replace(/\s+/g, '_');
  return `STUDENT_QR_${sanitizedName}_${student.id.padStart(3, '0')}`;
};

// ---------------- Mock students ----------------
const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Arpan Thakur',
    email: 'alex.chen@school.edu',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150',
    attendanceRate: 85,
    engagementScore: 78,
    riskLevel: 'low',
    totalClasses: 24,
    attendedClasses: 20,
    assignmentsSubmitted: 8,
    totalAssignments: 10,
    quizAttempts: 12,
    totalQuizzes: 12,
    timeSpent: 45,
    lastActive: '2025-01-05T10:30:00Z',
    alerts: [],
    qrCode: ''
  },
  {
    id: '2',
    name: 'Surjakanta Das',
    email: 'maria.rodriguez@school.edu',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150',
    attendanceRate: 92,
    engagementScore: 88,
    riskLevel: 'low',
    totalClasses: 24,
    attendedClasses: 22,
    assignmentsSubmitted: 10,
    totalAssignments: 10,
    quizAttempts: 12,
    totalQuizzes: 12,
    timeSpent: 52,
    lastActive: '2025-01-06T14:20:00Z',
    alerts: [],
    qrCode: ''
  },
  {
    id: '3',
    name: 'Mohar Sarkar',
    email: 'james.wilson@school.edu',
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150&h=150',
    attendanceRate: 58,
    engagementScore: 45,
    riskLevel: 'high',
    totalClasses: 24,
    attendedClasses: 14,
    assignmentsSubmitted: 5,
    totalAssignments: 10,
    quizAttempts: 8,
    totalQuizzes: 12,
    timeSpent: 28,
    lastActive: '2025-01-03T09:15:00Z',
    alerts: ['Low attendance warning', 'Missing assignments'],
    qrCode: ''
  },
  {
    id: '4',
    name: 'Snehasish Bhattacharya',
    email: 'emma.thompson@school.edu',
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150&h=150',
    attendanceRate: 75,
    engagementScore: 62,
    riskLevel: 'medium',
    totalClasses: 24,
    attendedClasses: 18,
    assignmentsSubmitted: 7,
    totalAssignments: 10,
    quizAttempts: 10,
    totalQuizzes: 12,
    timeSpent: 38,
    lastActive: '2025-01-05T16:45:00Z',
    alerts: ['Declining participation'],
    qrCode: ''
  }
];

// Assign QR codes to all students
mockStudents.forEach(student => {
  student.qrCode = generateQRCode(student);
});

// ---------------- Mock data ----------------
const mockAttendanceRecords: AttendanceRecord[] = [];
const mockClassSessions: ClassSession[] = [];

// ---------------- Zustand store ----------------
export const useStore = create<AppState>((set, get) => ({
  students: mockStudents,
  attendanceRecords: mockAttendanceRecords,
  classSessions: mockClassSessions,
  selectedDate: new Date().toISOString().split('T')[0],
  lastMarkedPresent: null,

  addAttendanceRecord: (record) => {
    const newRecord = { ...record, id: Date.now().toString() };

    set(state => {
      const updatedStudents = state.students.map(student => {
        if (student.id === record.studentId) {
          const attended = student.attendedClasses + 1;
          const rate = Math.round((attended / student.totalClasses) * 100);
          return { ...student, attendedClasses: attended, attendanceRate: rate };
        }
        return student;
      });

      return {
        attendanceRecords: [...state.attendanceRecords, newRecord],
        students: updatedStudents,
        lastMarkedPresent: record.studentName
      };
    });
  },

  updateStudentEngagement: (studentId, data) => {
    set(state => ({
      students: state.students.map(student =>
        student.id === studentId ? { ...student, ...data } : student
      )
    }));
  },

  setSelectedDate: (date) => set({ selectedDate: date }),

  calculateRiskLevel: (student) => {
    const attendanceScore = student.attendanceRate;
    const assignmentScore = (student.assignmentsSubmitted / student.totalAssignments) * 100;
    const quizScore = (student.quizAttempts / student.totalQuizzes) * 100;
    const overallScore = (attendanceScore + assignmentScore + quizScore) / 3;
    if (overallScore >= 75) return 'low';
    if (overallScore >= 50) return 'medium';
    return 'high';
  },

  generateRiskExplanation: (student) => {
    const reasons = [];
    if (student.attendanceRate < 75) reasons.push(`Low attendance (${student.attendanceRate}%)`);
    const assignmentRate = (student.assignmentsSubmitted / student.totalAssignments) * 100;
    if (assignmentRate < 70) reasons.push(`Missing assignments (${student.totalAssignments - student.assignmentsSubmitted} incomplete)`);
    const quizRate = (student.quizAttempts / student.totalQuizzes) * 100;
    if (quizRate < 80) reasons.push(`Low quiz participation (${student.totalQuizzes - student.quizAttempts} missed)`);
    if (student.timeSpent < 30) reasons.push('Low online engagement time');
    const daysSinceActive = Math.floor((new Date().getTime() - new Date(student.lastActive).getTime()) / (1000 * 3600 * 24));
    if (daysSinceActive > 3) reasons.push(`Inactive for ${daysSinceActive} days`);
    return reasons.length > 0 ? reasons.join(' + ') : 'Good overall performance';
  }
}));
