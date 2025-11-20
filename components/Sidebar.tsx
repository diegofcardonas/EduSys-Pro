
import React from 'react';
import { Role } from '../types';
import { DashboardIcon, StudentsIcon, TeachersIcon, CoursesIcon, GradesIcon, AttendanceIcon, TimetableIcon, CommunicationIcon, UsersIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  userRole: Role;
  isSidebarOpen: boolean;
}

interface NavItem {
    name: string;
    icon: React.ComponentType;
    roles: Role[];
    viewName: string; // Internal view name
}

const navItems: NavItem[] = [
    { name: 'Dashboard', viewName: 'Dashboard', icon: DashboardIcon, roles: ['Administrator', 'Professor', 'Student'] },
    { name: 'Users', viewName: 'UserManagement', icon: UsersIcon, roles: ['Administrator'] },
    { name: 'Timetable', viewName: 'Timetable', icon: TimetableIcon, roles: ['Professor', 'Student'] },
    { name: 'Courses', viewName: 'Courses', icon: CoursesIcon, roles: ['Administrator', 'Professor', 'Student'] },
    { name: 'Grades', viewName: 'Grades', icon: GradesIcon, roles: ['Professor', 'Student'] },
    { name: 'Attendance', viewName: 'Attendance', icon: AttendanceIcon, roles: ['Professor'] },
    { name: 'Communication', viewName: 'Communication', icon: CommunicationIcon, roles: ['Administrator', 'Professor', 'Student'] },
    { name: 'Students', viewName: 'Students', icon: StudentsIcon, roles: ['Professor'] },
    { name: 'Teachers', viewName: 'Teachers', icon: TeachersIcon, roles: ['Student'] },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, userRole, isSidebarOpen }) => {
  const { t } = useLanguage();
  const { theme, colors } = useTheme();
  
  // In dark mode, sidebar matches the card background (darker slate) or keeps brand? 
  // Let's keep brand identity but darken it slightly or use slate in dark mode for a cleaner look.
  // Design Choice: In Dark Mode, use Slate 900 (background) or 800 (card).
  const sidebarBg = theme === 'light' ? colors.primary : '#1E293B'; // Brand Blue vs Slate 800
  
  const filteredItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <nav style={{...styles.sidebar, backgroundColor: sidebarBg}} className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div style={styles.logoContainer}>
        <h1 style={styles.logo}>EduSys Pro</h1>
      </div>
      <ul style={styles.navList}>
        {filteredItems.map((item) => (
          <li key={item.name}>
            <button 
              style={currentView === item.viewName ? {...styles.navButton, ...styles.navButtonActive} : styles.navButton} 
              onClick={() => setView(item.viewName)}
            >
              <item.icon />
              <span>{t(item.name.toLowerCase())}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: '250px',
    color: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    transition: 'background-color 0.3s ease',
  },
  logoContainer: {
    padding: '1.5rem',
    textAlign: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  logo: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: 'bold',
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    paddingTop: '1rem',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
    padding: '1rem 1.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.2s, color 0.2s',
  },
  navButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    fontWeight: 600,
    borderLeft: '4px solid #FFFFFF', // Add visual indicator
  }
};

export default Sidebar;
