import React from 'react';
import { User } from '../../types';
import { timetable, courses } from '../../data/mockData';
import { useLanguage } from '../../contexts/LanguageContext';

interface TimetableProps {
  currentUser: User;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

const Timetable: React.FC<TimetableProps> = ({ currentUser }) => {
    const { t } = useLanguage();
    const userCourses = currentUser.role === 'Student' 
        ? courses.filter(c => c.studentIds.includes(currentUser.id))
        : courses.filter(c => c.teacherId === currentUser.id);
    
    const userTimetable = timetable.filter(entry => userCourses.some(c => c.id === entry.courseId));

    const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.name || 'N/A';

    return (
        <div style={styles.container}>
            <div style={styles.grid}>
                <div style={styles.headerCell}>{t('time')}</div>
                {days.map(day => <div key={day} style={styles.headerCell}>{t(day.toLowerCase())}</div>)}
                
                {timeSlots.map(time => (
                    <React.Fragment key={time}>
                        <div style={styles.timeCell}>{time}</div>
                        {days.map(day => {
                            const entry = userTimetable.find(e => e.day === day && e.startTime.startsWith(time.split(':')[0]));
                            return (
                                <div key={`${day}-${time}`} style={styles.bodyCell}>
                                    {entry && (
                                        <div style={styles.event}>
                                            <p style={styles.eventName}>{getCourseName(entry.courseId)}</p>
                                            <p style={styles.eventTime}>{`${entry.startTime} - ${entry.endTime}`}</p>
                                            <p style={styles.eventRoom}>{t('room')}: {entry.room}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        overflowX: 'auto',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '60px repeat(5, 1fr)',
        minWidth: '800px',
    },
    headerCell: {
        padding: '0.75rem',
        textAlign: 'center',
        fontWeight: 600,
        backgroundColor: '#F8FAFC',
        border: '1px solid #E2E8F0',
    },
    timeCell: {
        padding: '0.75rem',
        textAlign: 'center',
        fontWeight: 500,
        backgroundColor: '#F8FAFC',
        border: '1px solid #E2E8F0',
        fontSize: '0.8rem',
    },
    bodyCell: {
        minHeight: '100px',
        border: '1px solid #E2E8F0',
        padding: '0.5rem',
    },
    event: {
        backgroundColor: '#DBEAFE',
        color: '#1E40AF',
        borderRadius: '4px',
        padding: '0.5rem',
        height: '100%',
    },
    eventName: {
        margin: 0,
        fontWeight: 600,
        fontSize: '0.875rem',
    },
    eventTime: {
        margin: '0.25rem 0 0',
        fontSize: '0.75rem',
    },
    eventRoom: {
        margin: '0.25rem 0 0',
        fontSize: '0.75rem',
    }
};

export default Timetable;