

import React, { useState } from 'react';
import { Student } from '../../types';
import { courses, grades, attendance, teachers, timetable } from '../../data/mockData';
import { CoursesIcon, StarIcon, AttendanceIcon, TrendUpIcon, ReportIcon, MailIcon, TimetableIcon, EditIcon, SaveIcon, XIcon, DollarIcon, AlertIcon, CameraIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';

interface StudentProfileProps {
  student: Student;
}

type Tab = 'overview' | 'academic' | 'attendance' | 'schedule';

const StudentProfile: React.FC<StudentProfileProps> = ({ student }) => {
  const { t } = useLanguage();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  
  // Enhanced Editable State
  const [formData, setFormData] = useState({
      name: student.name,
      email: student.email,
      parentContact: student.parentContact,
      gradeLevel: student.gradeLevel,
      phoneNumber: student.phoneNumber || '',
      address: student.address || '',
      avatarUrl: student.avatarUrl,
      bio: 'Aspiring student with a passion for science and technology. Member of the debate club and science fair team.' // Mock Bio
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const url = URL.createObjectURL(e.target.files[0]);
          setFormData(prev => ({ ...prev, avatarUrl: url }));
      }
  };

  const handleSave = () => {
      setIsEditing(false);
      // Update local object (Mock persistence)
      student.name = formData.name;
      student.email = formData.email;
      student.parentContact = formData.parentContact;
      student.gradeLevel = Number(formData.gradeLevel);
      student.phoneNumber = formData.phoneNumber;
      student.address = formData.address;
      student.avatarUrl = formData.avatarUrl;
      
      addNotification(t('userUpdatedSuccess'), 'success');
  };

  const handleCancel = () => {
      setFormData({
          name: student.name,
          email: student.email,
          parentContact: student.parentContact,
          gradeLevel: student.gradeLevel,
          phoneNumber: student.phoneNumber || '',
          address: student.address || '',
          avatarUrl: student.avatarUrl,
          bio: formData.bio // Keep bio as is for now since it's not in student type
      });
      setIsEditing(false);
  };

  const studentCourses = courses.filter(c => c.studentIds.includes(student.id));
  const studentGrades = grades.filter(g => g.studentId === student.id);
  const studentAttendance = attendance.filter(a => a.studentId === student.id);
  const studentTimetable = timetable.filter(entry => studentCourses.some(c => c.id === entry.courseId));

  const getTeacherName = (teacherId: string) => teachers.find(t => t.id === teacherId)?.name || 'N/A';
  const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.name || 'N/A';

  // Metrics Calculation
  const averageScore = studentGrades.length > 0 
    ? Math.round(studentGrades.reduce((acc, curr) => acc + curr.score, 0) / studentGrades.length) 
    : 0;

  const totalAttendance = studentAttendance.length;
  const presentOrLate = studentAttendance.filter(a => a.status === 'Present' || a.status === 'Late' || a.status === 'Excused').length;
  const attendanceRate = totalAttendance > 0 ? Math.round((presentOrLate / totalAttendance) * 100) : 100;

  const isAtRisk = averageScore < 70 || attendanceRate < 80;

  const getScoreColor = (score: number) => {
      if (score >= 90) return '#10B981'; // Emerald 500
      if (score >= 80) return '#3B82F6'; // Blue 500
      if (score >= 70) return '#F59E0B'; // Amber 500
      return '#EF4444'; // Red 500
  };

  const getPerformanceLabel = (score: number) => {
      if (score >= 90) return t('excellent');
      if (score >= 75) return t('good');
      return t('needsImprovement');
  };

  const renderOverview = () => (
      <div style={styles.tabContentGrid}>
          {/* Stats Row */}
          <div style={styles.statsRow}>
              <div style={styles.statCard}>
                  <div style={styles.statIconBg('#DBEAFE')}><StarIcon /></div>
                  <div>
                      <p style={styles.statLabel}>{t('averageScore')}</p>
                      <p style={styles.statValue}>{averageScore}</p>
                  </div>
              </div>
              <div style={styles.statCard}>
                  <div style={styles.statIconBg('#D1FAE5')}><AttendanceIcon /></div>
                  <div>
                      <p style={styles.statLabel}>{t('attendanceRate')}</p>
                      <p style={styles.statValue}>{attendanceRate}%</p>
                  </div>
              </div>
              <div style={styles.statCard}>
                  <div style={styles.statIconBg('#F3E8FF')}><CoursesIcon /></div>
                  <div>
                      <p style={styles.statLabel}>{t('creditsEarned')}</p>
                      <p style={styles.statValue}>{studentCourses.length}</p>
                  </div>
              </div>
          </div>

          {/* Bio / About Section - Editable */}
          <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>{t('bio')}</h3>
                  {isEditing && <span style={styles.editableBadge}>{t('editUser')}</span>}
              </div>
              {isEditing ? (
                  <textarea 
                    style={styles.bioInput}
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder={t('bioPlaceholder')}
                    rows={4}
                  />
              ) : (
                  <p style={styles.bioText}>{formData.bio}</p>
              )}
          </div>

          <div style={styles.twoColumnGrid}>
            {/* Academic Progress Summary */}
            <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                    <h3 style={styles.sectionTitle}>{t('academicProgress')}</h3>
                    <span style={styles.badge(averageScore)}>{getPerformanceLabel(averageScore)}</span>
                </div>
                <div style={styles.progressList}>
                    {studentCourses.slice(0, 3).map(course => {
                        const courseGrades = studentGrades.filter(g => g.courseId === course.id);
                        const courseAvg = courseGrades.length > 0 
                            ? Math.round(courseGrades.reduce((a, b) => a + b.score, 0) / courseGrades.length)
                            : 0;
                        
                        return (
                            <div key={course.id} style={styles.progressItem}>
                                <div style={styles.progressInfo}>
                                    <span style={styles.progressName}>{course.name}</span>
                                    <span style={styles.progressValue}>{courseAvg > 0 ? `${courseAvg}%` : 'N/A'}</span>
                                </div>
                                <div style={styles.progressBarContainer}>
                                    <div style={{
                                        ...styles.progressBarFill, 
                                        width: `${courseAvg}%`,
                                        backgroundColor: getScoreColor(courseAvg)
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Admin & Finance Column */}
            <div style={styles.adminColumn}>
                {/* Financial Status */}
                <div style={styles.sectionCard}>
                     <div style={styles.sectionHeader}>
                        <h3 style={styles.sectionTitle}><DollarIcon /> {t('financialStatus')}</h3>
                    </div>
                    <div style={styles.financeStatus}>
                        <div style={styles.financeBadge}>
                            {t('pending')}
                        </div>
                        <p style={styles.financeDate}>{t('tuitionDue', { date: 'Nov 30, 2023' })}</p>
                    </div>
                </div>

                {/* Admin Notes */}
                <div style={styles.sectionCard}>
                     <div style={styles.sectionHeader}>
                        <h3 style={styles.sectionTitle}><ReportIcon /> {t('adminNotes')}</h3>
                        <button style={styles.iconButton} title={t('addNote')}>+</button>
                    </div>
                    <div style={styles.notesList}>
                        <div style={styles.noteItem}>
                            <p style={styles.noteMeta}>Oct 12, 2023 - System Admin</p>
                            <p style={styles.noteText}>{t('behavioralNote')}: Disruptive in Lab A.</p>
                        </div>
                        <div style={styles.noteItem}>
                            <p style={styles.noteMeta}>Sep 05, 2023 - Registrar</p>
                            <p style={styles.noteText}>Documents verified.</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
      </div>
  );

  const renderAcademic = () => (
      <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>{t('grades')} & {t('courses')}</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{t('course')}</th>
                  <th style={styles.th}>{t('assignment')}</th>
                  <th style={styles.th}>{t('date')}</th>
                  <th style={styles.th}>{t('score')}</th>
                </tr>
              </thead>
              <tbody>
                {studentGrades.map(grade => (
                  <tr key={grade.id} style={styles.tr}>
                    <td style={styles.td}>
                        <div style={styles.tdBold}>{getCourseName(grade.courseId)}</div>
                        <div style={styles.tdSub}>{t('taughtBy', { name: getTeacherName(courses.find(c => c.id === grade.courseId)?.teacherId || '') })}</div>
                    </td>
                    <td style={styles.td}>{grade.assignment}</td>
                    <td style={styles.td}>{grade.date}</td>
                    <td style={styles.td}>
                        <span style={styles.scoreBadge(grade.score)}>{grade.score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
  );

  const renderAttendance = () => (
    <div style={styles.sectionCard}>
      <h3 style={styles.sectionTitle}>{t('attendance')}</h3>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{t('date')}</th>
              <th style={styles.th}>{t('course')}</th>
              <th style={styles.th}>{t('status')}</th>
            </tr>
          </thead>
          <tbody>
            {studentAttendance.map(record => (
              <tr key={record.id} style={styles.tr}>
                <td style={styles.td}>{record.date}</td>
                <td style={styles.td}>{getCourseName(record.courseId)}</td>
                <td style={styles.td}><span style={styles.status(record.status)}>{t(record.status.toLowerCase())}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

    const renderSchedule = () => (
        <div style={styles.sectionCard}>
             <h3 style={styles.sectionTitle}>{t('timetable')}</h3>
             <div style={styles.scheduleList}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                    const dayClasses = studentTimetable.filter(t => t.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime));
                    if (dayClasses.length === 0) return null;
                    return (
                        <div key={day} style={styles.dayGroup}>
                            <h4 style={styles.dayTitle}>{t(day.toLowerCase())}</h4>
                            {dayClasses.map(cls => (
                                <div key={cls.id} style={styles.classItem}>
                                    <div style={styles.classTime}>{cls.startTime} - {cls.endTime}</div>
                                    <div style={styles.classDetails}>
                                        <div style={styles.className}>{getCourseName(cls.courseId)}</div>
                                        <div style={styles.classRoom}>{cls.room}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                })}
             </div>
        </div>
    );

  return (
    <div style={styles.layoutContainer}>
      {/* Left Column: Profile Card (Sidebar) */}
      <div style={styles.profileSidebar}>
          <div style={styles.profileCard}>
            {/* Risk Alert */}
            {isAtRisk && !isEditing && (
                <div style={styles.riskAlert}>
                    <AlertIcon /> {t('atRisk')}
                </div>
            )}

            <div style={styles.avatarContainer}>
                <img
                    src={formData.avatarUrl || `https://i.pravatar.cc/150?u=${student.id}`}
                    alt={`${formData.name}'s avatar`}
                    style={styles.avatar}
                />
                {!isEditing && <span style={styles.activeStatus}></span>}
                
                {/* Editable Avatar Overlay */}
                {isEditing && (
                    <label style={styles.avatarOverlay}>
                        <CameraIcon />
                        <input type="file" style={{display: 'none'}} accept="image/*" onChange={handleImageUpload} />
                    </label>
                )}
            </div>

            {/* Name & ID */}
            {isEditing ? (
                <input 
                    style={{...styles.editInput, ...styles.nameInput}}
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('name')}
                />
            ) : (
                <h2 style={styles.studentName}>{formData.name}</h2>
            )}
            <p style={styles.studentId}>{student.studentId}</p>
            
            <div style={styles.infoGroup}>
                <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>{t('email')}</span>
                    {isEditing ? (
                        <input 
                            style={styles.editInput}
                            name="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                        />
                    ) : (
                        <span style={styles.infoValue}>{formData.email}</span>
                    )}
                </div>
                
                <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>{t('phone')}</span>
                     {isEditing ? (
                        <input 
                            style={styles.editInput}
                            name="phoneNumber" 
                            value={formData.phoneNumber} 
                            onChange={handleInputChange}
                            placeholder="+1 (555) 000-0000" 
                        />
                    ) : (
                        <span style={styles.infoValue}>{formData.phoneNumber || '-'}</span>
                    )}
                </div>

                <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>{t('gradeLevel')}</span>
                     {isEditing ? (
                        <input 
                            style={styles.editInput}
                            name="gradeLevel"
                            type="number"
                            value={formData.gradeLevel} 
                            onChange={handleInputChange} 
                        />
                    ) : (
                        <span style={styles.infoValue}>{formData.gradeLevel}th Grade</span>
                    )}
                </div>
                <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>{t('parentContact')}</span>
                     {isEditing ? (
                        <input 
                            style={styles.editInput}
                            name="parentContact" 
                            value={formData.parentContact} 
                            onChange={handleInputChange} 
                        />
                    ) : (
                        <span style={styles.infoValue}>{formData.parentContact}</span>
                    )}
                </div>
                 <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>{t('address')}</span>
                     {isEditing ? (
                        <input 
                            style={styles.editInput}
                            name="address" 
                            value={formData.address} 
                            onChange={handleInputChange}
                            placeholder="123 Main St..." 
                        />
                    ) : (
                        <span style={styles.infoValue}>{formData.address || '-'}</span>
                    )}
                </div>
            </div>

            <div style={styles.actionButtons}>
                {!isEditing ? (
                    <>
                        <button style={styles.editButton} onClick={() => setIsEditing(true)}>
                            <EditIcon /> {t('editProfile')}
                        </button>
                        <button style={styles.secondaryButton}>
                            <MailIcon /> {t('sendMessage')}
                        </button>
                        <button style={styles.tertiaryButton}>
                            <ReportIcon /> {t('generateReport')}
                        </button>
                    </>
                ) : (
                    <div style={styles.editActions}>
                        <button style={styles.saveButton} onClick={handleSave}>
                            <SaveIcon /> {t('saveChanges')}
                        </button>
                        <button style={styles.cancelButton} onClick={handleCancel}>
                            <XIcon /> {t('cancel')}
                        </button>
                    </div>
                )}
            </div>
          </div>
      </div>

      {/* Right Column: Content Area */}
      <div style={styles.contentArea}>
        {/* Tabs */}
        <div style={styles.tabsContainer}>
            <button 
                style={activeTab === 'overview' ? {...styles.tab, ...styles.activeTab} : styles.tab}
                onClick={() => setActiveTab('overview')}
            >
                <TrendUpIcon /> {t('overview')}
            </button>
            <button 
                style={activeTab === 'academic' ? {...styles.tab, ...styles.activeTab} : styles.tab}
                onClick={() => setActiveTab('academic')}
            >
                <CoursesIcon /> {t('academic')}
            </button>
            <button 
                style={activeTab === 'attendance' ? {...styles.tab, ...styles.activeTab} : styles.tab}
                onClick={() => setActiveTab('attendance')}
            >
                <AttendanceIcon /> {t('attendance')}
            </button>
            <button 
                style={activeTab === 'schedule' ? {...styles.tab, ...styles.activeTab} : styles.tab}
                onClick={() => setActiveTab('schedule')}
            >
                <TimetableIcon /> {t('schedule')}
            </button>
        </div>

        {/* Content */}
        <div style={styles.tabContent}>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'academic' && renderAcademic()}
            {activeTab === 'attendance' && renderAttendance()}
            {activeTab === 'schedule' && renderSchedule()}
        </div>
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

const styles: { [key: string]: React.CSSProperties | ((arg: any) => React.CSSProperties) } = {
    layoutContainer: {
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    profileSidebar: {
        flex: '0 0 320px',
        width: '100%',
    },
    contentArea: {
        flex: 1,
        minWidth: '0', // Prevents grid blowout
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        textAlign: 'center',
        position: 'sticky',
        top: '2rem',
    },
    riskAlert: {
        backgroundColor: '#FEF2F2',
        color: '#DC2626',
        padding: '0.5rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontWeight: 600,
        fontSize: '0.9rem',
    },
    avatarContainer: {
        position: 'relative',
        display: 'inline-block',
        marginBottom: '1rem',
    },
    avatar: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '4px solid #F8FAFC',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    },
    activeStatus: {
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        width: '16px',
        height: '16px',
        backgroundColor: '#10B981',
        borderRadius: '50%',
        border: '2px solid #FFFFFF',
    },
    avatarOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    studentName: {
        margin: '0 0 0.5rem 0',
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#1E293B',
    },
    nameInput: {
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '1.25rem',
        marginBottom: '0.5rem',
    },
    studentId: {
        margin: 0,
        color: '#64748B',
        fontWeight: 500,
        fontSize: '0.9rem',
        marginBottom: '1.5rem',
    },
    infoGroup: {
        textAlign: 'left',
        borderTop: '1px solid #F1F5F9',
        borderBottom: '1px solid #F1F5F9',
        padding: '1.5rem 0',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    infoRow: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    infoLabel: {
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        color: '#94A3B8',
        fontWeight: 600,
        letterSpacing: '0.05em',
    },
    infoValue: {
        fontSize: '0.95rem',
        color: '#334155',
        fontWeight: 500,
        wordBreak: 'break-all',
    },
    editInput: {
        padding: '0.5rem',
        borderRadius: '6px',
        border: '1px solid #94A3B8',
        fontSize: '0.9rem',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#F8FAFC',
    },
    bioInput: {
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid #CBD5E1',
        fontSize: '0.95rem',
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        resize: 'vertical',
        backgroundColor: '#F8FAFC',
    },
    bioText: {
        margin: 0,
        fontSize: '0.95rem',
        color: '#334155',
        lineHeight: 1.6,
    },
    editableBadge: {
        fontSize: '0.7rem',
        backgroundColor: '#DBEAFE',
        color: '#1E40AF',
        padding: '2px 6px',
        borderRadius: '4px',
        fontWeight: 600,
    },
    actionButtons: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    editActions: {
        display: 'flex',
        gap: '0.5rem',
    },
    editButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#004AAD',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    saveButton: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.75rem',
        backgroundColor: '#10B981',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    cancelButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
        backgroundColor: '#F1F5F9',
        color: '#64748B',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    secondaryButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#EFF6FF',
        color: '#1D4ED8',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    tertiaryButton: {
         display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#F8FAFC',
        color: '#475569',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    tabsContainer: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: '1px',
        overflowX: 'auto',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '2px solid transparent',
        color: '#64748B',
        fontWeight: 500,
        cursor: 'pointer',
        fontSize: '0.95rem',
        whiteSpace: 'nowrap',
    },
    activeTab: {
        color: '#004AAD',
        borderBottom: '2px solid #004AAD',
    },
    tabContentGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    twoColumnGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
    },
    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
    },
    statIconBg: (color: string) => ({
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: color,
        color: '#1E293B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }),
    statLabel: {
        margin: 0,
        fontSize: '0.85rem',
        color: '#64748B',
    },
    statValue: {
        margin: '0.25rem 0 0',
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#1E293B',
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        height: '100%',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    sectionTitle: {
        margin: 0,
        fontSize: '1.1rem',
        fontWeight: 600,
        color: '#1E293B',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    badge: (score: number) => ({
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.85rem',
        fontWeight: 600,
        backgroundColor: score >= 90 ? '#D1FAE5' : score >= 75 ? '#DBEAFE' : '#FEF3C7',
        color: score >= 90 ? '#065F46' : score >= 75 ? '#1E40AF' : '#92400E',
    }),
    progressList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
    },
    progressItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    progressInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.9rem',
        fontWeight: 500,
        color: '#334155',
    },
    progressBarContainer: {
        width: '100%',
        height: '8px',
        backgroundColor: '#F1F5F9',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: '4px',
        transition: 'width 0.5s ease-in-out',
    },
    // Admin Column Styles
    adminColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    financeStatus: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#FFF7ED',
        borderRadius: '8px',
        border: '1px solid #FFEDD5',
    },
    financeBadge: {
        backgroundColor: '#F97316',
        color: '#FFFFFF',
        padding: '0.5rem 1.5rem',
        borderRadius: '999px',
        fontWeight: 700,
        fontSize: '1rem',
    },
    financeDate: {
        margin: 0,
        color: '#9A3412',
        fontSize: '0.9rem',
        fontWeight: 500,
    },
    iconButton: {
        background: 'none',
        border: '1px solid #E2E8F0',
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#64748B',
    },
    notesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    noteItem: {
        borderLeft: '3px solid #E2E8F0',
        paddingLeft: '1rem',
    },
    noteMeta: {
        margin: '0 0 0.25rem 0',
        fontSize: '0.75rem',
        color: '#94A3B8',
        fontWeight: 600,
        textTransform: 'uppercase',
    },
    noteText: {
        margin: 0,
        fontSize: '0.9rem',
        color: '#334155',
        lineHeight: 1.5,
    },
    // Table Styles
    tableWrapper: {
        overflowX: 'auto',
        marginTop: '1rem',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '1rem',
        textAlign: 'left',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#64748B',
        backgroundColor: '#F8FAFC',
        borderBottom: '1px solid #E2E8F0',
    },
    tr: {
        borderBottom: '1px solid #F1F5F9',
    },
    td: {
        padding: '1rem',
        color: '#334155',
        fontSize: '0.95rem',
    },
    tdBold: {
        fontWeight: 600,
        color: '#1E293B',
    },
    tdSub: {
        fontSize: '0.8rem',
        color: '#94A3B8',
        marginTop: '0.25rem',
    },
    scoreBadge: (score: number) => ({
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '6px',
        fontWeight: 600,
        backgroundColor: score >= 90 ? '#ECFDF5' : score >= 70 ? '#EFF6FF' : '#FEF2F2',
        color: score >= 90 ? '#059669' : score >= 70 ? '#2563EB' : '#DC2626',
    }),
    status: (status: string) => ({
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontWeight: 500,
        fontSize: '0.8rem',
        ...statusColors[status as keyof typeof statusColors],
    }),
    // Schedule Styles
    scheduleList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        marginTop: '1rem',
    },
    dayGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    dayTitle: {
        margin: 0,
        fontSize: '0.9rem',
        fontWeight: 700,
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    classItem: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: '8px',
        padding: '0.75rem',
        borderLeft: '4px solid #004AAD',
    },
    classTime: {
        fontWeight: 600,
        color: '#1E293B',
        minWidth: '100px',
    },
    classDetails: {
        flex: 1,
    },
    className: {
        fontWeight: 600,
        color: '#334155',
    },
    classRoom: {
        fontSize: '0.85rem',
        color: '#64748B',
    }
};

export default StudentProfile;