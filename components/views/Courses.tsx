


import React, { useState, useEffect } from 'react';
import { courses as initialCourses } from '../../data/mockData';
import { User, Teacher, Course } from '../../types';
import { SearchIcon, PlusIcon, LayoutGridIcon, ListIcon, CoursesIcon, CheckCircleIcon, UsersIcon, EditIcon, TrashIcon, XIcon, SaveIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';

interface CoursesProps {
    users: User[];
}

const Courses: React.FC<CoursesProps> = ({ users }) => {
    const { t } = useLanguage();
    const { colors, theme } = useTheme();
    const { addNotification } = useNotification();
    
    // State for Data
    const [localCourses, setLocalCourses] = useState<Course[]>([]);
    
    // State for filters and view mode
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // State for Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        teacherId: '',
        description: ''
    });

    // Initialize Courses from LocalStorage
    useEffect(() => {
        const storedCourses = localStorage.getItem('edusys_courses');
        if (storedCourses) {
            try {
                setLocalCourses(JSON.parse(storedCourses));
            } catch (e) {
                console.error("Error parsing courses", e);
                setLocalCourses(initialCourses);
            }
        } else {
            setLocalCourses(initialCourses);
        }
    }, []);

    // Sync to LocalStorage
    useEffect(() => {
        if (localCourses.length > 0) {
            localStorage.setItem('edusys_courses', JSON.stringify(localCourses));
        }
    }, [localCourses]);

    // Filter only professors from the global user list for the Dropdown
    const teachers = users.filter(u => u.role === 'Professor') as Teacher[];

    // Enrich courses with teacher data using the dynamic list of users
    const enrichedCourses = localCourses.map(course => {
        const teacher = teachers.find(t => t.id === course.teacherId);
        return {
            ...course,
            teacherName: teacher?.name || 'Unassigned',
            department: teacher?.department || 'General',
            teacherAvatar: teacher?.avatarUrl,
            studentCount: course.studentIds?.length || 0
        };
    });

    // Filter Logic
    const filteredCourses = enrichedCourses.filter(course => {
        const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              course.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = filterDepartment === 'All' || course.department === filterDepartment;
        return matchesSearch && matchesDept;
    });

    // Derived Stats
    const totalCourses = enrichedCourses.length;
    const totalStudents = enrichedCourses.reduce((acc, c) => acc + c.studentCount, 0);
    const avgClassSize = totalCourses > 0 ? Math.round(totalStudents / totalCourses) : 0;

    // Extract unique departments
    const departments = ['All', ...new Set(enrichedCourses.map(c => c.department))];

    // --- CRUD Handlers ---

    const handleAddCourse = () => {
        setEditingCourse(null);
        setFormData({ name: '', code: '', teacherId: '', description: '' });
        setIsModalOpen(true);
    };

    const handleEditCourse = (course: Course) => {
        setEditingCourse(course);
        setFormData({
            name: course.name,
            code: course.code,
            teacherId: course.teacherId,
            description: course.description
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (courseId: string) => {
        setDeleteConfirmation(courseId);
    };

    const confirmDelete = () => {
        if (deleteConfirmation) {
            setLocalCourses(prev => prev.filter(c => c.id !== deleteConfirmation));
            addNotification(t('courseDeletedSuccess'), 'success');
            setDeleteConfirmation(null);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.code) {
            addNotification(t('nameRequired'), 'error'); // Reuse existing translation or add new
            return;
        }

        if (editingCourse) {
            // Update
            setLocalCourses(prev => prev.map(c => c.id === editingCourse.id ? { ...c, ...formData, studentIds: c.studentIds } : c));
            addNotification(t('courseUpdatedSuccess'), 'success');
        } else {
            // Create
            const newCourse: Course = {
                id: `c_${Date.now()}`,
                name: formData.name,
                code: formData.code,
                teacherId: formData.teacherId,
                description: formData.description,
                studentIds: [] // New courses start empty
            };
            setLocalCourses(prev => [...prev, newCourse]);
            addNotification(t('courseCreatedSuccess'), 'success');
        }
        setIsModalOpen(false);
    };

    // --- Render Helpers ---
    
    const renderStats = () => (
        <div style={styles.statsGrid}>
            <div style={{...styles.statCard, backgroundColor: colors.card}}>
                <div style={{...styles.statIcon, backgroundColor: colors.secondaryBg, color: colors.primary}}>
                    <CoursesIcon />
                </div>
                <div>
                    <p style={{...styles.statLabel, color: colors.textSecondary}}>{t('totalCourses')}</p>
                    <h3 style={{...styles.statValue, color: colors.text}}>{totalCourses}</h3>
                </div>
            </div>
            <div style={{...styles.statCard, backgroundColor: colors.card}}>
                <div style={{...styles.statIcon, backgroundColor: '#D1FAE5', color: '#059669'}}>
                    <UsersIcon />
                </div>
                <div>
                    <p style={{...styles.statLabel, color: colors.textSecondary}}>{t('activeStudents')}</p>
                    <h3 style={{...styles.statValue, color: colors.text}}>{totalStudents}</h3>
                </div>
            </div>
            <div style={{...styles.statCard, backgroundColor: colors.card}}>
                <div style={{...styles.statIcon, backgroundColor: '#DBEAFE', color: '#2563EB'}}>
                    <CheckCircleIcon />
                </div>
                <div>
                    <p style={{...styles.statLabel, color: colors.textSecondary}}>{t('avgClassSize')}</p>
                    <h3 style={{...styles.statValue, color: colors.text}}>{avgClassSize}</h3>
                </div>
            </div>
        </div>
    );

    const renderToolbar = () => (
        <div style={{...styles.toolbar, backgroundColor: colors.card, borderBottomColor: colors.border}}>
             <div style={styles.toolbarLeft}>
                <div style={{...styles.searchContainer, backgroundColor: colors.inputBg, borderColor: colors.border}}>
                    <SearchIcon />
                    <input 
                        style={{...styles.searchInput, color: colors.text}} 
                        placeholder={t('searchCourses')} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    style={{...styles.filterSelect, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                >
                    {departments.map(dept => (
                        <option key={dept} value={dept}>{dept === 'All' ? t('departmentFilter') : dept}</option>
                    ))}
                </select>
             </div>
             
             <div style={styles.toolbarRight}>
                <div style={{...styles.viewToggle, backgroundColor: colors.secondaryBg}}>
                    <button 
                        style={{...styles.toggleBtn, backgroundColor: viewMode === 'grid' ? colors.card : 'transparent', color: viewMode === 'grid' ? colors.primary : colors.textSecondary}}
                        onClick={() => setViewMode('grid')}
                    >
                        <LayoutGridIcon />
                    </button>
                    <button 
                        style={{...styles.toggleBtn, backgroundColor: viewMode === 'list' ? colors.card : 'transparent', color: viewMode === 'list' ? colors.primary : colors.textSecondary}}
                        onClick={() => setViewMode('list')}
                    >
                        <ListIcon />
                    </button>
                </div>
                <button style={{...styles.addBtn, backgroundColor: colors.primary}} onClick={handleAddCourse}>
                    <PlusIcon /> {t('createCourse')}
                </button>
             </div>
        </div>
    );

    const renderGridView = () => (
        <div style={styles.grid}>
            {filteredCourses.map(course => (
                <div key={course.id} style={{...styles.card, backgroundColor: colors.card}}>
                    <div style={styles.cardHeader}>
                         <span style={{...styles.deptBadge, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>
                             {course.department}
                         </span>
                         <div style={styles.cardActions}>
                             <button 
                                style={{...styles.iconActionBtn, color: colors.primary}} 
                                onClick={(e) => { e.stopPropagation(); handleEditCourse(course); }}
                             >
                                 <EditIcon />
                             </button>
                             <button 
                                style={{...styles.iconActionBtn, color: colors.danger}} 
                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(course.id); }}
                             >
                                 <TrashIcon />
                             </button>
                         </div>
                    </div>
                    
                    <div style={styles.cardBody}>
                        <h3 style={{...styles.cardTitle, color: colors.text}}>{course.name}</h3>
                        <p style={{...styles.cardCode, color: colors.textSecondary}}>{course.code}</p>
                        <p style={{...styles.cardDesc, color: colors.textSecondary}}>{course.description}</p>
                        
                        <div style={styles.progressWrapper}>
                             <div style={styles.progressLabel}>
                                 <span>Capacity</span>
                                 <span>{course.studentCount}/30</span>
                             </div>
                             <div style={styles.progressBarBg}>
                                 <div style={{...styles.progressBarFill, width: `${Math.min((course.studentCount/30)*100, 100)}%`, backgroundColor: colors.primary}}></div>
                             </div>
                        </div>
                    </div>

                    <div style={{...styles.cardFooter, borderTopColor: colors.border}}>
                        <div style={styles.teacherInfo}>
                            <img 
                                src={course.teacherAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.teacherName)}`} 
                                alt={course.teacherName} 
                                style={styles.teacherAvatar} 
                            />
                            <div style={styles.teacherDetails}>
                                <span style={{...styles.teacherLabel, color: colors.textSecondary}}>Professor</span>
                                <span style={{...styles.teacherName, color: colors.text}}>{course.teacherName}</span>
                            </div>
                        </div>
                        <button style={{...styles.viewBtn, color: colors.primary, borderColor: colors.border}}>
                            {t('viewCourseDetails')}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderListView = () => (
        <div style={{...styles.listContainer, backgroundColor: colors.card}}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('course')}</th>
                        <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('courseCode')}</th>
                        <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('departmentLabel')}</th>
                        <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('professor')}</th>
                        <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('studentsLabel')}</th>
                        <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCourses.map(course => (
                        <tr key={course.id} style={{...styles.tr, borderBottomColor: colors.border}}>
                            <td style={{...styles.td, color: colors.text}}>
                                <span style={styles.listName}>{course.name}</span>
                            </td>
                            <td style={{...styles.td, color: colors.textSecondary}}>{course.code}</td>
                            <td style={{...styles.td, color: colors.textSecondary}}>
                                <span style={{...styles.deptBadge, backgroundColor: colors.secondaryBg, fontSize: '0.75rem'}}>{course.department}</span>
                            </td>
                            <td style={styles.td}>
                                <div style={styles.teacherInfoSmall}>
                                     <img src={course.teacherAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.teacherName)}`} style={styles.avatarSmall} alt="" />
                                     <span style={{color: colors.text}}>{course.teacherName}</span>
                                </div>
                            </td>
                            <td style={{...styles.td, color: colors.textSecondary}}>{course.studentCount}</td>
                            <td style={styles.td}>
                                <div style={{display: 'flex', gap: '0.5rem'}}>
                                    <button 
                                        style={{...styles.iconActionBtn, color: colors.primary}} 
                                        onClick={() => handleEditCourse(course)}
                                        title={t('editCourse')}
                                    >
                                        <EditIcon />
                                    </button>
                                    <button 
                                        style={{...styles.iconActionBtn, color: colors.danger}} 
                                        onClick={() => handleDeleteClick(course.id)}
                                        title={t('deleteCourse')}
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Modal Style Helper
    const modalStyle = {
        ...styles.modalContent,
        backgroundColor: colors.card,
        color: colors.text
    };

    return (
        <div style={styles.container}>
            {renderStats()}
            <div style={styles.mainContent}>
                {renderToolbar()}
                {viewMode === 'grid' ? renderGridView() : renderListView()}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={modalStyle}>
                        <div style={styles.modalHeader}>
                            <h3 style={{...styles.modalTitle, color: colors.text}}>{editingCourse ? t('editCourse') : t('createCourse')}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>
                                <XIcon />
                            </button>
                        </div>
                        <form onSubmit={handleSave} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={{...styles.label, color: colors.textSecondary}}>{t('courseName')}</label>
                                <input 
                                    style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. Intro to Biology"
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{...styles.label, color: colors.textSecondary}}>{t('courseCode')}</label>
                                <input 
                                    style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                    value={formData.code}
                                    onChange={e => setFormData({...formData, code: e.target.value})}
                                    placeholder="e.g. BIO-101"
                                    required
                                />
                            </div>
                             <div style={styles.formGroup}>
                                <label style={{...styles.label, color: colors.textSecondary}}>{t('assignProfessor')}</label>
                                <select 
                                    style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                    value={formData.teacherId}
                                    onChange={e => setFormData({...formData, teacherId: e.target.value})}
                                >
                                    <option value="">{t('selectProfessor')}</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                                    ))}
                                </select>
                            </div>
                             <div style={styles.formGroup}>
                                <label style={{...styles.label, color: colors.textSecondary}}>{t('description')}</label>
                                <textarea 
                                    style={{...styles.textarea, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    rows={3}
                                />
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

            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                 <div style={styles.modalOverlay}>
                    <div style={{...styles.confirmContent, backgroundColor: colors.card}}>
                        <h3 style={{...styles.confirmTitle, color: colors.text}}>{t('deleteCourse')}</h3>
                        <p style={{...styles.confirmText, color: colors.textSecondary}}>
                            {t('confirmDeleteCourse', { name: localCourses.find(c => c.id === deleteConfirmation)?.name || '' })}
                        </p>
                        <div style={styles.modalActions}>
                            <button style={styles.cancelBtn} onClick={() => setDeleteConfirmation(null)}>
                                {t('cancel')}
                            </button>
                            <button style={{...styles.deleteBtn, backgroundColor: colors.danger}} onClick={confirmDelete}>
                                {t('deleteCourse')}
                            </button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
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
    // Main Content Area
    mainContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
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
    viewToggle: {
        display: 'flex',
        padding: '4px',
        borderRadius: '8px',
        gap: '4px',
    },
    toggleBtn: {
        border: 'none',
        borderRadius: '6px',
        padding: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s',
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
    // Grid View
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '1.5rem',
    },
    card: {
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    cardHeader: {
        padding: '1.5rem 1.5rem 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardActions: {
        display: 'flex',
        gap: '0.5rem',
    },
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
    deptBadge: {
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    moreBtn: {
        background: 'none',
        border: 'none',
        fontSize: '1.2rem',
        color: '#94A3B8',
        cursor: 'pointer',
    },
    cardBody: {
        padding: '1rem 1.5rem',
        flex: 1,
    },
    cardTitle: {
        margin: '0 0 0.25rem',
        fontSize: '1.25rem',
        fontWeight: 700,
    },
    cardCode: {
        margin: 0,
        fontSize: '0.85rem',
        fontWeight: 500,
    },
    cardDesc: {
        margin: '1rem 0',
        fontSize: '0.9rem',
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    progressWrapper: {
        marginTop: 'auto',
    },
    progressLabel: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: '#64748B',
        marginBottom: '0.25rem',
        fontWeight: 500,
    },
    progressBarBg: {
        width: '100%',
        height: '6px',
        backgroundColor: '#F1F5F9',
        borderRadius: '3px',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: '3px',
    },
    cardFooter: {
        padding: '1rem 1.5rem',
        borderTop: '1px solid',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    teacherInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    teacherAvatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        objectFit: 'cover',
    },
    teacherDetails: {
        display: 'flex',
        flexDirection: 'column',
    },
    teacherLabel: {
        fontSize: '0.7rem',
        textTransform: 'uppercase',
    },
    teacherName: {
        fontSize: '0.9rem',
        fontWeight: 600,
    },
    viewBtn: {
        background: 'transparent',
        border: '1px solid',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
    },
    // List View
    listContainer: {
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '1rem 1.5rem',
        textAlign: 'left',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
    },
    tr: {
        borderBottom: '1px solid',
    },
    td: {
        padding: '1rem 1.5rem',
        fontSize: '0.9rem',
        verticalAlign: 'middle',
    },
    listName: {
        fontWeight: 600,
        fontSize: '1rem',
    },
    teacherInfoSmall: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    avatarSmall: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
    },
    viewBtnSmall: {
        background: 'transparent',
        border: 'none',
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: '0.85rem',
        padding: 0,
    },
    // Modal & Forms
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
    confirmContent: {
        padding: '2rem',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
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
    textarea: {
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid',
        fontSize: '1rem',
        outline: 'none',
        fontFamily: 'inherit',
        resize: 'vertical',
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
    deleteBtn: {
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: 'none',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
    },
    confirmTitle: {
        margin: '0 0 1rem 0',
    },
    confirmText: {
        marginBottom: '2rem',
    }
};

export default Courses;