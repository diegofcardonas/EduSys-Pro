import React from 'react';
import { User } from '../../types';
import { grades, courses, students } from '../../data/mockData';
import { useLanguage } from '../../contexts/LanguageContext';

interface GradesProps {
  currentUser: User;
}

const Grades: React.FC<GradesProps> = ({ currentUser }) => {
  const { t } = useLanguage();
  const userGrades = grades.filter(g => 
    currentUser.role === 'Student' ? g.studentId === currentUser.id : courses.find(c => c.id === g.courseId)?.teacherId === currentUser.id
  );

  const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.name || 'N/A';
  const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'N/A';

  return (
    <div style={styles.container}>
        <div style={styles.tableWrapper}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>{t('course')}</th>
                        {currentUser.role === 'Professor' && <th style={styles.th}>{t('student')}</th>}
                        <th style={styles.th}>{t('assignment')}</th>
                        <th style={styles.th}>{t('date')}</th>
                        <th style={styles.th}>{t('score')}</th>
                    </tr>
                </thead>
                <tbody>
                    {userGrades.map(grade => (
                        <tr key={grade.id} style={styles.tr}>
                            <td style={styles.td}>{getCourseName(grade.courseId)}</td>
                            {currentUser.role === 'Professor' && <td style={styles.td}>{getStudentName(grade.studentId)}</td>}
                            <td style={styles.td}>{grade.assignment}</td>
                            <td style={styles.td}>{grade.date}</td>
                            <td style={styles.tdScore(grade.score)}>{grade.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties | ((score: number) => React.CSSProperties) } = {
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
        minWidth: '600px',
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
    tdScore: (score: number) => ({
        padding: '0.75rem 1rem',
        color: score >= 90 ? '#166534' : score >= 70 ? '#1d4ed8' : '#991b1b',
        fontWeight: 600,
    })
};

export default Grades;