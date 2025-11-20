import React from 'react';
import { User } from '../../types';
import { messages, teachers } from '../../data/mockData';
import { useLanguage } from '../../contexts/LanguageContext';

interface CommunicationProps {
  currentUser: User;
}

const Communication: React.FC<CommunicationProps> = ({ currentUser }) => {
    const { t } = useLanguage();
    const userMessages = messages.filter(m => 
        m.toId === 'all' || 
        m.toId === currentUser.id || 
        (currentUser.role === 'Student' && m.toId === 'all-students') ||
        (currentUser.role === 'Professor' && m.toId === 'all-professors')
    );

    const getSenderName = (senderId: string) => {
        if (senderId === 'SYSTEM_ADMIN') return t('systemAdministrator');
        return teachers.find(t => t.id === senderId)?.name || t('unknownSender');
    }

    return (
        <div style={styles.container}>
            {userMessages.map(message => (
                <div key={message.id} style={styles.messageCard}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.subject}>{message.subject}</h3>
                        <span style={styles.date}>{message.date}</span>
                    </div>
                    <p style={styles.sender}>{t('from')}: {getSenderName(message.fromId)}</p>
                    <p style={styles.body}>{message.body}</p>
                </div>
            ))}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    messageCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: '1rem',
        marginBottom: '1rem',
    },
    subject: {
        margin: 0,
        fontSize: '1.2rem',
        fontWeight: 600,
        color: '#1E293B',
    },
    date: {
        fontSize: '0.875rem',
        color: '#64748B',
    },
    sender: {
        margin: 0,
        fontWeight: 500,
        color: '#475569',
    },
    body: {
        marginTop: '0.5rem',
        color: '#334155',
        lineHeight: 1.6,
    }
};

export default Communication;