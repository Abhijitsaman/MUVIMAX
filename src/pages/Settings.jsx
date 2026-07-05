import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { FiMoon, FiSun, FiGlobe, FiVideo, FiDatabase, FiBell, FiShield, FiUser, FiLogOut, FiTrash2 } from 'react-icons/fi';
import './Settings.css';

const Settings = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const { logout } = useAuth();
  const [videoSettings, setVideoSettings] = useState({
    quality: 'auto',
    autoplay: true,
    subtitles: true,
    speed: 1
  });
  const [dataSettings, setDataSettings] = useState({
    dataSaver: false,
    autoQuality: true
  });
  const [notificationSettings, setNotificationSettings] = useState({
    movies: true,
    updates: true,
    announcements: true
  });

  const handleVideoSettingChange = (key, value) => {
    setVideoSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDataSettingChange = (key, value) => {
    setDataSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNotificationSettingChange = (key, value) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleClearData = (type) => {
    if (confirm(`Are you sure you want to clear ${type}?`)) {
      // Implement clear functionality
      console.log(`Clearing ${type}`);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
  };

  const SettingSection = ({ icon, title, children }) => (
    <div className="settings-section">
      <div className="settings-section-header">
        <div className="settings-section-icon">{icon}</div>
        <h3 className="settings-section-title">{title}</h3>
      </div>
      <div className="settings-section-content">{children}</div>
    </div>
  );

  const SettingToggle = ({ label, value, onChange }) => (
    <div className="setting-toggle">
      <span className="setting-toggle-label">{label}</span>
      <button
        className={`setting-toggle-switch ${value ? 'active' : ''}`}
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
      >
        <span className="setting-toggle-slider" />
      </button>
    </div>
  );

  const SettingSelect = ({ label, value, options, onChange }) => (
    <div className="setting-select">
      <span className="setting-select-label">{label}</span>
      <select
        className="setting-select-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <motion.div
      className="settings-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="settings-header">
        <h1 className="settings-title">{t('settings')}</h1>
      </div>

      <div className="settings-content">
        <SettingSection icon={<FiMoon />} title={t('appearance')}>
          <SettingToggle
            label={isDark ? t('darkMode') : t('lightMode')}
            value={isDark}
            onChange={toggleTheme}
          />
        </SettingSection>

        <SettingSection icon={<FiGlobe />} title={t('language')}>
          <SettingSelect
            label={t('language')}
            value={language}
            options={supportedLanguages.map(lang => ({
              value: lang.code,
              label: lang.name
            }))}
            onChange={setLanguage}
          />
        </SettingSection>

        <SettingSection icon={<FiVideo />} title={t('video')}>
          <SettingSelect
            label={t('playbackQuality')}
            value={videoSettings.quality}
            options={[
              { value: 'auto', label: t('auto') },
              { value: '1080p', label: '1080p' },
              { value: '720p', label: '720p' },
              { value: '480p', label: '480p' }
            ]}
            onChange={(value) => handleVideoSettingChange('quality', value)}
          />
          <SettingToggle
            label={t('autoplay')}
            value={videoSettings.autoplay}
            onChange={(value) => handleVideoSettingChange('autoplay', value)}
          />
          <SettingToggle
            label={t('subtitles')}
            value={videoSettings.subtitles}
            onChange={(value) => handleVideoSettingChange('subtitles', value)}
          />
          <SettingSelect
            label={t('playbackSpeed')}
            value={videoSettings.speed}
            options={[
              { value: 0.5, label: '0.5x' },
              { value: 0.75, label: '0.75x' },
              { value: 1, label: '1x' },
              { value: 1.25, label: '1.25x' },
              { value: 1.5, label: '1.5x' },
              { value: 2, label: '2x' }
            ]}
            onChange={(value) => handleVideoSettingChange('speed', parseFloat(value))}
          />
        </SettingSection>

        <SettingSection icon={<FiDatabase />} title={t('data')}>
          <SettingToggle
            label={t('dataSaver')}
            value={dataSettings.dataSaver}
            onChange={(value) => handleDataSettingChange('dataSaver', value)}
          />
          <SettingToggle
            label={t('autoQuality')}
            value={dataSettings.autoQuality}
            onChange={(value) => handleDataSettingChange('autoQuality', value)}
          />
          <div className="setting-actions">
            <button
              className="setting-action-btn"
              onClick={() => handleClearData('watch history')}
            >
              <FiTrash2 size={16} />
              {t('clearWatchHistory')}
            </button>
            <button
              className="setting-action-btn"
              onClick={() => handleClearData('search history')}
            >
              <FiTrash2 size={16} />
              {t('clearSearchHistory')}
            </button>
            <button
              className="setting-action-btn"
              onClick={() => handleClearData('continue watching')}
            >
              <FiTrash2 size={16} />
              {t('clearContinueWatching')}
            </button>
          </div>
        </SettingSection>

        <SettingSection icon={<FiBell />} title={t('notifications')}>
          <SettingToggle
            label={t('movieNotifications')}
            value={notificationSettings.movies}
            onChange={(value) => handleNotificationSettingChange('movies', value)}
          />
          <SettingToggle
            label={t('updateNotifications')}
            value={notificationSettings.updates}
            onChange={(value) => handleNotificationSettingChange('updates', value)}
          />
          <SettingToggle
            label={t('announcementNotifications')}
            value={notificationSettings.announcements}
            onChange={(value) => handleNotificationSettingChange('announcements', value)}
          />
        </SettingSection>

        <SettingSection icon={<FiShield />} title={t('privacy')}>
          <div className="setting-links">
            <a href="/privacy" className="setting-link">{t('privacyPolicy')}</a>
            <a href="/terms" className="setting-link">{t('termsConditions')}</a>
            <a href="/about" className="setting-link">{t('about')}</a>
            <span className="setting-version">{t('version')}: 1.0.0</span>
          </div>
        </SettingSection>

        <SettingSection icon={<FiUser />} title={t('account')}>
          <button
            className="setting-logout-btn"
            onClick={handleLogout}
          >
            <FiLogOut size={18} />
            {t('logout')}
          </button>
          <button
            className="setting-clear-data-btn"
            onClick={() => handleClearData('all local data')}
          >
            <FiTrash2 size={18} />
            {t('deleteData')}
          </button>
        </SettingSection>
      </div>
    </motion.div>
  );
};

export default Settings;
