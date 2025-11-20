import React from 'react';
import { courses, teachers, students } from '../../data/mockData';
import { StudentsIcon, TeachersIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';

const Courses = () => {
    const { t } = useLanguage();
    const getTeacherName = (teacherId: string) => teachers.find(t => t.id === teacherId)?.name || 'N/A';
    
    return (
        <div style={styles.grid}>
            {courses.map(course => (
                <div key={course.id} style={styles.card}>
                    <h3 style={styles.cardTitle}>{course.name}</h3>
                    <p style={styles.cardCode}>{course.code}</p>
                    <p style={styles.cardDescription}>{course.description}</p>
                    <div style={styles.cardFooter}>
                        <div style={styles.footerItem}>
                           <TeachersIcon /> <span>{getTeacherName(course.teacherId)}</span>
                        </div>
                        <div style={styles.footerItem}>
                           <StudentsIcon /> <span>{course.studentIds.length} {t('studentsLabel')}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        display: 'flex',
        flexDirection: 'column',
    },
    cardTitle: {
        margin: 0,
        fontSize: '1.25rem',
        fontWeight: 600,
        color: '#004AAD',
    },
    cardCode: {
        margin: '0.25rem 0 0',
        color: '#64748B',
        fontSize: '0.875rem',
        fontWeight: 500,
    },
    cardDescription: {
        margin: '1rem 0',
        color: '#334155',
        flex: 1,
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #E2E8F0',
        paddingTop: '1rem',
        marginTop: 'auto',
    },
    footerItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#475569',
        fontSize: '0.875rem',
    }
};

export default Courses;