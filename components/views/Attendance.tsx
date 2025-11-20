import React from 'react';
import { User } from '../../types';
import { attendance, courses, students } from '../../data/mockData';
import { useLanguage } from '../../contexts/LanguageContext';

interface AttendanceProps {
  currentUser: User;
}

const Attendance: React.FC<AttendanceProps> = ({ currentUser }) => {
  const { t } = useLanguage();
    // Only teachers can see this view as per sidebar logic
  const teacherCourses = courses.filter(c => c.teacherId === currentUser.id);
  const teacherAttendance = attendance.filter(a => teacherCourses.some(c => c.id === a.courseId));

  const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.name || 'N/A';
  const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'N/A';
  
  return (
    <div style={styles.container}>
        <div style={styles.tableWrapper}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>{t('date')}</th>
                        <th style={styles.th}>{t('course')}</th>
                        <th style={styles.th}>{t('student')}</th>
                        <th style={styles.th}>{t('status')}</th>
                    </tr>
                </thead>
                <tbody>
                    {teacherAttendance.map(record => (
                        <tr key={record.id} style={styles.tr}>
                            <td style={styles.td}>{record.date}</td>
                            <td style={styles.td}>{getCourseName(record.courseId)}</td>
                            <td style={styles.td}>{getStudentName(record.studentId)}</td>
                            <td style={styles.td}><span style={styles.status(record.status)}>{t(record.status.toLowerCase())}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

const statusColors = {
    'Present': { background: '#D1FAE5', color: '#065F46' },
    'Absent': { background: '#FEE2E2', color: '#991B1B' },
    'Late': { background: '#FEF3C7', color: '#92400E' },
    'Excused': { background: '#DBEAFE', color: '#1E40AF' },
};

const styles: { [key: string]: React.CSSProperties | ((status: string) => React.CSSProperties) } = {
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    },
    tableWrapper: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '500px',
    },
    th: {
        borderBottom: '2px solid #E2E8F0',
        padding: '0.75rem 1rem',
        textAlign: 'left',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#475569',
        textTransform: 'uppercase',
    },
    tr: {
        borderBottom: '1px solid #E2E8F0',
    },
    td: {
        padding: '0.75rem 1rem',
        color: '#334155',
    },
    status: (status: string) => ({
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontWeight: 500,
        fontSize: '0.8rem',
        ...statusColors[status as keyof typeof statusColors],
    }),
};

export default Attendance;