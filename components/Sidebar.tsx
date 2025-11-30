


import React, { useState } from 'react';
import { Role } from '../types';
import { 
    DashboardIcon, StudentsIcon, TeachersIcon, CoursesIcon, 
    GradesIcon, AttendanceIcon, TimetableIcon, CommunicationIcon, 
    UsersIcon, ChevronRightDoubleIcon, ChevronLeftDoubleIcon, SettingsIcon, HelpIcon
} from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  userRole: Role;
  isSidebarOpen: boolean;
}

interface NavItem {
    name: string;
    viewName: string;
    icon: React.ComponentType;
    roles: Role[];
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, userRole, isSidebarOpen }) => {
  const { t } = useLanguage();
  const { theme, colors } = useTheme();
  const { addNotification } = useNotification();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Define Groups
  const navGroups: NavGroup[] = [
      {
          label: 'menu_main',
          items: [
              { name: 'dashboard', viewName: 'Dashboard', icon: DashboardIcon, roles: ['Administrator', 'Professor', 'Student'] },
          ]
      },
      {
          label: 'menu_academic',
          items: [
            { name: 'courses', viewName: 'Courses', icon: CoursesIcon, roles: ['Administrator', 'Professor', 'Student'] },
            { name: 'timetable', viewName: 'Timetable', icon: TimetableIcon, roles: ['Administrator', 'Professor', 'Student'] },
            { name: 'grades', viewName: 'Grades', icon: GradesIcon, roles: ['Administrator', 'Professor', 'Student'] },
            { name: 'attendance', viewName: 'Attendance', icon: AttendanceIcon, roles: ['Administrator', 'Professor'] },
            { name: 'students', viewName: 'Students', icon: StudentsIcon, roles: ['Administrator', 'Professor'] },
            { name: 'teachers', viewName: 'Teachers', icon: TeachersIcon, roles: ['Administrator', 'Professor', 'Student'] },
          ]
      },
      {
          label: 'menu_admin',
          items: [
              { name: 'users', viewName: 'UserManagement', icon: UsersIcon, roles: ['Administrator'] },
          ]
      },
      {
          label: 'menu_general',
          items: [
              { name: 'communication', viewName: 'Communication', icon: CommunicationIcon, roles: ['Administrator', 'Professor', 'Student'] },
          ]
      }
  ];

  const toggleCollapse = () => {
      setIsCollapsed(!isCollapsed);
  };

  const sidebarBg = theme === 'light' ? colors.primary : '#1E293B'; 
  
  // The width should only be controlled by the collapsed state for desktop view.
  // The open/closed state on mobile is handled entirely by a CSS class (`.open`).
  const width = isCollapsed ? '80px' : '280px';
  
  const handleFooterAction = (action: string) => {
      addNotification(`${t('featureNotAvailable')}: ${action}`, 'info');
  };

  return (
    <nav 
        style={{...styles.sidebar, width, backgroundColor: sidebarBg}} 
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
    >
      {/* Header / Logo */}
      <div style={styles.header}>
        <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>ES</div>
            {!isCollapsed && <h1 style={styles.logoText}>EduSys Pro</h1>}
        </div>
        {/* Collapse Toggle (Desktop Only) - Class added to hide on mobile */}
        <button style={styles.collapseBtn} onClick={toggleCollapse} className="sidebar-collapse-btn">
            {isCollapsed ? <ChevronRightDoubleIcon /> : <ChevronLeftDoubleIcon />}
        </button>
      </div>

      {/* Scrollable Nav Content */}
      <div style={styles.scrollContent}>
        {navGroups.map((group, groupIndex) => {
            // Filter items by role
            const groupItems = group.items.filter(item => item.roles.includes(userRole));
            if (groupItems.length === 0) return null;

            return (
                <div key={groupIndex} style={styles.group}>
                    {!isCollapsed && <h3 style={styles.groupLabel}>{t(group.label)}</h3>}
                    <ul style={styles.navList}>
                        {groupItems.map(item => {
                             const isActive = currentView === item.viewName;
                             return (
                                <li key={item.name}>
                                    <button 
                                        style={{
                                            ...styles.navButton,
                                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                                            backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                                            color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                                            borderLeft: isActive && !isCollapsed ? '4px solid #FFFFFF' : '4px solid transparent',
                                        }}
                                        onClick={() => setView(item.viewName)}
                                        title={isCollapsed ? t(item.name) : ''}
                                    >
                                        <div style={{...styles.iconWrapper, color: isActive ? '#fff' : 'inherit'}}>
                                            <item.icon />
                                        </div>
                                        {!isCollapsed && <span style={styles.navText}>{t(item.name)}</span>}
                                    </button>
                                </li>
                             );
                        })}
                    </ul>
                    {!isCollapsed && <div style={styles.divider} />}
                </div>
            );
        })}
      </div>

      {/* Footer Actions */}
      <div style={styles.footer}>
        <button 
            style={{
                ...styles.footerBtn, 
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                backgroundColor: currentView === 'Settings' ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: currentView === 'Settings' ? '#FFFFFF' : 'rgba(255,255,255,0.7)'
            }} 
            onClick={() => setView('Settings')}
            title={t('settings')}
        >
            <SettingsIcon />
            {!isCollapsed && <span>{t('settings')}</span>}
        </button>
        <button 
            style={{...styles.footerBtn, justifyContent: isCollapsed ? 'center' : 'flex-start'}} 
            onClick={() => handleFooterAction('Help')}
            title={t('help')}
        >
            <HelpIcon />
            {!isCollapsed && <span>{t('help')}</span>}
        </button>
      </div>

    </nav>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Transition width for desktop collapse
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
    zIndex: 20,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem 1rem',
    minHeight: '80px',
  },
  logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      overflow: 'hidden',
  },
  logoIcon: {
      width: '40px',
      height: '40px',
      backgroundColor: '#FFFFFF',
      color: '#004AAD',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 900,
      fontSize: '1.2rem',
      flexShrink: 0,
  },
  logoText: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#FFFFFF',
    letterSpacing: '-0.02em',
  },
  collapseBtn: {
      background: 'rgba(255,255,255,0.1)',
      border: 'none',
      borderRadius: '8px',
      color: '#FFFFFF',
      cursor: 'pointer',
      padding: '0.5rem',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.2s',
  },
  scrollContent: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '1rem 0',
      // Hide scrollbar for aesthetics
      scrollbarWidth: 'none', 
  },
  group: {
      marginBottom: '0.5rem',
  },
  groupLabel: {
      padding: '0 1.5rem',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.5)',
      fontWeight: 600,
      marginBottom: '0.5rem',
      marginTop: '0.5rem',
      letterSpacing: '0.05em',
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
    padding: '0.85rem 1.5rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
  },
  navText: {
      fontSize: '0.95rem',
      fontWeight: 500,
  },
  iconWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
  },
  divider: {
      height: '1px',
      backgroundColor: 'rgba(255,255,255,0.1)',
      margin: '0.5rem 1.5rem',
  },
  footer: {
      padding: '1rem',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      backgroundColor: 'rgba(0,0,0,0.05)',
  },
  footerBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.75rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '8px',
      color: 'rgba(255,255,255,0.7)',
      cursor: 'pointer',
      transition: 'background 0.2s, color 0.2s',
      fontSize: '0.9rem',
  }
};

export default Sidebar;
