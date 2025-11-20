
import React from 'react';
import { User, Role } from '../../types';
import { courses, grades, teachers } from '../../data/mockData'; // Keep these mocks for now, but use allUsers for users
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
    UsersIcon, 
    CoursesIcon, 
    TrendUpIcon, 
    DollarIcon, 
    ActivityIcon, 
    ClockIcon, 
    CheckCircleIcon, 
    ArrowRightIcon,
    PlusIcon,
    MailIcon,
    ReportIcon
} from '../Icons';

interface DashboardProps {
    currentUser: User;
    allUsers: User[];
    setView: (view: string, params?: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, allUsers, setView }) => {
    const { t } = useLanguage();
    const { colors, theme } = useTheme();
    const { addNotification } = useNotification();

    // --- Computed Data Helpers ---

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('goodMorning', { name: currentUser.name });
        if (hour < 18) return t('goodAfternoon', { name: currentUser.name });
        return t('goodEvening', { name: currentUser.name });
    };

    // Calculate Dynamic Stats based on props
    const getRoleBasedStats = () => {
        if (currentUser.role === 'Administrator') {
            const studentCount = allUsers.filter(u => u.role === 'Student').length;
            const teacherCount = allUsers.filter(u => u.role === 'Professor').length;
            
            return [
                { label: t('totalStudents'), value: studentCount, icon: UsersIcon, color: '#059669', bg: '#D1FAE5', trend: '+12%' },
                { label: t('totalTeachers'), value: teacherCount, icon: UsersIcon, color: '#2563EB', bg: '#DBEAFE', trend: '+2%' },
                { label: t('revenue'), value: '$124k', icon: DollarIcon, color: '#D97706', bg: '#FEF3C7', trend: '+8%' },
                { label: t('systemHealth'), value: '99.9%', icon: CheckCircleIcon, color: '#7C3AED', bg: '#EDE9FE', trend: t('operational') },
            ];
        } else if (currentUser.role === 'Professor') {
            const myCourses = courses.filter(c => c.teacherId === currentUser.id);
            return [
                { label: t('creditsEarned'), value: myCourses.length, icon: CoursesIcon, color: '#2563EB', bg: '#DBEAFE', trend: 'Active' },
                { label: t('studentsLabel'), value: myCourses.reduce((acc, c) => acc + c.studentIds.length, 0), icon: UsersIcon, color: '#059669', bg: '#D1FAE5', trend: 'Total' },
                { label: t('pendingTasks'), value: '12', icon: ClockIcon, color: '#D97706', bg: '#FEF3C7', trend: 'Grading' },
                { label: t('attendanceRate'), value: '94%', icon: CheckCircleIcon, color: '#7C3AED', bg: '#EDE9FE', trend: 'This Week' },
            ];
        } else { // Student
            const myGrades = grades.filter(g => g.studentId === currentUser.id);
            const avg = myGrades.length > 0 ? Math.round(myGrades.reduce((a, b) => a + b.score, 0) / myGrades.length) : 0;
            return [
                { label: t('averageScore'), value: `${avg}`, icon: TrendUpIcon, color: '#059669', bg: '#D1FAE5', trend: avg > 85 ? t('excellent') : t('good') },
                { label: t('creditsEarned'), value: courses.filter(c => c.studentIds.includes(currentUser.id)).length, icon: CoursesIcon, color: '#2563EB', bg: '#DBEAFE', trend: 'Enrolled' },
                { label: t('attendanceRate'), value: '98%', icon: CheckCircleIcon, color: '#7C3AED', bg: '#EDE9FE', trend: 'Perfect' },
                { label: t('pendingTasks'), value: '3', icon: ClockIcon, color: '#D97706', bg: '#FEF3C7', trend: 'Due Soon' },
            ];
        }
    };

    const stats = getRoleBasedStats();

    // --- Action Handlers ---

    const handleQuickAction = (actionKey: string) => {
        switch (actionKey) {
            case 'addUser':
                setView('UserManagement', { openAddModal: true });
                break;
            case 'financialStatus':
                addNotification(t('financialReportGenerated'), 'success');
                break;
            case 'generateReport':
                addNotification(t('systemReportGenerated'), 'info');
                break;
            case 'communication':
            case 'sendMessage':
                setView('Communication');
                break;
            case 'assignment':
                addNotification('New assignment draft created.', 'info');
                break;
            case 'attendance':
                setView('Attendance');
                break;
            case 'grades':
            case 'myGrades':
                setView('Grades');
                break;
            case 'schedule':
                setView('Timetable');
                break;
            default:
                console.log('Unknown action', actionKey);
        }
    };

    const getQuickActions = () => {
        if (currentUser.role === 'Administrator') {
            return [
                { id: 'addUser', label: t('addUser'), icon: PlusIcon, color: colors.primary },
                { id: 'financialStatus', label: t('financialStatus'), icon: DollarIcon, color: colors.success },
                { id: 'generateReport', label: t('generateReport'), icon: ReportIcon, color: colors.warning },
                { id: 'communication', label: t('communication'), icon: MailIcon, color: colors.danger },
            ];
        } else if (currentUser.role === 'Professor') {
            return [
                { id: 'assignment', label: t('assignment'), icon: PlusIcon, color: colors.primary },
                { id: 'attendance', label: t('attendance'), icon: CheckCircleIcon, color: colors.success },
                { id: 'grades', label: t('grades'), icon: ReportIcon, color: colors.warning },
                { id: 'sendMessage', label: t('sendMessage'), icon: MailIcon, color: colors.danger },
            ];
        } else {
            return [
                { id: 'myGrades', label: t('myGrades'), icon: ReportIcon, color: colors.primary },
                { id: 'schedule', label: t('schedule'), icon: ClockIcon, color: colors.success },
                { id: 'sendMessage', label: t('sendMessage'), icon: MailIcon, color: colors.warning },
            ];
        }
    };

    // Mock Activity Data
    const activities = [
        { id: 1, text: t('newStudentReg'), time: '2h ago', type: 'info' },
        { id: 2, text: t('systemUpdate'), time: '5h ago', type: 'warning' },
        { id: 3, text: 'Dr. Reed uploaded Biology 101 Syllabus', time: '1d ago', type: 'success' },
        { id: 4, text: 'Finance Dept: Monthly report generated', time: '1d ago', type: 'info' },
    ];

    return (
        <div style={styles.container}>
            {/* Welcome Header */}
            <div style={{...styles.heroSection, background: theme === 'dark' ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' : 'linear-gradient(135deg, #004AAD 0%, #002F6C 100%)'}}>
                <div style={styles.heroContent}>
                    <h1 style={styles.welcomeTitle}>{getGreeting()}</h1>
                    <p style={styles.welcomeSubtitle}>{t('welcomeSubtitle')}</p>
                </div>
                <div style={styles.heroDate}>
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* KPI Stats Grid */}
            <div style={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} style={{...styles.statCard, backgroundColor: colors.card}}>
                        <div style={styles.statHeader}>
                            <div style={{...styles.statIconBox, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : stat.bg, color: stat.color}}>
                                <stat.icon />
                            </div>
                            <span style={{...styles.statTrend, color: stat.label === t('systemHealth') ? colors.success : colors.textSecondary}}>
                                {stat.trend}
                            </span>
                        </div>
                        <div style={styles.statBody}>
                            <h3 style={{...styles.statValue, color: colors.text}}>{stat.value}</h3>
                            <p style={{...styles.statLabel, color: colors.textSecondary}}>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={styles.mainGrid}>
                {/* Left Column: Actions & Charts */}
                <div style={styles.leftColumn}>
                    {/* Quick Actions */}
                    <div style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h3 style={{...styles.sectionTitle, color: colors.text}}>{t('quickActions')}</h3>
                        </div>
                        <div style={styles.actionsGrid}>
                            {getQuickActions().map((action) => (
                                <button 
                                    key={action.id} 
                                    style={{...styles.actionButton, backgroundColor: colors.card, borderColor: colors.border}}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    onClick={() => handleQuickAction(action.id)}
                                >
                                    <div style={{...styles.actionIcon, color: action.color}}>
                                        <action.icon />
                                    </div>
                                    <span style={{...styles.actionLabel, color: colors.text}}>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Role Specific "Feature" Card (Mock Chart/List) */}
                    <div style={{...styles.featureCard, backgroundColor: colors.card}}>
                         <div style={styles.cardHeader}>
                            <h3 style={{...styles.cardTitle, color: colors.text}}>
                                {currentUser.role === 'Administrator' ? t('revenue') : t('attendanceOverview')}
                            </h3>
                            <button 
                                style={{...styles.viewAllBtn, color: colors.primary}}
                                onClick={() => addNotification(t('featureNotAvailable'), 'warning')}
                            >
                                {t('viewAll')} <ArrowRightIcon />
                            </button>
                         </div>
                         <div style={styles.chartPlaceholder}>
                             {/* Simple CSS Bar Chart Mockup */}
                             {[65, 40, 75, 55, 80, 95, 70].map((h, i) => (
                                 <div key={i} style={styles.barContainer}>
                                     <div style={{...styles.bar, height: `${h}%`, backgroundColor: i === 5 ? colors.primary : colors.border}}></div>
                                     <span style={{...styles.barLabel, color: colors.textSecondary}}>{['M','T','W','T','F','S','S'][i]}</span>
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>

                {/* Right Column: Activity & Schedule */}
                <div style={styles.rightColumn}>
                     {/* Recent Activity */}
                     <div style={{...styles.activityCard, backgroundColor: colors.card}}>
                        <div style={styles.cardHeader}>
                            <h3 style={{...styles.cardTitle, color: colors.text}}><ActivityIcon /> {t('recentActivity')}</h3>
                        </div>
                        <div style={styles.activityList}>
                            {activities.map((act) => (
                                <div key={act.id} style={{...styles.activityItem, borderLeftColor: act.type === 'info' ? colors.primary : act.type === 'success' ? colors.success : colors.warning}}>
                                    <p style={{...styles.activityText, color: colors.text}}>{act.text}</p>
                                    <span style={{...styles.activityTime, color: colors.textSecondary}}>{act.time}</span>
                                </div>
                            ))}
                        </div>
                     </div>

                     {/* Upcoming Schedule / Next Class */}
                     <div style={{...styles.scheduleCard, backgroundColor: colors.primary, color: '#fff'}}>
                         <div style={styles.cardHeader}>
                             <h3 style={{...styles.cardTitle, color: '#fff'}}><ClockIcon /> {t('nextClass')}</h3>
                         </div>
                         <div style={styles.nextClassContent}>
                             <div style={styles.classTimeBox}>
                                 <span style={styles.classTimeBig}>10:00</span>
                                 <span style={styles.classTimeAm}>AM</span>
                             </div>
                             <div style={styles.classInfo}>
                                 <h4 style={styles.className}>Biology 101</h4>
                                 <p style={styles.classLoc}>Room 302 • Dr. Reed</p>
                             </div>
                         </div>
                         <div style={styles.upcomingList}>
                            <div style={styles.upcomingItem}>
                                <span>12:00 PM</span>
                                <span>Lunch Break</span>
                            </div>
                            <div style={styles.upcomingItem}>
                                <span>01:30 PM</span>
                                <span>History 201</span>
                            </div>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    heroSection: {
        borderRadius: '16px',
        padding: '2.5rem',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    welcomeTitle: {
        margin: 0,
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.2,
    },
    welcomeSubtitle: {
        margin: '0.5rem 0 0',
        fontSize: '1rem',
        opacity: 0.9,
    },
    heroDate: {
        fontSize: '1.1rem',
        fontWeight: 500,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        backdropFilter: 'blur(5px)',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
    },
    statCard: {
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s',
    },
    statHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
    },
    statIconBox: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statTrend: {
        fontSize: '0.875rem',
        fontWeight: 600,
    },
    statBody: {},
    statValue: {
        margin: 0,
        fontSize: '2rem',
        fontWeight: 700,
    },
    statLabel: {
        margin: '0.25rem 0 0',
        fontSize: '0.9rem',
    },
    mainGrid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1.5rem',
    },
    leftColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    rightColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        minWidth: '300px',
    },
    sectionTitle: {
        margin: 0,
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '1rem',
    },
    actionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
    },
    actionButton: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        gap: '0.75rem',
        outline: 'none',
    },
    actionIcon: {
        width: '32px',
        height: '32px',
    },
    actionLabel: {
        fontWeight: 600,
        fontSize: '0.9rem',
    },
    featureCard: {
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        flex: 1,
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    cardTitle: {
        margin: 0,
        fontSize: '1.1rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    viewAllBtn: {
        background: 'none',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
    },
    chartPlaceholder: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: '200px',
        paddingTop: '1rem',
    },
    barContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        height: '100%',
        justifyContent: 'flex-end',
        width: '100%',
    },
    bar: {
        width: '24px',
        borderRadius: '4px',
        transition: 'height 0.5s ease',
    },
    barLabel: {
        fontSize: '0.75rem',
        fontWeight: 500,
    },
    activityCard: {
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    },
    activityList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    activityItem: {
        padding: '0.75rem 0 0.75rem 1rem',
        borderLeft: '3px solid',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    activityText: {
        margin: 0,
        fontSize: '0.9rem',
        fontWeight: 500,
    },
    activityTime: {
        fontSize: '0.75rem',
    },
    scheduleCard: {
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    nextClassContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
    },
    classTimeBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: 1,
    },
    classTimeBig: {
        fontSize: '1.75rem',
        fontWeight: 700,
    },
    classTimeAm: {
        fontSize: '0.8rem',
        fontWeight: 500,
        opacity: 0.8,
    },
    classInfo: {},
    className: {
        margin: 0,
        fontSize: '1.2rem',
        fontWeight: 700,
    },
    classLoc: {
        margin: '0.25rem 0 0',
        fontSize: '0.9rem',
        opacity: 0.9,
    },
    upcomingList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    upcomingItem: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.9rem',
        opacity: 0.9,
    }
};

export default Dashboard;
