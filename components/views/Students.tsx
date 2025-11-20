import React from 'react';
import { students } from '../../data/mockData';
import { useLanguage } from '../../contexts/LanguageContext';

interface StudentsProps {
    onSelectStudent: (studentId: string) => void;
}

const Students: React.FC<StudentsProps> = ({ onSelectStudent }) => {
    const { t } = useLanguage();
    return (
        <div style={styles.container}>
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>{t('studentId')}</th>
                            <th style={styles.th}>{t('name')}</th>
                            <th style={styles.th}>{t('email')}</th>
                            <th style={styles.th}>{t('gradeLevel')}</th>
                            <th style={styles.th}>{t('parentContact')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id} style={styles.tr}>
                                <td style={styles.td}>{student.studentId}</td>
                                <td 
                                    style={{...styles.td, ...styles.nameCell}}
                                    onClick={() => onSelectStudent(student.id)}
                                >
                                    {student.name}
                                </td>
                                <td style={styles.td}>{student.email}</td>
                                <td style={styles.td}>{student.gradeLevel}</td>
                                <td style={styles.td}>{student.parentContact}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
    nameCell: {
        color: '#004AAD',
        fontWeight: 600,
        cursor: 'pointer',
    }
};

export default Students;