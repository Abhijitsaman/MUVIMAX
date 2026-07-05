import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiInfo, FiFilm, FiMegaphone, FiClock, FiBellOff } from 'react-icons/fi';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LoginDialog from '../components/LoginDialog';
import './Notifications.css';

const Notifications = () => {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
    }
  }, [isAuthenticated]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'movie':
        return <FiFilm size={20} />;
      case 'update':
        return <FiInfo size={20} />;
      case 'announcement':
        return <FiMegaphone size={20} />;
      default:
        return <FiBell size={20} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'movie':
        return 'var(--color-primary)';
      case 'update':
        return 'var(--color-accent)';
      case 'announcement':
        return '#fbbf24';
      default:
        return 'var(--color-text-secondary)';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setExpandedId(expandedId === notification.id ? null : notification.id);
  };

  if (!isAuthenticated) {
    return (
      <div className="notifications-page">
        <LoginDialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-header">
          <h1 className="notifications-title">{t('notifications')}</h1>
        </div>
        <div className="notifications-list">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="notification-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="notifications-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="notifications-header">
        <div className="notifications-header-left">
          <h1 className="notifications-title">
            <FiBell size={28} />
            {t('notifications')}
          </h1>
          {unreadCount > 0 && (
            <span className="notifications-unread-badge">{unreadCount}</span>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            className="notifications-mark-all"
            onClick={markAllAsRead}
          >
            <FiCheck size={18} />
            Mark all as read
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {notifications.length === 0 ? (
          <motion.div
            key="empty"
            className="notifications-empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="notifications-empty-icon">
              <FiBellOff size={64} />
            </div>
            <h3>{t('emptyNotifications')}</h3>
            <p>{t('checkLater')}</p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            className="notifications-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-item-icon" style={{ color: getNotificationColor(notification.type) }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-item-content">
                  <div className="notification-item-header">
                    <h4 className="notification-item-title">{notification.title}</h4>
                    <span className="notification-item-time">
                      <FiClock size={14} />
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className={`notification-item-body ${expandedId === notification.id ? 'expanded' : ''}`}>
                    {notification.body}
                  </p>
                  {!notification.read && (
                    <span className="notification-item-unread-dot" />
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Notifications;
