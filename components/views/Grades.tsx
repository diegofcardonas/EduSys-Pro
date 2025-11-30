
import React, { useState, useEffect } from 'react';
import { User, Grade, Course } from '../../types';
import { grades as initialGrades, courses as initialCourses } from '../../data/mockData';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { EditIcon, TrashIcon, PlusIcon, MinusIcon, SearchIcon, XIcon, SaveIcon, TrendUpIcon, CheckCircleIcon, AlertIcon } from '../Icons';

interface GradesProps {
  currentUser: User;
  users: User[];
}

const Grades: React.FC<GradesProps> = ({ currentUser, users }) => {
  const { t } = useLanguage();
  const { colors, theme } = useTheme();
  const { addNotification } = useNotification();

  // --- State ---
  const [localGrades, setLocalGrades] = useState<Grade[]>([]);
  const [localCourses, setLocalCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  
  // Grouping State
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
      courseId: '',
      studentId: '',
      assignment: '',
      score: 0,
      date: new Date().toISOString().split('T')[0]
  });

  // --- Effects ---

  // Load Data
  useEffect(() => {
      // Load Grades
      const storedGrades = localStorage.getItem('edusys_grades');
      if (storedGrades) {
          setLocalGrades(JSON.parse(storedGrades));
      } else {
          setLocalGrades(initialGrades);
      }

      // Load Courses (to link data)
      const storedCourses = localStorage.getItem('edusys_courses');
      if (storedCourses) {
          setLocalCourses(JSON.parse(storedCourses));
      } else {
          setLocalCourses(initialCourses);
      }
  }, []);

  // Persist Grades
  useEffect(() => {
      if (localGrades.length > 0) {
          localStorage.setItem('edusys_grades', JSON.stringify(localGrades));
      }
  }, [localGrades]);

  // --- Filtering Logic ---

  // 1. Filter Courses viewable/editable by user
  const availableCourses = localCourses.filter(c => {
      if (currentUser.role === 'Administrator') return true;
      if (currentUser.role === 'Professor') return c.teacherId === currentUser.id;
      if (currentUser.role === 'Student') return c.studentIds.includes(currentUser.id);
      return false;
  });

  // 2. Filter Grades based on Role & Search
  const filteredGrades = localGrades.filter(g => {
      // Role Check
      if (currentUser.role === 'Student' && g.studentId !== currentUser.id) return false;
      if (currentUser.role === 'Professor') {
          const course = localCourses.find(c => c.id === g.courseId);
          if (!course || course.teacherId !== currentUser.id) return false;
      }

      // UI Filters
      const matchesCourse = courseFilter === 'All' || g.courseId === courseFilter;
      
      const course = localCourses.find(c => c.id === g.courseId);
      const student = users.find(u => u.id === g.studentId);
      const matchesSearch = g.assignment.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (student && student.name.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesCourse && matchesSearch;
  });

  // Group grades by Student ID
  const gradesByStudent = filteredGrades.reduce((acc, grade) => {
      if (!acc[grade.studentId]) {
          acc[grade.studentId] = [];
      }
      acc[grade.studentId].push(grade);
      return acc;
  }, {} as Record<string, Grade[]>);

  const studentIds = Object.keys(gradesByStudent);

  // --- Stats Helpers ---
  const calculateStats = () => {
      if (filteredGrades.length === 0) return { avg: 0, high: 0, low: 0 };
      const scores = filteredGrades.map(g => g.score);
      const sum = scores.reduce((a, b) => a + b, 0);
      return {
          avg: Math.round(sum / scores.length),
          high: Math.max(...scores),
          low: Math.min(...scores)
      };
  };
  const stats = calculateStats();

  // --- CRUD Handlers ---

  const handleAdd = () => {
      setEditingGrade(null);
      setFormData({
          courseId: availableCourses.length > 0 ? availableCourses[0].id : '',
          studentId: '',
          assignment: '',
          score: 0,
          date: new Date().toISOString().split('T')[0]
      });
      setIsModalOpen(true);
  };

  const handleEdit = (grade: Grade) => {
      setEditingGrade(grade);
      setFormData({
          courseId: grade.courseId,
          studentId: grade.studentId,
          assignment: grade.assignment,
          score: grade.score,
          date: grade.date
      });
      setIsModalOpen(true);
  };

  const handleDeleteClick = (gradeId: string) => {
      setDeleteConfirmation(gradeId);
  };

  const confirmDelete = () => {
      if (deleteConfirmation) {
          setLocalGrades(prev => prev.filter(g => g.id !== deleteConfirmation));
          addNotification(t('gradeDeletedSuccess'), 'success');
          setDeleteConfirmation(null);
      }
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.studentId || !formData.courseId || !formData.assignment) {
          addNotification('Please fill all required fields', 'error');
          return;
      }

      if (editingGrade) {
          // Update
          setLocalGrades(prev => prev.map(g => g.id === editingGrade.id ? { ...g, ...formData } : g));
          addNotification(t('gradeUpdatedSuccess'), 'success');
      } else {
          // Create
          const newGrade: Grade = {
              id: `g_${Date.now()}`,
              ...formData
          };
          setLocalGrades(prev => [...prev, newGrade]);
          addNotification(t('gradeCreatedSuccess'), 'success');
      }
      setIsModalOpen(false);
  };

  const toggleStudent = (studentId: string) => {
      const newSet = new Set(expandedStudents);
      if (newSet.has(studentId)) {
          newSet.delete(studentId);
      } else {
          newSet.add(studentId);
      }
      setExpandedStudents(newSet);
  };

  // --- Data Helpers for UI ---
  const getCourseName = (courseId: string) => localCourses.find(c => c.id === courseId)?.name || 'Unknown Course';
  const getStudentName = (studentId: string) => users.find(u => u.id === studentId)?.name || 'Unknown Student';

  // Get eligible students for the selected course in the form
  const eligibleStudents = formData.courseId 
      ? users.filter(u => {
          const course = localCourses.find(c => c.id === formData.courseId);
          return course && course.studentIds.includes(u.id);
      })
      : [];

  return (
    <div style={styles.container}>
        {/* Stats Row */}
        <div style={styles.statsGrid}>
            <div style={{...styles.statCard, backgroundColor: colors.card}}>
                <div style={{...styles.statIcon, backgroundColor: colors.secondaryBg, color: colors.primary}}>
                    <TrendUpIcon />
                </div>
                <div>
                    <p style={{...styles.statLabel, color: colors.textSecondary}}>{t('courseAverage')}</p>
                    <h3 style={{...styles.statValue, color: colors.text}}>{stats.avg}</h3>
                </div>
            </div>
            <div style={{...styles.statCard, backgroundColor: colors.card}}>
                <div style={{...styles.statIcon, backgroundColor: '#D1FAE5', color: '#059669'}}>
                    <CheckCircleIcon />
                </div>
                <div>
                    <p style={{...styles.statLabel, color: colors.textSecondary}}>{t('highestScore')}</p>
                    <h3 style={{...styles.statValue, color: colors.text}}>{stats.high}</h3>
                </div>
            </div>
            <div style={{...styles.statCard, backgroundColor: colors.card}}>
                <div style={{...styles.statIcon, backgroundColor: '#FEE2E2', color: '#DC2626'}}>
                    <AlertIcon />
                </div>
                <div>
                    <p style={{...styles.statLabel, color: colors.textSecondary}}>{t('lowestScore')}</p>
                    <h3 style={{...styles.statValue, color: colors.text}}>{stats.low}</h3>
                </div>
            </div>
        </div>

        {/* Toolbar */}
        <div style={{...styles.toolbar, backgroundColor: colors.card, borderBottomColor: colors.border}}>
             <div style={styles.toolbarLeft}>
                <div style={{...styles.searchContainer, backgroundColor: colors.inputBg, borderColor: colors.border}}>
                    <SearchIcon />
                    <input 
                        style={{...styles.searchInput, color: colors.text}} 
                        placeholder="Search assignments or students..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    style={{...styles.filterSelect, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                >
                    <option value="All">{t('all')} {t('courses')}</option>
                    {availableCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
             </div>
             
             {currentUser.role !== 'Student' && (
                 <div style={styles.toolbarRight}>
                    <button style={{...styles.addBtn, backgroundColor: colors.primary}} onClick={handleAdd}>
                        <PlusIcon /> {t('addGrade')}
                    </button>
                 </div>
             )}
        </div>

        {/* Table */}
        <div style={{...styles.tableContainer, backgroundColor: colors.card}}>
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{...styles.th, width: '50px', backgroundColor: colors.secondaryBg}}></th>
                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('student')}</th>
                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('average')}</th>
                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('totalAssignments')}</th>
                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentIds.length > 0 ? studentIds.map(studentId => {
                            const studentGrades = gradesByStudent[studentId];
                            const studentAvg = Math.round(studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length);
                            const isExpanded = expandedStudents.has(studentId);

                            return (
                                <React.Fragment key={studentId}>
                                    {/* Parent Row (Student Group) */}
                                    <tr style={{...styles.tr, borderBottomColor: colors.border, backgroundColor: isExpanded ? colors.secondaryBg : 'transparent'}}>
                                        <td style={styles.td}>
                                            <button 
                                                style={{...styles.iconActionBtn, color: colors.primary}}
                                                onClick={() => toggleStudent(studentId)}
                                            >
                                                {isExpanded ? <MinusIcon /> : <PlusIcon />}
                                            </button>
                                        </td>
                                        <td style={{...styles.td, color: colors.text, fontWeight: 600}}>
                                            {getStudentName(studentId)}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.scoreBadge(studentAvg)}>{studentAvg}</span>
                                        </td>
                                        <td style={{...styles.td, color: colors.text}}>{studentGrades.length}</td>
                                        <td style={styles.td}>
                                             <button 
                                                style={{...styles.viewBtn, color: colors.primary, borderColor: colors.border}}
                                                onClick={() => toggleStudent(studentId)}
                                            >
                                                {isExpanded ? 'Hide Grades' : 'View Grades'}
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Child Rows (Individual Grades) */}
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan={5} style={{padding: 0}}>
                                                <div style={{backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.2)' : '#F8FAFC', padding: '1rem'}}>
                                                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                                        <thead>
                                                            <tr>
                                                                <th style={{...styles.subTh, color: colors.textSecondary}}>{t('course')}</th>
                                                                <th style={{...styles.subTh, color: colors.textSecondary}}>{t('assignment')}</th>
                                                                <th style={{...styles.subTh, color: colors.textSecondary}}>{t('date')}</th>
                                                                <th style={{...styles.subTh, color: colors.textSecondary}}>{t('score')}</th>
                                                                {currentUser.role !== 'Student' && <th style={{...styles.subTh, color: colors.textSecondary}}>{t('actions')}</th>}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {studentGrades.map(grade => (
                                                                <tr key={grade.id} style={{borderBottom: `1px solid ${colors.border}`}}>
                                                                    <td style={{...styles.subTd, color: colors.textSecondary}}>{getCourseName(grade.courseId)}</td>
                                                                    <td style={{...styles.subTd, color: colors.text}}>{grade.assignment}</td>
                                                                    <td style={{...styles.subTd, color: colors.textSecondary}}>{grade.date}</td>
                                                                    <td style={styles.subTd}>
                                                                        <span style={{fontWeight: 600, color: grade.score >= 70 ? colors.success : colors.danger}}>
                                                                            {grade.score}
                                                                        </span>
                                                                    </td>
                                                                    {currentUser.role !== 'Student' && (
                                                                        <td style={styles.subTd}>
                                                                             <div style={{display: 'flex', gap: '0.5rem'}}>
                                                                                <button 
                                                                                    style={{...styles.iconActionBtn, color: colors.primary}} 
                                                                                    onClick={() => handleEdit(grade)}
                                                                                    title={t('editGrade')}
                                                                                >
                                                                                    <EditIcon />
                                                                                </button>
                                                                                <button 
                                                                                    style={{...styles.iconActionBtn, color: colors.danger}} 
                                                                                    onClick={() => handleDeleteClick(grade.id)}
                                                                                    title={t('deleteGrade')}
                                                                                >
                                                                                    <TrashIcon />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        }) : (
                             <tr>
                                <td colSpan={5} style={{padding: '2rem', textAlign: 'center', color: colors.textSecondary}}>
                                    {t('noGradesFound')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
            <div style={styles.modalOverlay}>
                <div style={{...styles.modalContent, backgroundColor: colors.card}}>
                    <div style={styles.modalHeader}>
                        <h3 style={{...styles.modalTitle, color: colors.text}}>{editingGrade ? t('editGrade') : t('addGrade')}</h3>
                        <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>
                            <XIcon />
                        </button>
                    </div>
                    <form onSubmit={handleSave} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={{...styles.label, color: colors.textSecondary}}>{t('course')}</label>
                            <select 
                                style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                value={formData.courseId}
                                onChange={e => setFormData({...formData, courseId: e.target.value, studentId: ''})} // Reset student on course change
                                required
                                disabled={!!editingGrade} // Disable changing course on edit for simplicity
                            >
                                <option value="" disabled>{t('selectCourse')}</option>
                                {availableCourses.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={{...styles.label, color: colors.textSecondary}}>{t('student')}</label>
                            <select 
                                style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                value={formData.studentId}
                                onChange={e => setFormData({...formData, studentId: e.target.value})}
                                required
                                disabled={!formData.courseId}
                            >
                                <option value="" disabled>{t('selectStudent')}</option>
                                {eligibleStudents.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={{...styles.label, color: colors.textSecondary}}>{t('assignment')}</label>
                            <input 
                                style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                value={formData.assignment}
                                onChange={e => setFormData({...formData, assignment: e.target.value})}
                                placeholder="e.g. Midterm Exam"
                                required
                            />
                        </div>

                        <div style={styles.row}>
                            <div style={styles.formGroup}>
                                <label style={{...styles.label, color: colors.textSecondary}}>{t('score')} (0-100)</label>
                                <input 
                                    type="number"
                                    min="0"
                                    max="100"
                                    style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                    value={formData.score}
                                    onChange={e => setFormData({...formData, score: parseInt(e.target.value)})}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{...styles.label, color: colors.textSecondary}}>{t('date')}</label>
                                <input 
                                    type="date"
                                    style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                    value={formData.date}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.modalActions}>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>
                                {t('cancel')}
                            </button>
                            <button type="submit" style={{...styles.saveBtn, backgroundColor: colors.primary}}>
                                <SaveIcon /> {t('saveChanges')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirmation && (
             <div style={styles.modalOverlay}>
                <div style={{...styles.confirmContent, backgroundColor: colors.card}}>
                    <h3 style={{...styles.confirmTitle, color: colors.text}}>{t('deleteGrade')}</h3>
                    <p style={{...styles.confirmText, color: colors.textSecondary}}>
                        {t('confirmDeleteGrade')}
                    </p>
                    <div style={styles.modalActions}>
                        <button style={styles.cancelBtn} onClick={() => setDeleteConfirmation(null)}>
                            {t('cancel')}
                        </button>
                        <button style={{...styles.deleteBtn, backgroundColor: colors.danger}} onClick={confirmDelete}>
                            {t('deleteGrade')}
                        </button>
                    </div>
                </div>
             </div>
        )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties | ((arg: any) => React.CSSProperties) } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    // Stats
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
    // Toolbar
    toolbar: {
        padding: '1rem',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        borderBottom: '1px solid',
    },
    toolbarLeft: {
        display: 'flex',
        gap: '1rem',
        flex: 1,
    },
    toolbarRight: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
    },
    searchContainer: {
        display: 'flex',
        alignItems: 'center',
        border: '1px solid',
        borderRadius: '8px',
        padding: '0.6rem 1rem',
        gap: '0.5rem',
        flex: 1,
        maxWidth: '300px',
    },
    searchInput: {
        border: 'none',
        background: 'transparent',
        outline: 'none',
        fontSize: '0.95rem',
        width: '100%',
    },
    filterSelect: {
        padding: '0 1rem',
        borderRadius: '8px',
        border: '1px solid',
        outline: 'none',
        cursor: 'pointer',
        minWidth: '150px',
    },
    addBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
    },
    // Table
    tableContainer: {
        borderRadius: '12px',
        overflow: 'hidden',
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
        padding: '1rem',
        textAlign: 'left',
        fontSize: '0.875rem',
        fontWeight: 600,
        textTransform: 'uppercase',
    },
    tr: {
        borderBottom: '1px solid',
    },
    td: {
        padding: '1rem',
    },
    subTh: {
        padding: '0.75rem 1rem',
        textAlign: 'left',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        fontWeight: 600,
    },
    subTd: {
        padding: '0.75rem 1rem',
        fontSize: '0.9rem',
    },
    scoreBadge: (score: number) => ({
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '6px',
        fontWeight: 600,
        backgroundColor: score >= 90 ? '#ECFDF5' : score >= 70 ? '#EFF6FF' : '#FEF2F2',
        color: score >= 90 ? '#059669' : score >= 70 ? '#2563EB' : '#DC2626',
    }),
    iconActionBtn: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '0.25rem',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewBtn: {
        background: 'transparent',
        border: '1px solid',
        padding: '0.25rem 0.75rem',
        borderRadius: '6px',
        fontSize: '0.8rem',
        fontWeight: 600,
        cursor: 'pointer',
    },
    // Modal
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
    },
    modalContent: {
        padding: '2rem',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    modalTitle: {
        margin: 0,
        fontSize: '1.25rem',
        fontWeight: 700,
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        opacity: 0.6,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    row: {
        display: 'flex',
        gap: '1rem',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: 600,
    },
    input: {
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid',
        fontSize: '1rem',
        outline: 'none',
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        marginTop: '1rem',
    },
    cancelBtn: {
        padding: '0.75rem 1rem',
        border: '1px solid #CBD5E1',
        borderRadius: '8px',
        background: 'transparent',
        color: '#64748B',
        fontWeight: 600,
        cursor: 'pointer',
    },
    saveBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
    },
    confirmContent: {
        padding: '2rem',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
    },
    confirmTitle: {
        margin: '0 0 1rem 0',
    },
    confirmText: {
        marginBottom: '2rem',
    },
    deleteBtn: {
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: 'none',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
    },
};

export default Grades;
