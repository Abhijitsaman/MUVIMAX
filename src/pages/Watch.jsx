import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import { FiArrowLeft, FiMaximize, FiMinimize, FiPlay, FiPause, FiSkipForward, FiSkipBackward, FiVolume2, FiVolumeX, FiSettings } from 'react-icons/fi';
import { useMovieDetails } from '../hooks/useMovieDetails';
import { useAuth } from '../context/AuthContext';
import { FirebaseService } from '../firebase/services';
import { useLanguage } from '../context/LanguageContext';
import './Watch.css';

const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { movie, loading } = useMovieDetails(id);
  
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user && movie) {
      const saveProgress = async () => {
        try {
          await FirebaseService.addToHistory(user.uid, movie.id, movie, progress);
        } catch (error) {
          console.error('Error saving progress:', error);
        }
      };
      saveProgress();
    }
  }, [progress, isAuthenticated, user, movie]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePlayPause = () => {
    setPlaying(!playing);
    resetControlsTimer();
  };

  const handleProgress = (state) => {
    setProgress(state.played);
    if (state.loaded > 0) {
      setIsLoading(false);
    }
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const newProgress = Math.max(0, Math.min(1, x));
    playerRef.current.seekTo(newProgress);
    setProgress(newProgress);
  };

  const handleSkipForward = () => {
    const currentTime = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(currentTime + 10);
    resetControlsTimer();
  };

  const handleSkipBackward = () => {
    const currentTime = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(currentTime - 10);
    resetControlsTimer();
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const handleToggleMute = () => {
    setMuted(!muted);
    resetControlsTimer();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    resetControlsTimer();
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    setShowSettings(false);
    resetControlsTimer();
  };

  const handleQualityChange = (q) => {
    setQuality(q);
    setShowSettings(false);
    resetControlsTimer();
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    resetControlsTimer();
  };

  const resetControlsTimer = () => {
    clearTimeout(controlsTimeoutRef.current);
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 4000);
    }
  };

  const handleError = (err) => {
    setError('Failed to load video. Please try again.');
    setIsLoading(false);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setRetryCount(retryCount + 1);
    setPlaying(true);
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="watch-loading">
        <div className="watch-loading-spinner" />
        <p>Loading video...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="watch-error">
        <h2>Movie not found</h2>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="watch-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setControlsVisible(false)}
    >
      <button
        className="watch-back-btn"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <FiArrowLeft size={24} />
      </button>

      <div className="watch-player-wrapper">
        <ReactPlayer
          ref={playerRef}
          url={movie.videoUrl}
          playing={playing}
          volume={volume}
          muted={muted}
          playbackRate={playbackSpeed}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onError={handleError}
          onBuffer={() => setIsLoading(true)}
          onBufferEnd={() => setIsLoading(false)}
          width="100%"
          height="100%"
          controls={false}
          config={{
            file: {
              attributes: {
                crossOrigin: 'anonymous',
              },
            },
          }}
        />

        {isLoading && (
          <div className="watch-buffer">
            <div className="watch-buffer-spinner" />
            <p>Buffering...</p>
          </div>
        )}

        {error && (
          <div className="watch-error-overlay">
            <p>{error}</p>
            <button onClick={handleRetry} className="watch-retry-btn">
              Retry
            </button>
          </div>
        )}
      </div>

      <motion.div
        className={`watch-controls ${controlsVisible ? 'visible' : 'hidden'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: controlsVisible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="watch-controls-top">
          <span className="watch-title">{movie.title}</span>
        </div>

        <div className="watch-controls-center">
          <button
            className="watch-control-btn watch-control-btn-large"
            onClick={handleSkipBackward}
            aria-label="Skip backward 10 seconds"
          >
            <FiSkipBackward size={28} />
          </button>

          <button
            className="watch-control-btn watch-control-btn-play"
            onClick={handlePlayPause}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <FiPause size={40} /> : <FiPlay size={40} />}
          </button>

          <button
            className="watch-control-btn watch-control-btn-large"
            onClick={handleSkipForward}
            aria-label="Skip forward 10 seconds"
          >
            <FiSkipForward size={28} />
          </button>
        </div>

        <div className="watch-controls-bottom">
          <div className="watch-progress-bar" onClick={handleSeek}>
            <div
              className="watch-progress-fill"
              style={{ width: `${progress * 100}%` }}
            />
            <div
              className="watch-progress-handle"
              style={{ left: `${progress * 100}%` }}
            />
          </div>

          <div className="watch-controls-bottom-row">
            <div className="watch-controls-left">
              <span className="watch-time">
                {formatTime(progress * duration)} / {formatTime(duration)}
              </span>
            </div>

            <div className="watch-controls-right">
              <button
                className="watch-control-btn"
                onClick={handleToggleMute}
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
              </button>

              <input
                type="range"
                className="watch-volume-slider"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                aria-label="Volume"
              />

              <button
                className="watch-control-btn"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Settings"
              >
                <FiSettings size={20} />
              </button>

              <button
                className="watch-control-btn"
                onClick={handleToggleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="watch-settings-menu">
              <div className="watch-settings-group">
                <h4>Playback Speed</h4>
                <div className="watch-settings-options">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      className={`watch-settings-option ${playbackSpeed === speed ? 'active' : ''}`}
                      onClick={() => handleSpeedChange(speed)}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="watch-settings-group">
                <h4>Quality</h4>
                <div className="watch-settings-options">
                  {['auto', '1080p', '720p', '480p'].map((q) => (
                    <button
                      key={q}
                      className={`watch-settings-option ${quality === q ? 'active' : ''}`}
                      onClick={() => handleQualityChange(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Watch;
