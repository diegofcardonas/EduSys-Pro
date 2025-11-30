


import React, { useState, useEffect } from 'react';
import { Student, Teacher, User } from './types';
import { students as initialStudents, teachers as initialTeachers } from './data/mockData';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/views/Dashboard';
import Students from './components/views/Students';
import Teachers from './components/views/Teachers';
import Courses from './components/views/Courses';
import Grades from './components/views/Grades';
import Attendance from './components/views/Attendance';
import Timetable from './components/views/Timetable';
import Communication from './components/views/Communication';
import StudentProfile from './components/views/StudentProfile';
import UserManagement from './components/views/UserManagement';
import Finance from './components/views/Finance';
import Settings from './components/views/Settings';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Mock user login
const LOGGED_IN_USER_ID = 'admin'; 

const AppContent = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  
  // --- Centralized Data State ---
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Initialize Data from LocalStorage or Mocks
  useEffect(() => {
      const storedUsers = localStorage.getItem('edusys_users');
      
      if (storedUsers) {
          try {
              const parsedUsers = JSON.parse(storedUsers);
              setAllUsers(parsedUsers);
          } catch (e) {
              console.error("Failed to parse users from local storage", e);
              initializeWithMocks();
          }
      } else {
          initializeWithMocks();
      }
      setIsDataLoaded(true);
  }, []);

  // Save to LocalStorage whenever allUsers changes
  useEffect(() => {
      if (isDataLoaded && allUsers.length > 0) {
          localStorage.setItem('edusys_users', JSON.stringify(allUsers));
      }
  }, [allUsers, isDataLoaded]);

  const initializeWithMocks = () => {
      const initialUsers: User[] = [...initialStudents, ...initialTeachers];
      // Ensure Admin exists
      if (!initialUsers.find(u => u.role === 'Administrator')) {
          initialUsers.unshift({
              id: 'admin',
              name: 'System Administrator',
              email: 'admin@school.edu',
              role: 'Administrator',
              status: 'Active',
              joinDate: '2020-01-01',
              avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff',
              bio: 'Administrator account for managing the EduSys platform.'
          });
      }
      setAllUsers(initialUsers);
  };

  const currentUser = allUsers.find(u => u.id === LOGGED_IN_USER_ID);

  const [currentView, setCurrentView] = useState('Dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Special state to pass params to views (e.g., Open Modal immediately)
  const [viewParams, setViewParams] = useState<{ [key: string]: any }>({});

  const handleSetView = (view: string, params: { [key: string]: any } = {}) => {
    setCurrentView(view);
    setViewParams(params);
    setSidebarOpen(false); // Close sidebar on navigation
  };

  const handleViewStudentProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    handleSetView('StudentProfile');
  };

  const handleProfileClick = () => {
      if (!currentUser) return;

      if (currentUser.role === 'Student') {
          // Students view their detailed academic profile
          handleViewStudentProfile(currentUser.id);
      } else {
          // Admins and Professors view the User Management modal to edit their details
          // timestamp forces the effect to run again even if we are already on this view/user
          handleSetView('UserManagement', { editUserId: currentUser.id, timestamp: Date.now() });
      }
  };

  // Helper to update a specific user (passed down to profile views)
  const handleUpdateUser = (updatedUser: User) => {
      setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const renderView = () => {
    if (!currentUser) {
      return <div>{t('loadingUser')}</div>;
    }
    switch (currentView) {
      case 'Dashboard':
        return <Dashboard currentUser={currentUser} allUsers={allUsers} setView={handleSetView} />;
      case 'Students':
        return <Students users={allUsers} onSelectStudent={handleViewStudentProfile} />;
      case 'Teachers':
        return <Teachers users={allUsers} />;
      case 'UserManagement':
        return (
            <UserManagement 
                users={allUsers} 
                setUsers={setAllUsers} 
                autoOpenAdd={viewParams?.openAddModal || false}
                autoEditUserId={viewParams?.editUserId}
                actionTimestamp={viewParams?.timestamp}
            />
        );
      case 'Courses':
        return <Courses users={allUsers} />;
      case 'Grades':
        return <Grades currentUser={currentUser} users={allUsers} />;
      case 'Attendance':
        return <Attendance currentUser={currentUser} />;
      case 'Timetable':
        return <Timetable currentUser={currentUser} />;
      case 'Communication':
        return <Communication currentUser={currentUser} />;
      case 'Finance':
        return <Finance users={allUsers} />;
      case 'Settings':
        return <Settings />;
      case 'StudentProfile': {
        const student = allUsers.find(s => s.id === selectedStudentId) || (currentUser.role === 'Student' ? currentUser : undefined);
        
        if (!student || student.role !== 'Student') return <div>{t('studentNotFound')}</div>;
        
        return (
            <StudentProfile 
                student={student as Student} 
                onUpdateStudent={(updatedStudent) => handleUpdateUser(updatedStudent)}
            />
        );
      }
      default:
        return <Dashboard currentUser={currentUser} allUsers={allUsers} setView={handleSetView} />;
    }
  };
  
  const getHeaderTitle = () => {
    if (currentView === 'StudentProfile') {
      return t('studentProfile');
    }
    if (currentView === 'UserManagement') {
        return t('userManagement');
    }
    if (currentView === 'Settings') {
        return t('settings');
    }
    return t(currentView.toLowerCase());
  }

  if (!isDataLoaded) return null;

  if (allUsers.length > 0 && !currentUser) {
    return (
        <div style={{...styles.appContainer, backgroundColor: colors.background}}>
            <p style={{color: colors.text, padding: '2rem'}}>
                {t('userNotFound')} <br/> 
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{marginTop: '1rem', padding: '0.5rem 1rem'}}>
                    Reset Data
                </button>
            </p>
        </div>
    );
  }

  return (
    <div style={{...styles.appContainer, backgroundColor: colors.background}}>
      {isSidebarOpen && <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />}
      <Sidebar
        currentView={currentView}
        setView={handleSetView}
        userRole={currentUser!.role}
        isSidebarOpen={isSidebarOpen}
      />
      <div style={styles.mainContent}>
        <Header 
            currentUser={currentUser!} 
            currentViewTitle={getHeaderTitle()} 
            onMenuClick={() => setSidebarOpen(true)}
            onProfileClick={handleProfileClick}
        />
        <main style={styles.viewContainer} className="view-container">
            {renderView()}
        </main>
      </div>
    </div>
  );
};


const App = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <NotificationProvider>
            <AppContent />
        </NotificationProvider>
      </ThemeProvider>
    </LanguageProvider>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
    appContainer: {
        display: 'flex',
        height: '100vh',
        position: 'relative',
        overflowX: 'hidden',
        transition: 'background-color 0.3s ease',
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0, 
    },
    viewContainer: {
        padding: '2rem',
        overflowY: 'auto',
        flex: 1,
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
    },
};

export default App;
