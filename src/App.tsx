import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import AttendanceCapture from './components/Attendance/AttendanceCapture';
import StudentsList from './components/Students/StudentsList';
import ReportsGeneration from './components/Reports/ReportsGeneration';
import Settings from './components/Settings/Settings';
import './App.css';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'attendance':
        return <DashboardOverview />; // Could be a separate attendance view
      case 'students':
        return <StudentsList />;
      case 'checkin':
        return <AttendanceCapture />;
      case 'reports':
        return <ReportsGeneration />;
      case 'alerts':
        return <StudentsList />; // Could be a separate alerts view
      case 'settings':
        return <Settings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;