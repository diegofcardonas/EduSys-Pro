
import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, AttendanceStatus, Course } from '../../types';
import { attendance as initialAttendance, courses as initialCourses } from '../../data/mockData';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { CheckCircleIcon, BanIcon, ClockIcon, AlertIcon } from '../Icons';

interface AttendanceProps {
  currentUser: User;
  users: User[];
}

const Attendance: React.FC<AttendanceProps> = ({ currentUser, users }) => {
  const { t } = useLanguage();
  const { colors, theme } = useTheme();
  const { addNotification } = useNotification();

  // --- State ---
  const [localAttendance, setLocalAttendance] = useState<AttendanceRecord[]>([]);
  const [localCourses, setLocalCourses] = useState<Course[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // --- Load Data ---
  useEffect(() => {
    // Attendance
    const storedAttendance = localStorage.getItem('edusys_attendance');
    if (storedAttendance) {
        setLocalAttendance(JSON.parse(storedAttendance));
    } else {
        setLocalAttendance(initialAttendance);
    }
    // Courses
    const storedCourses = localStorage.getItem('edusys_courses');
    if (storedCourses) {
        setLocalCourses(JSON.parse(storedCourses));
    } else {
        setLocalCourses(initialCourses);
    }
  }, []);

  // --- Persist Data ---
  useEffect(() => {
    if (localAttendance.length > 0) {
        localStorage.setItem('edusys_attendance', JSON.stringify(localAttendance));
    }
  }, [localAttendance]);

  // --- Logic for Teacher/Admin (Taking Attendance) ---
  
  // Filter courses: Admins see all, Professors see theirs
  const availableCourses = localCourses.filter(c => 
      currentUser.role === 'Administrator' || c.teacherId === currentUser.id
  );

  // Set default course if none selected
  useEffect(() => {
      if (!selectedCourseId && availableCourses.length > 0) {
          setSelectedCourseId(availableCourses[0].id);
      }
  }, [availableCourses, selectedCourseId]);

  // Get students for current course
  const currentCourse = localCourses.find(c => c.id === selectedCourseId);
  const enrolledStudents = currentCourse 
      ? users.filter(u => currentCourse.studentIds.includes(u.id))
      : [];

  // Get status for a specific student on selected date
  const getStatus = (studentId: string): AttendanceStatus | null => {
      const record = localAttendance.find(
          a => a.studentId === studentId && a.courseId === selectedCourseId && a.date === selectedDate
      );
      return record ? record.status : null;
  };

  // Update Status
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
      setLocalAttendance(prev => {
          // Remove existing record for this day/student/course if it exists
          const filtered = prev.filter(
              a => !(a.studentId === studentId && a.courseId === selectedCourseId && a.date === selectedDate)
          );
          // Add new record
          const newRecord: AttendanceRecord = {
              id: `att_${Date.now()}_${Math.random()}`,
              studentId,
              courseId: selectedCourseId,
              date: selectedDate,
              status
          };
          return [...filtered, newRecord];
      });
      // Optional: Tiny notification or just visual feedback (visual is better for bulk)
  };

  const markAllPresent = () => {
      const newRecords: AttendanceRecord[] = enrolledStudents.map(s => ({
          id: `att_${Date.now()}_${s.id}`,
          studentId: s.id,
          courseId: selectedCourseId,
          date: selectedDate,
          status: 'Present'
      }));

      setLocalAttendance(prev => {
           // Remove all existing records for this day/course to prevent duplicates
           const otherRecords = prev.filter(
              a => !(a.courseId === selectedCourseId && a.date === selectedDate)
           );
           return [...otherRecords, ...newRecords];
      });
      addNotification(t('attendanceSaved'), 'success');
  };

  // --- Logic for Students (Viewing History) ---
  const myAttendance = localAttendance.filter(a => a.studentId === currentUser.id);
  
  // Stats for Student
  const calculateStudentStats = () => {
      const total = myAttendance.length;
      if (total === 0) return { rate: 100, present: 0, absent: 0, late: 0 };
      const present = myAttendance.filter(a => a.status === 'Present').length;
      const late = myAttendance.filter(a => a.status === 'Late').length;
      const absent = myAttendance.filter(a => a.status === 'Absent').length;
      // Late counts as 0.5 or 1 depending on policy, usually 1 for rate but separate metric
      const rate = Math.round(((present + late) / total) * 100);
      return { rate, present, absent, late };
  };

  // --- Render Helpers ---

  const getStatusColor = (status: AttendanceStatus) => {
      switch(status) {
          case 'Present': return { bg: '#D1FAE5', text: '#065F46', border: '#34D399' };
          case 'Absent': return { bg: '#FEE2E2', text: '#991B1B', border: '#F87171' };
          case 'Late': return { bg: '#FEF3C7', text: '#92400E', border: '#FBBF24' };
          case 'Excused': return { bg: '#DBEAFE', text: '#1E40AF', border: '#60A5FA' };
          default: return { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' };
      }
  };

  // --- Views ---

  const renderTeacherView = () => {
      const dailyPresent = enrolledStudents.filter(s => getStatus(s.id) === 'Present').length;
      const dailyAbsent = enrolledStudents.filter(s => getStatus(s.id) === 'Absent').length;

      return (
          <div style={styles.container}>
              {/* Header Controls */}
              <div style={{...styles.controlBar, backgroundColor: colors.card, borderBottomColor: colors.border}}>
                  <div style={styles.controlGroup}>
                      <div style={styles.inputGroup}>
                          <label style={{...styles.label, color: colors.textSecondary}}>{t('selectCourse')}</label>
                          <select 
                              style={{...styles.select, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                              value={selectedCourseId}
                              onChange={(e) => setSelectedCourseId(e.target.value)}
                          >
                              {availableCourses.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                          </select>
                      </div>
                      <div style={styles.inputGroup}>
                          <label style={{...styles.label, color: colors.textSecondary}}>{t('selectDate')}</label>
                          <input 
                              type="date"
                              style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                          />
                      </div>
                  </div>
                  
                  {/* Daily Summary */}
                  {selectedCourseId && (
                      <div style={styles.summaryStats}>
                          <div style={{...styles.summaryBadge, backgroundColor: '#D1FAE5', color: '#065F46'}}>
                              {t('present')}: {dailyPresent}
                          </div>
                          <div style={{...styles.summaryBadge, backgroundColor: '#FEE2E2', color: '#991B1B'}}>
                              {t('absent')}: {dailyAbsent}
                          </div>
                      </div>
                  )}
              </div>

              {/* Roster Table */}
              <div style={{...styles.card, backgroundColor: colors.card}}>
                  {selectedCourseId ? (
                      <>
                        <div style={styles.cardHeader}>
                             <h3 style={{...styles.cardTitle, color: colors.text}}>{t('takeAttendance')}</h3>
                             <button style={{...styles.primaryBtn, backgroundColor: colors.primary}} onClick={markAllPresent}>
                                 {t('markAllPresent')}
                             </button>
                        </div>
                        {enrolledStudents.length > 0 ? (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('student')}</th>
                                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('status')}</th>
                                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrolledStudents.map(student => {
                                            const currentStatus = getStatus(student.id);
                                            return (
                                                <tr key={student.id} style={{...styles.tr, borderBottomColor: colors.border}}>
                                                    <td style={{...styles.td, color: colors.text}}>
                                                        <div style={styles.studentInfo}>
                                                            <img src={student.avatarUrl || `https://ui-avatars.com/api/?name=${student.name}`} style={styles.avatar} alt=""/>
                                                            <span>{student.name}</span>
                                                        </div>
                                                    </td>
                                                    <td style={styles.td}>
                                                        {currentStatus ? (
                                                            <span style={{...styles.statusBadge, ...getStatusColor(currentStatus)}}>
                                                                {t(currentStatus.toLowerCase())}
                                                            </span>
                                                        ) : (
                                                            <span style={{...styles.statusBadge, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>
                                                                -
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={styles.td}>
                                                        <div style={styles.statusButtons}>
                                                            {(['Present', 'Late', 'Absent', 'Excused'] as AttendanceStatus[]).map(status => (
                                                                <button
                                                                    key={status}
                                                                    style={{
                                                                        ...styles.statusBtn,
                                                                        ...getStatusColor(status),
                                                                        opacity: currentStatus === status ? 1 : 0.4,
                                                                        transform: currentStatus === status ? 'scale(1.05)' : 'scale(1)',
                                                                        border: currentStatus === status ? `2px solid ${getStatusColor(status).border}` : '1px solid transparent'
                                                                    }}
                                                                    onClick={() => handleStatusChange(student.id, status)}
                                                                    title={t(status.toLowerCase())}
                                                                >
                                                                    {status.charAt(0)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{padding: '2rem', textAlign: 'center', color: colors.textSecondary}}>
                                {t('noStudentsInCourse')}
                            </div>
                        )}
                      </>
                  ) : (
                      <div style={{padding: '3rem', textAlign: 'center', color: colors.textSecondary}}>
                          {t('selectCourseToView')}
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const renderStudentView = () => {
      const stats = calculateStudentStats();
      const studentHistory = myAttendance.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return (
          <div style={styles.container}>
              {/* Stats Cards */}
              <div style={styles.statsGrid}>
                  <div style={{...styles.statCard, backgroundColor: colors.card}}>
                      <div style={{...styles.statIcon, backgroundColor: '#D1FAE5', color: '#059669'}}><CheckCircleIcon /></div>
                      <div>
                          <p style={{...styles.statLabel, color: colors.textSecondary}}>{t('attendanceRate')}</p>
                          <h3 style={{...styles.statValue, color: colors.text}}>{stats.rate}%</h3>
                      </div>
                  </div>
                  <div style={{...styles.statCard, backgroundColor: colors.card}}>
                      <div style={{...styles.statIcon, backgroundColor: '#FEE2E2', color: '#991B1B'}}><BanIcon /></div>
                      <div>
                          <p style={{...styles.statLabel, color: colors.textSecondary}}>{t('absent')}</p>
                          <h3 style={{...styles.statValue, color: colors.text}}>{stats.absent}</h3>
                      </div>
                  </div>
                   <div style={{...styles.statCard, backgroundColor: colors.card}}>
                      <div style={{...styles.statIcon, backgroundColor: '#FEF3C7', color: '#92400E'}}><ClockIcon /></div>
                      <div>
                          <p style={{...styles.statLabel, color: colors.textSecondary}}>{t('late')}</p>
                          <h3 style={{...styles.statValue, color: colors.text}}>{stats.late}</h3>
                      </div>
                  </div>
              </div>

              {/* History Table */}
              <div style={{...styles.card, backgroundColor: colors.card}}>
                  <div style={styles.cardHeader}>
                      <h3 style={{...styles.cardTitle, color: colors.text}}>{t('history')}</h3>
                  </div>
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('date')}</th>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('course')}</th>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentHistory.length > 0 ? studentHistory.map(record => {
                                const courseName = localCourses.find(c => c.id === record.courseId)?.name || 'Unknown';
                                return (
                                    <tr key={record.id} style={{...styles.tr, borderBottomColor: colors.border}}>
                                        <td style={{...styles.td, color: colors.text}}>{record.date}</td>
                                        <td style={{...styles.td, color: colors.text}}>{courseName}</td>
                                        <td style={styles.td}>
                                            <span style={{...styles.statusBadge, ...getStatusColor(record.status)}}>
                                                {t(record.status.toLowerCase())}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={3} style={{padding: '2rem', textAlign: 'center', color: colors.textSecondary}}>
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      );
  };

  return currentUser.role === 'Student' ? renderStudentView() : renderTeacherView();
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    // Control Bar
    controlBar: {
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        borderBottom: '1px solid',
    },
    controlGroup: {
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: 600,
    },
    select: {
        padding: '0.6rem 1rem',
        borderRadius: '8px',
        border: '1px solid',
        fontSize: '1rem',
        minWidth: '200px',
        outline: 'none',
    },
    input: {
        padding: '0.6rem 1rem',
        borderRadius: '8px',
        border: '1px solid',
        fontSize: '1rem',
        outline: 'none',
    },
    summaryStats: {
        display: 'flex',
        gap: '1rem',
    },
    summaryBadge: {
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '0.9rem',
    },
    // Card & Table
    card: {
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        overflow: 'hidden',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    cardTitle: {
        margin: 0,
        fontSize: '1.25rem',
        fontWeight: 700,
    },
    primaryBtn: {
        padding: '0.6rem 1.2rem',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
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
        padding: '1rem',
        textAlign: 'left',
        fontSize: '0.85rem',
        fontWeight: 600,
        textTransform: 'uppercase',
    },
    tr: {
        borderBottom: '1px solid',
    },
    td: {
        padding: '1rem',
        fontSize: '0.95rem',
        verticalAlign: 'middle',
    },
    studentInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontWeight: 500,
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
    },
    statusBadge: {
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.8rem',
        fontWeight: 600,
    },
    statusButtons: {
        display: 'flex',
        gap: '0.5rem',
    },
    statusBtn: {
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.1s',
    },
    // Student View Stats
    statsGrid: {
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
    },
    statCard: {
        flex: 1,
        minWidth: '200px',
        padding: '1.5rem',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    statIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        margin: 0,
        fontSize: '0.85rem',
        fontWeight: 500,
    },
    statValue: {
        margin: '0.25rem 0 0',
        fontSize: '1.5rem',
        fontWeight: 700,
    },
};

export default Attendance;
