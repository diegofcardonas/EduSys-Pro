
import React from 'react';
import { User } from '../types';
import { LogoutIcon, MenuIcon, MoonIcon, SunIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  currentUser: User;
  currentViewTitle: string;
  onMenuClick: () => void;
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, currentViewTitle, onMenuClick, onProfileClick }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, colors } = useTheme();

  const getRoleTranslationKey = (role: string) => {
    return role.toLowerCase();
  }

  return (
    <header style={{...styles.header, backgroundColor: colors.card, borderBottomColor: colors.border}} className="header">
        <div style={styles.titleContainer}>
            <button 
                style={{...styles.menuButton, color: colors.text}} 
                className="menu-button" 
                onClick={onMenuClick} 
                aria-label="Open menu"
            >
                <MenuIcon />
            </button>
            <h1 style={{...styles.viewTitle, color: colors.text}} className="viewTitle">{currentViewTitle}</h1>
        </div>
      <div style={styles.userProfile}>
        {/* Theme Toggle */}
        <button 
            onClick={toggleTheme}
            style={{...styles.iconButton, color: colors.textSecondary, ':hover': { backgroundColor: colors.hover }}}
            title={t('toggleTheme')}
        >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>

        <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
            style={{
                ...styles.langSelect, 
                backgroundColor: colors.secondaryBg,
                borderColor: colors.border,
                color: colors.text
            }}
            aria-label={t('languageSelectorLabel')}
        >
            <option value="en">🇺🇸 EN</option>
            <option value="es">🇨🇴 ES</option>
        </select>
        
        <div 
            style={styles.userInfoContainer} 
            className="userInfo"
            onClick={onProfileClick}
            title={t('editProfile')}
        >
            <div style={styles.userInfoText}>
                <span style={{...styles.userName, color: colors.text}}>{currentUser.name}</span>
                <span style={{...styles.userRole, color: colors.textSecondary}}>{t(getRoleTranslationKey(currentUser.role))}</span>
            </div>
            <img 
                src={currentUser.avatarUrl || `https://i.pravatar.cc/150?u=${currentUser.id}`} 
                alt="User Avatar" 
                style={styles.avatar}
            />
        </div>

        <button style={{...styles.logoutButton, color: colors.textSecondary}} aria-label={t('logout')}>
            <LogoutIcon />
        </button>
      </div>
    </header>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    borderBottom: '1px solid',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  menuButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    margin: 0,
    transition: 'color 0.3s ease',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  langSelect: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
    fontWeight: 500,
    fontSize: '0.9rem',
    cursor: 'pointer',
    outline: 'none',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  userInfoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      cursor: 'pointer',
      padding: '0.25rem 0.5rem',
      borderRadius: '8px',
      transition: 'background-color 0.2s ease',
  },
  userInfoText: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
  },
  userName: {
    fontWeight: 600,
  },
  userRole: {
    fontSize: '0.8rem',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  logoutButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
  }
};

export default Header;
