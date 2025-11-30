


import React, { useState, useEffect } from 'react';
import { User, TimetableEntry } from '../../types';
import { timetable as initialTimetable, courses } from '../../data/mockData';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { PlusIcon, EditIcon, TrashIcon, GripIcon, XIcon, SaveIcon } from '../Icons';

interface TimetableProps {
  currentUser: User;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

const Timetable: React.FC<TimetableProps> = ({ currentUser }) => {
    const { t } = useLanguage();
    const { colors, theme } = useTheme();
    const { addNotification } = useNotification();
    
    // Local State for Timetable CRUD
    const [localTimetable, setLocalTimetable] = useState<TimetableEntry[]>([]);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
    const [formData, setFormData] = useState<Partial<TimetableEntry>>({
        courseId: '',
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        room: ''
    });

    // Drag and Drop State
    const [draggedEntryId, setDraggedEntryId] = useState<string | null>(null);

    // Initialize state
    useEffect(() => {
        const stored = localStorage.getItem('edusys_timetable');
        if (stored) {
            setLocalTimetable(JSON.parse(stored));
        } else {
            setLocalTimetable(initialTimetable);
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        if (localTimetable.length > 0) {
            localStorage.setItem('edusys_timetable', JSON.stringify(localTimetable));
        }
    }, [localTimetable]);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedEntryId(id);
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (e: React.DragEvent, day: string, startTime: string) => {
        e.preventDefault();
        const entryId = e.dataTransfer.getData('text/plain');
        
        if (entryId) {
            // Find length of current class to maintain duration
            const entry = localTimetable.find(e => e.id === entryId);
            if (!entry) return;

            const startHour = parseInt(entry.startTime.split(':')[0]);
            const endHour = parseInt(entry.endTime.split(':')[0]);
            const duration = endHour - startHour;
            
            const newStartHour = parseInt(startTime.split(':')[0]);
            const newEndHour = newStartHour + duration;
            const newEndTime = `${newEndHour.toString().padStart(2, '0')}:00`;

            // Update State
            setLocalTimetable(prev => prev.map(item => 
                item.id === entryId 
                ? { ...item, day: day as any, startTime, endTime: newEndTime } 
                : item
            ));
            
            addNotification(t('classUpdated'), 'success');
        }
        setDraggedEntryId(null);
    };

    // CRUD Handlers
    const handleAddNew = () => {
        setEditingEntry(null);
        setFormData({
            courseId: courses[0]?.id || '',
            day: 'Monday',
            startTime: '09:00',
            endTime: '10:30',
            room: 'Room 101'
        });
        setIsModalOpen(true);
    };

    const handleEdit = (entry: TimetableEntry) => {
        setEditingEntry(entry);
        setFormData({ ...entry });
        setIsModalOpen(true);
    };

    const handleDelete = () => {
        if (editingEntry) {
            setLocalTimetable(prev => prev.filter(e => e.id !== editingEntry.id));
            addNotification(t('classDeleted'), 'success');
            setIsModalOpen(false);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingEntry) {
            // Edit
            setLocalTimetable(prev => prev.map(item => 
                item.id === editingEntry.id ? { ...item, ...formData } as TimetableEntry : item
            ));
            addNotification(t('classUpdated'), 'success');
        } else {
            // Create
            const newEntry: TimetableEntry = {
                id: `tt_${Date.now()}`,
                ...formData as TimetableEntry
            };
            setLocalTimetable(prev => [...prev, newEntry]);
            addNotification(t('classAdded'), 'success');
        }
        setIsModalOpen(false);
    };

    const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.name || 'N/A';
    
    // Filter display logic (Admins see all, Students/Teachers see theirs)
    // Note: For this "Power" CRUD demo, Admin can edit ALL. 
    // If we want to simulate robust filtering:
    const displayedTimetable = localTimetable; 
    // In a real app, you might filter: localTimetable.filter(e => isUserEnrolled(e.courseId))

    return (
        <div style={{...styles.container, backgroundColor: colors.card, boxShadow: theme === 'dark' ? 'none' : '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}>
            <div style={styles.header}>
                <h2 style={{margin: 0, color: colors.text}}>{t('timetable')}</h2>
                <div style={styles.actions}>
                    <span style={{color: colors.textSecondary, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <GripIcon /> {t('dragToReschedule')}
                    </span>
                    <button style={{...styles.addBtn, backgroundColor: colors.primary}} onClick={handleAddNew}>
                        <PlusIcon /> {t('addClass')}
                    </button>
                </div>
            </div>

            <div style={{...styles.grid, borderColor: colors.border}}>
                {/* Header Time Label */}
                <div style={{...styles.headerCell, backgroundColor: colors.secondaryBg, color: colors.textSecondary, borderColor: colors.border}}>
                    {t('time')}
                </div>
                
                {/* Header Days */}
                {days.map(day => (
                    <div key={day} style={{...styles.headerCell, backgroundColor: colors.secondaryBg, color: colors.text, borderColor: colors.border}}>
                        {t(day.toLowerCase())}
                    </div>
                ))}
                
                {/* Time Slots & Events */}
                {timeSlots.map(time => (
                    <React.Fragment key={time}>
                        <div style={{...styles.timeCell, backgroundColor: colors.secondaryBg, color: colors.textSecondary, borderColor: colors.border}}>
                            {time}
                        </div>
                        {days.map(day => {
                            // Find events starting at this time block
                            const entry = displayedTimetable.find(e => e.day === day && e.startTime.startsWith(time.split(':')[0]));
                            
                            // Check if this slot is occupied by an event starting earlier (spanning)
                            // Simplified logic: Just show start times for now to keep grid clean
                            
                            return (
                                <div 
                                    key={`${day}-${time}`} 
                                    style={{
                                        ...styles.bodyCell, 
                                        borderColor: colors.border,
                                        backgroundColor: draggedEntryId ? (theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8FAFC') : 'transparent'
                                    }}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, day, time)}
                                >
                                    {entry && (
                                        <div 
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, entry.id)}
                                            onClick={() => handleEdit(entry)}
                                            style={{
                                                ...styles.event, 
                                                backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                                                borderLeft: `4px solid ${colors.primary}`,
                                                color: colors.text,
                                                cursor: 'grab'
                                            }}
                                            title={t('editClass')}
                                        >
                                            <div style={styles.eventHeader}>
                                                <p style={{...styles.eventName, color: colors.primary}}>{getCourseName(entry.courseId)}</p>
                                                {/* <GripIcon /> */}
                                            </div>
                                            <p style={{...styles.eventTime, color: colors.textSecondary}}>{`${entry.startTime} - ${entry.endTime}`}</p>
                                            <p style={{...styles.eventRoom, color: colors.textSecondary}}>{t('room')}: {entry.room}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>

            {/* Edit/Add Modal */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={{...styles.modalContent, backgroundColor: colors.card}}>
                        <div style={styles.modalHeader}>
                            <h3 style={{...styles.modalTitle, color: colors.text}}>
                                {editingEntry ? t('editClass') : t('addClass')}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>
                                <XIcon />
                            </button>
                        </div>
                        <form onSubmit={handleSave} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={{...styles.label, color: colors.textSecondary}}>{t('selectCourse')}</label>
                                <select 
                                    style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                    value={formData.courseId}
                                    onChange={e => setFormData({...formData, courseId: e.target.value})}
                                    required
                                >
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={styles.row}>
                                <div style={styles.formGroup}>
                                    <label style={{...styles.label, color: colors.textSecondary}}>{t('dayOfWeek')}</label>
                                    <select 
                                        style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                        value={formData.day}
                                        onChange={e => setFormData({...formData, day: e.target.value as any})}
                                    >
                                        {days.map(d => <option key={d} value={d}>{t(d.toLowerCase())}</option>)}
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={{...styles.label, color: colors.textSecondary}}>{t('room')}</label>
                                    <input 
                                        style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                        value={formData.room}
                                        onChange={e => setFormData({...formData, room: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={styles.row}>
                                <div style={styles.formGroup}>
                                    <label style={{...styles.label, color: colors.textSecondary}}>{t('startTime')}</label>
                                    <select 
                                        style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                        value={formData.startTime}
                                        onChange={e => setFormData({...formData, startTime: e.target.value})}
                                    >
                                        {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={{...styles.label, color: colors.textSecondary}}>{t('endTime')}</label>
                                    <input 
                                        type="time"
                                        style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                        value={formData.endTime}
                                        onChange={e => setFormData({...formData, endTime: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={styles.modalActions}>
                                {editingEntry && (
                                    <button 
                                        type="button" 
                                        onClick={handleDelete}
                                        style={{...styles.deleteBtn, backgroundColor: colors.danger}}
                                    >
                                        <TrashIcon /> {t('deleteClass')}
                                    </button>
                                )}
                                <div style={{flex: 1}}></div>
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
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        borderRadius: '12px',
        padding: '1.5rem',
        overflowX: 'auto',
        minHeight: '600px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    actions: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
    },
    addBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '6px',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '80px repeat(5, 1fr)',
        minWidth: '900px',
        border: '1px solid',
        borderRadius: '8px',
        overflow: 'hidden',
        userSelect: 'none',
    },
    headerCell: {
        padding: '1rem',
        textAlign: 'center',
        fontWeight: 600,
        textTransform: 'uppercase',
        fontSize: '0.85rem',
        borderBottom: '1px solid',
        borderRight: '1px solid',
        letterSpacing: '0.05em',
    },
    timeCell: {
        padding: '1rem',
        textAlign: 'center',
        fontWeight: 600,
        fontSize: '0.85rem',
        borderBottom: '1px solid',
        borderRight: '1px solid',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bodyCell: {
        minHeight: '110px',
        borderBottom: '1px solid',
        borderRight: '1px solid',
        padding: '0.5rem',
        position: 'relative',
        transition: 'background-color 0.2s',
    },
    event: {
        borderRadius: '6px',
        padding: '0.75rem',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '0.25rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    eventHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    eventName: {
        margin: 0,
        fontWeight: 700,
        fontSize: '0.9rem',
        lineHeight: 1.2,
    },
    eventTime: {
        margin: 0,
        fontSize: '0.8rem',
        fontWeight: 500,
    },
    eventRoom: {
        margin: 0,
        fontSize: '0.75rem',
        fontWeight: 500,
        opacity: 0.9,
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
        backdropFilter: 'blur(2px)',
    },
    modalContent: {
        padding: '2rem',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
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
        flex: 1,
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
        gap: '0.5rem',
        marginTop: '1rem',
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
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
    },
    cancelBtn: {
        padding: '0.75rem 1rem',
        border: '1px solid #CBD5E1',
        borderRadius: '8px',
        background: 'transparent',
        color: '#64748B',
        fontWeight: 600,
        cursor: 'pointer',
    }
};

export default Timetable;
