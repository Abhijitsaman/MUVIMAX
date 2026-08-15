import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import { FiArrowLeft, FiMaximize, FiMinimize, FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiVolumeX, FiSettings } from 'react-icons/fi';
import { useMovieDetails } from '../hooks/useMovieDetails';
import { useAuth } from '../context/AuthContext';
import { FirebaseService } from '../firebase/services';
import { useLanguage } from '../context/LanguageContext';
import './Watch.css';

// IFRAME-ONLY DOMAINS - যেসব ডোমেইন শুধু iframe হিসেবে কাজ করে
const IFRAME_ONLY_DOMAINS = [
  'screenapp.io',
  'loom.com',
  'streamable.com',
  'vimeo.com/video',
  'streamtape.site',
  'streamtape.com'
];

// Extracts the src URL from a raw <iframe> embed code, if the videoUrl is one
const extractIframeSrc = (raw) => {
  if (!raw || typeof raw !== 'string') return null;
  const match = raw.match(/src=["']([^"']+)["']/i);
  return match ? match[1] : null;
};

const isIframeEmbedCode = (raw) => {
  if (!raw || typeof raw !== 'string') return false;
  return raw.trim().startsWith('<iframe');
};

// ডোমেইন চেক করার ফাংশন
const isIframeOnlyDomain = (url) => {
  if (!url || typeof url !== 'string') return false;
  return IFRAME_ONLY_DOMAINS.some(domain => url.includes(domain));
};

// How long to wait stuck on "Buffering..." before showing a diagnostic error
const BUFFER_TIMEOUT_MS = 8000;

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
  const [muted, setMuted] = useState(true);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const controlsTimeoutRef = useRef(null);
  const bufferTimeoutRef = useRef(null);

  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return ReactPlayer.canPlay(url) && (
      url.includes('youtube.com') || 
      url.includes('youtu.be') ||
      url.includes('youtube')
    );
  };

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

  // Buffer timeout watchdog: if stuck loading too long, surface a diagnostic error
  useEffect(() => {
    if (isLoading && !error) {
      bufferTimeoutRef.current = setTimeout(() => {
        setError('TIMEOUT');
        setDebugInfo(prev => ({
          ...(prev || {}),
          reason: `Video did not start playing within ${BUFFER_TIMEOUT_MS / 1000} seconds. This usually means the video URL is invalid, blocked, or the source does not allow embedding.`
        }));
      }, BUFFER_TIMEOUT_MS);
    }
    return () => clearTimeout(bufferTimeoutRef.current);
  }, [isLoading, error, retryCount]);

  const handlePlayPause = () => {
    if (!hasStartedPlayback) {
      setHasStartedPlayback(true);
      setMuted(false);
    }
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

  const handleError = (err, data, hlsInstance, hlsGlobal) => {
    clearTimeout(bufferTimeoutRef.current);
    setError('PLAYER_ERROR');
    let details = '';
    try {
      if (err && typeof err === 'object') {
        details = JSON.stringify(err, Object.getOwnPropertyNames(err), 2);
      } else {
        details = String(err);
      }
    } catch (e) {
      details = 'Could not stringify error object: ' + String(err);
    }
    setDebugInfo(prev => ({
      ...(prev || {}),
      reason: 'The player reported an error while loading the video.',
      rawError: details
    }));
    setIsLoading(false);
  };

  const handleRetry = () => {
    setError(null);
    setDebugInfo(null);
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

  const rawVideoUrl = movie.videoSource || movie.videoUrl;

  // Diagnostic error panel — shown instead of the player when something is wrong
  const renderDiagnosticError = () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#0a0a0a',
        color: '#ff6b6b',
        padding: '20px',
        overflowY: 'auto',
        fontSize: '13px',
        lineHeight: 1.6,
        wordBreak: 'break-all',
        zIndex: 20
      }}
    >
      <h3 style={{ color: '#ff4444', marginBottom: '12px' }}>⚠️ Video Playback Error</h3>
      <p style={{ color: '#fff', marginBottom: '8px' }}>
        <strong>Reason:</strong> {debugInfo?.reason || 'Unknown error'}
      </p>
      <hr style={{ border: '1px solid #333', margin: '12px 0' }} />
      <p style={{ color: '#aaa', marginBottom: '4px' }}><strong>Movie ID:</strong> {id}</p>
      <p style={{ color: '#aaa', marginBottom: '4px' }}><strong>movie.videoSource:</strong> {String(movie.videoSource || '(empty)')}</p>
      <p style={{ color: '#aaa', marginBottom: '4px' }}><strong>movie.videoUrl:</strong> {String(movie.videoUrl || '(empty)')}</p>
      <p style={{ color: '#aaa', marginBottom: '4px' }}><strong>Resolved rawVideoUrl:</strong> {String(rawVideoUrl || '(empty — nothing to play)')}</p>
      <p style={{ color: '#aaa', marginBottom: '4px' }}>
        <strong>Detected type:</strong>{' '}
        {isIframeEmbedCode(rawVideoUrl) ? 'iframe embed code' : 
         isIframeOnlyDomain(rawVideoUrl) ? 'iframe-only domain' :
         isYouTubeUrl(rawVideoUrl) ? 'YouTube URL' : 
         rawVideoUrl ? 'Direct file/other URL' : 'No URL found'}
      </p>
      {debugInfo?.rawError && (
        <>
          <hr style={{ border: '1px solid #333', margin: '12px 0' }} />
          <p style={{ color: '#aaa', marginBottom: '4px' }}><strong>Raw player error:</strong></p>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#ff9999', background: '#1a1a1a', padding: '8px', borderRadius: '4px' }}>
            {debugInfo.rawError}
          </pre>
        </>
      )}
      <button
        onClick={handleRetry}
        style={{
          marginTop: '16px',
          padding: '10px 20px',
          background: '#e50914',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px'
        }}
      >
        Retry
      </button>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: '16px',
          marginLeft: '8px',
          padding: '10px 20px',
          background: '#333',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px'
        }}
      >
        Go Back
      </button>
    </div>
  );

  // Case 0: No video URL at all
  if (!rawVideoUrl) {
    if (!debugInfo) {
      setDebugInfo({ reason: 'No video source was found on this movie record at all (both videoSource and videoUrl are empty).' });
    }
    if (error !== 'NO_URL') setError('NO_URL');
    return (
      <div ref={containerRef} className="watch-container">
        <button className="watch-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <FiArrowLeft size={24} />
        </button>
        <div className="watch-player-wrapper" style={{ position: 'relative' }}>
          {renderDiagnosticError()}
        </div>
      </div>
    );
  }

  // Case 1: The saved value is a raw <iframe> embed code (e.g. from screenapp.io)
  if (isIframeEmbedCode(rawVideoUrl)) {
    const iframeSrc = extractIframeSrc(rawVideoUrl);
    return (
      <div ref={containerRef} className="watch-container">
        <button
          className="watch-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <FiArrowLeft size={24} />
        </button>
        <div className="watch-player-wrapper" style={{ position: 'relative' }}>
          {iframeSrc ? (
            <iframe
              src={iframeSrc}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
              style={{ border: 'none' }}
              title={movie.title}
            />
          ) : (
            renderDiagnosticError() || setDebugInfo({ reason: 'Could not extract a src URL from the saved iframe embed code.' })
          )}
        </div>
      </div>
    );
  }

  // NEW: Case 1.5 - Check if URL is from iframe-only domain (streamtape, etc.)
  if (isIframeOnlyDomain(rawVideoUrl)) {
    // Try to extract iframe src if it's an embed URL, otherwise use as is
    const iframeSrc = extractIframeSrc(rawVideoUrl) || rawVideoUrl;
    return (
      <div ref={containerRef} className="watch-container">
        <button
          className="watch-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <FiArrowLeft size={24} />
        </button>
        <div className="watch-player-wrapper" style={{ position: 'relative' }}>
          <iframe
            src={iframeSrc}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{ border: 'none' }}
            title={movie.title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
          />
        </div>
      </div>
    );
  }

  const videoUrl = rawVideoUrl;
  const isYouTube = isYouTubeUrl(videoUrl);

  const playerConfig = {
    youtube: {
      playerVars: {
        controls: 0,
        rel: 0,
        modestbranding: 1,
        fs: 1,
        iv_load_policy: 3,
        cc_load_policy: 0,
        playsinline: 1,
      },
    },
    file: {
      attributes: {
        crossOrigin: 'anonymous',
      },
      forceVideo: !isYouTube,
    },
  };

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

      <div className="watch-player-wrapper" style={{ position: 'relative' }}>
        {error ? (
          renderDiagnosticError()
        ) : (
          <>
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              playing={playing}
              volume={volume}
              muted={muted}
              playbackRate={playbackSpeed}
              onProgress={handleProgress}
              onDuration={handleDuration}
              onError={handleError}
              onBuffer={() => setIsLoading(true)}
              onBufferEnd={() => setIsLoading(false)}
              onReady={() => setIsLoading(false)}
              width="100%"
              height="100%"
              controls={false}
              config={playerConfig}
            />

            {isLoading && (
              <div className="watch-buffer">
                <div className="watch-buffer-spinner" />
                <p>Buffering...</p>
              </div>
            )}

            {muted && !hasStartedPlayback && !isLoading && (
              <button className="watch-unmute-hint" onClick={handlePlayPause}>
                Tap to play with sound
              </button>
            )}
          </>
        )}
      </div>

      {!error && (
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
              <FiSkipBack size={28} />
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
      )}
    </div>
  );
};

export default Watch;
