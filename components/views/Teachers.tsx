
import React from 'react';
import { User, Teacher } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

interface TeachersProps {
    users: User[];
}

const Teachers: React.FC<TeachersProps> = ({ users }) => {
    const { t } = useLanguage();
    const { colors } = useTheme();

    // Filter dynamic users list for Professors
    const teachersList = users.filter(u => u.role === 'Professor') as Teacher[];

    return (
        <div style={{...styles.container, backgroundColor: colors.card}}>
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('teacherId')}</th>
                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('name')}</th>
                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('email')}</th>
                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('department')}</th>
                            <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('office')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachersList.length > 0 ? teachersList.map(teacher => (
                            <tr key={teacher.id} style={{...styles.tr, borderBottomColor: colors.border}}>
                                <td style={{...styles.td, color: colors.text}}>{teacher.teacherId || '-'}</td>
                                <td style={{...styles.td, color: colors.text}}>{teacher.name}</td>
                                <td style={{...styles.td, color: colors.textSecondary}}>{teacher.email}</td>
                                <td style={{...styles.td, color: colors.text}}>{teacher.department || '-'}</td>
                                <td style={{...styles.td, color: colors.textSecondary}}>{teacher.office || '-'}</td>
                            </tr>
                        )) : (
                             <tr>
                                <td colSpan={5} style={{padding: '2rem', textAlign: 'center', color: colors.textSecondary}}>
                                    No teachers found.
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
    }
};

export default Teachers;
