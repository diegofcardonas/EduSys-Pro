
import React from 'react';
import { User, Student } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

interface StudentsProps {
    users: User[];
    onSelectStudent: (studentId: string) => void;
}

const Students: React.FC<StudentsProps> = ({ users, onSelectStudent }) => {
    const { t } = useLanguage();
    const { colors } = useTheme();

    // Filter dynamic users list for Students
    const studentsList = users.filter(u => u.role === 'Student') as Student[];

    return (
        <div style={{...styles.container, backgroundColor: colors.card}}>
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('studentId')}</th>
                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('name')}</th>
                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('email')}</th>
                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('gradeLevel')}</th>
                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('parentContact')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentsList.length > 0 ? studentsList.map(student => (
                            <tr key={student.id} style={{...styles.tr, borderBottomColor: colors.border}}>
                                <td style={{...styles.td, color: colors.text}}>{student.studentId || '-'}</td>
                                <td 
                                    style={{...styles.td, ...styles.nameCell, color: colors.primary}}
                                    onClick={() => onSelectStudent(student.id)}
                                >
                                    {student.name}
                                </td>
                                <td style={{...styles.td, color: colors.textSecondary}}>{student.email}</td>
                                <td style={{...styles.td, color: colors.text}}>{student.gradeLevel || '-'}</td>
                                <td style={{...styles.td, color: colors.textSecondary}}>{student.parentContact || '-'}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} style={{padding: '2rem', textAlign: 'center', color: colors.textSecondary}}>
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
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
        padding: '0.75rem 1rem',
        textAlign: 'left',
        fontSize: '0.875rem',
        fontWeight: 600,
        textTransform: 'uppercase',
    },
    tr: {
        borderBottom: '1px solid',
    },
    td: {
        padding: '0.75rem 1rem',
    },
    nameCell: {
        fontWeight: 600,
        cursor: 'pointer',
    }
};

export default Students;
