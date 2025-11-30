
import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { GlobeIcon, PaletteIcon, BellIcon, LockIcon, SaveIcon, MoonIcon, SunIcon } from '../Icons';

type SettingsTab = 'general' | 'appearance' | 'notifications' | 'security';

const Settings = () => {
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme, colors } = useTheme();
    const { addNotification } = useNotification();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');

    // Mock State for Notifications
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        system: true
    });

    // Mock State for Security
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handleNotificationToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        addNotification(t('settings_saved'), 'success');
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            addNotification('Passwords do not match', 'error');
            return;
        }
        if (passwordData.new.length < 6) {
            addNotification('Password too short', 'error');
            return;
        }
        setPasswordData({ current: '', new: '', confirm: '' });
        addNotification(t('password_success'), 'success');
    };

    // Render Helpers
    const renderMenu = () => (
        <div style={{...styles.menu, backgroundColor: colors.card}}>
            <button 
                style={activeTab === 'general' ? {...styles.menuItem, ...styles.activeMenuItem, backgroundColor: colors.secondaryBg, color: colors.primary} : {...styles.menuItem, color: colors.textSecondary}}
                onClick={() => setActiveTab('general')}
            >
                <GlobeIcon /> {t('settings_general')}
            </button>
            <button 
                 style={activeTab === 'appearance' ? {...styles.menuItem, ...styles.activeMenuItem, backgroundColor: colors.secondaryBg, color: colors.primary} : {...styles.menuItem, color: colors.textSecondary}}
                 onClick={() => setActiveTab('appearance')}
            >
                <PaletteIcon /> {t('settings_appearance')}
            </button>
            <button 
                 style={activeTab === 'notifications' ? {...styles.menuItem, ...styles.activeMenuItem, backgroundColor: colors.secondaryBg, color: colors.primary} : {...styles.menuItem, color: colors.textSecondary}}
                 onClick={() => setActiveTab('notifications')}
            >
                <BellIcon /> {t('settings_notifications')}
            </button>
            <button 
                 style={activeTab === 'security' ? {...styles.menuItem, ...styles.activeMenuItem, backgroundColor: colors.secondaryBg, color: colors.primary} : {...styles.menuItem, color: colors.textSecondary}}
                 onClick={() => setActiveTab('security')}
            >
                <LockIcon /> {t('settings_security')}
            </button>
        </div>
    );

    const renderContent = () => {
        const cardStyle = { ...styles.card, backgroundColor: colors.card };
        
        switch (activeTab) {
            case 'general':
                return (
                    <div style={cardStyle}>
                        <h2 style={{...styles.cardTitle, color: colors.text}}>{t('settings_general')}</h2>
                        <div style={styles.section}>
                            <label style={{...styles.label, color: colors.text}}>{t('language')}</label>
                            <div style={styles.radioGroup}>
                                <button 
                                    style={language === 'en' ? {...styles.radioBtnActive, backgroundColor: colors.primary, borderColor: colors.primary} : {...styles.radioBtn, borderColor: colors.border, color: colors.text}}
                                    onClick={() => setLanguage('en')}
                                >
                                    English (US)
                                </button>
                                <button 
                                    style={language === 'es' ? {...styles.radioBtnActive, backgroundColor: colors.primary, borderColor: colors.primary} : {...styles.radioBtn, borderColor: colors.border, color: colors.text}}
                                    onClick={() => setLanguage('es')}
                                >
                                    Español (Latam)
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'appearance':
                return (
                    <div style={cardStyle}>
                        <h2 style={{...styles.cardTitle, color: colors.text}}>{t('settings_appearance')}</h2>
                        <div style={styles.section}>
                            <label style={{...styles.label, color: colors.text}}>{t('theme')}</label>
                            <div style={styles.themeGrid}>
                                <div 
                                    style={theme === 'light' ? {...styles.themeCardActive, borderColor: colors.primary} : {...styles.themeCard, borderColor: colors.border, backgroundColor: colors.background}}
                                    onClick={() => theme !== 'light' && toggleTheme()}
                                >
                                    <div style={{...styles.themePreview, backgroundColor: '#F0F4F8'}}>
                                        <div style={{width: '100%', height: '10px', backgroundColor: '#FFFFFF', marginBottom: '5px'}}></div>
                                        <div style={{width: '60%', height: '5px', backgroundColor: '#E2E8F0'}}></div>
                                    </div>
                                    <span style={{...styles.themeLabel, color: colors.text}}><SunIcon /> {t('light')}</span>
                                </div>
                                <div 
                                    style={theme === 'dark' ? {...styles.themeCardActive, borderColor: colors.primary} : {...styles.themeCard, borderColor: colors.border, backgroundColor: colors.background}}
                                    onClick={() => theme !== 'dark' && toggleTheme()}
                                >
                                    <div style={{...styles.themePreview, backgroundColor: '#0F172A'}}>
                                        <div style={{width: '100%', height: '10px', backgroundColor: '#1E293B', marginBottom: '5px'}}></div>
                                        <div style={{width: '60%', height: '5px', backgroundColor: '#334155'}}></div>
                                    </div>
                                    <span style={{...styles.themeLabel, color: colors.text}}><MoonIcon /> {t('dark')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div style={cardStyle}>
                         <h2 style={{...styles.cardTitle, color: colors.text}}>{t('settings_notifications')}</h2>
                         <div style={styles.toggleList}>
                             <div style={styles.toggleItem}>
                                 <span style={{color: colors.text}}>{t('notifications_email')}</span>
                                 <button 
                                    style={{...styles.toggleBtn, backgroundColor: notifications.email ? colors.success : colors.border}}
                                    onClick={() => handleNotificationToggle('email')}
                                 >
                                     <div style={{...styles.toggleCircle, transform: notifications.email ? 'translateX(20px)' : 'translateX(0)'}} />
                                 </button>
                             </div>
                             <div style={styles.toggleItem}>
                                 <span style={{color: colors.text}}>{t('notifications_push')}</span>
                                 <button 
                                    style={{...styles.toggleBtn, backgroundColor: notifications.push ? colors.success : colors.border}}
                                    onClick={() => handleNotificationToggle('push')}
                                 >
                                     <div style={{...styles.toggleCircle, transform: notifications.push ? 'translateX(20px)' : 'translateX(0)'}} />
                                 </button>
                             </div>
                             <div style={styles.toggleItem}>
                                 <span style={{color: colors.text}}>{t('notifications_system')}</span>
                                 <button 
                                    style={{...styles.toggleBtn, backgroundColor: notifications.system ? colors.success : colors.border}}
                                    onClick={() => handleNotificationToggle('system')}
                                 >
                                     <div style={{...styles.toggleCircle, transform: notifications.system ? 'translateX(20px)' : 'translateX(0)'}} />
                                 </button>
                             </div>
                         </div>
                    </div>
                );
            case 'security':
                return (
                    <div style={cardStyle}>
                        <h2 style={{...styles.cardTitle, color: colors.text}}>{t('settings_security')}</h2>
                        <form onSubmit={handlePasswordChange} style={styles.form}>
                            <h3 style={{...styles.sectionSubtitle, color: colors.textSecondary}}>{t('password_change')}</h3>
                            <div style={styles.inputGroup}>
                                <label style={{...styles.label, color: colors.textSecondary}}>{t('password_current')}</label>
                                <input 
                                    type="password" 
                                    style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                    value={passwordData.current}
                                    onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={{...styles.label, color: colors.textSecondary}}>{t('password_new')}</label>
                                <input 
                                    type="password" 
                                    style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                    value={passwordData.new}
                                    onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={{...styles.label, color: colors.textSecondary}}>{t('password_confirm')}</label>
                                <input 
                                    type="password" 
                                    style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                    value={passwordData.confirm}
                                    onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                                />
                            </div>
                            <button type="submit" style={{...styles.saveBtn, backgroundColor: colors.primary}}>
                                <SaveIcon /> {t('saveChanges')}
                            </button>
                        </form>
                    </div>
                );
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.grid}>
                <div style={styles.sidebar}>
                    {renderMenu()}
                </div>
                <div style={styles.content}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '2rem',
        alignItems: 'start',
    },
    sidebar: {
        position: 'sticky',
        top: '1rem',
    },
    menu: {
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        width: '100%',
        padding: '1rem 1.5rem',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: 500,
        textAlign: 'left',
        transition: 'background-color 0.2s',
    },
    activeMenuItem: {
        fontWeight: 600,
        borderLeft: '4px solid currentColor',
    },
    content: {},
    card: {
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        minHeight: '400px',
    },
    cardTitle: {
        margin: '0 0 1.5rem 0',
        fontSize: '1.5rem',
        fontWeight: 700,
    },
    section: {
        marginBottom: '2rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.75rem',
        fontWeight: 600,
        fontSize: '0.9rem',
    },
    radioGroup: {
        display: 'flex',
        gap: '1rem',
    },
    radioBtn: {
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: '1px solid',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 500,
    },
    radioBtnActive: {
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: '1px solid',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 600,
    },
    // Appearance
    themeGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1.5rem',
    },
    themeCard: {
        border: '2px solid',
        borderRadius: '12px',
        padding: '1rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        transition: 'all 0.2s',
    },
    themeCardActive: {
        border: '2px solid',
        borderRadius: '12px',
        padding: '1rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    themePreview: {
        width: '100%',
        height: '80px',
        borderRadius: '8px',
        padding: '10px',
        boxSizing: 'border-box',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    themeLabel: {
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    // Notifications
    toggleList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    toggleItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggleBtn: {
        width: '48px',
        height: '28px',
        borderRadius: '14px',
        border: 'none',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    toggleCircle: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: '#fff',
        position: 'absolute',
        top: '2px',
        left: '2px',
        transition: 'transform 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    },
    // Security Form
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '400px',
    },
    sectionSubtitle: {
        margin: 0,
        fontSize: '1rem',
        fontWeight: 600,
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    input: {
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid',
        fontSize: '1rem',
        outline: 'none',
    },
    saveBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.75rem',
        borderRadius: '8px',
        border: 'none',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
        marginTop: '1rem',
    }
};

export default Settings;
