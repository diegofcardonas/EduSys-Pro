
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type?: NotificationType) => void;
  removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <div style={styles.container}>
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            style={{
                ...styles.notification, 
                backgroundColor: getTypeColor(notification.type),
                animation: 'slideIn 0.3s ease-out'
            }}
          >
            {getIcon(notification.type)}
            <span style={styles.message}>{notification.message}</span>
            <button onClick={() => removeNotification(notification.id)} style={styles.closeBtn}>×</button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

const getTypeColor = (type: NotificationType) => {
    switch (type) {
        case 'success': return '#10B981'; // Emerald 500
        case 'error': return '#EF4444';   // Red 500
        case 'warning': return '#F59E0B'; // Amber 500
        default: return '#3B82F6';        // Blue 500
    }
};

const getIcon = (type: NotificationType) => {
    switch (type) {
        case 'success': return '✓';
        case 'error': return '✕';
        case 'warning': return '⚠';
        default: return 'ℹ';
    }
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: 9999,
  },
  notification: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#FFFFFF',
    padding: '12px 16px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    minWidth: '300px',
    fontSize: '0.95rem',
    fontWeight: 500,
  },
  message: {
      flex: 1,
  },
  closeBtn: {
      background: 'none',
      border: 'none',
      color: '#FFFFFF',
      fontSize: '1.2rem',
      cursor: 'pointer',
      opacity: 0.8,
      padding: '0 4px',
  }
};
