import React, { useState, useEffect, useRef } from 'react';
import config from '../config.js';
import './YouTubeVideos.css';

const YouTubeVideos = ({ location }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState({});
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!location) {
      console.log('No location provided to YouTubeVideos component');
      return;
    }

    console.log('🎬 YouTubeVideos component received location:', location);

    const fetchYouTubeVideos = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const cacheKey = location.toLowerCase().trim();
      if (cache[cacheKey]) {
        console.log('Using cached videos for:', location);
        setVideos(cache[cacheKey]);
        return;
      }

      console.log('🎬 Starting to fetch YouTube videos for:', location);
      setLoading(true);
      setError(null);
      
      try {
        console.log('🎬 Fetching YouTube videos for location:', location);
        const encodedLocation = encodeURIComponent(location);
        const apiUrl = `${config.API_BASE_URL}/api/youtube/${encodedLocation}`;
        console.log('🎬 API URL:', apiUrl);
        
        const videosResponse = await fetch(
          apiUrl,
          {
            signal: abortControllerRef.current.signal,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        
        console.log('🎬 Videos response status:', videosResponse.status);
        
        if (!videosResponse.ok) {
          const errorText = await videosResponse.text();
          console.error('YouTube API error:', errorText);
          throw new Error(`Failed to fetch YouTube videos: ${videosResponse.status} - ${errorText}`);
        }

        const videosData = await videosResponse.json();
        console.log('🎬 Videos data received:', videosData);
        
        const videoList = videosData.videos || [];
        console.log('🎬 Video list length:', videoList.length);
        console.log('🎬 First video structure:', videoList[0]);
        setVideos(videoList); 
        setCache(prevCache => ({
          ...prevCache,
          [cacheKey]: videoList
        }));  
        setTimeout(() => {
          setCache(prevCache => {
            const newCache = { ...prevCache };
            delete newCache[cacheKey];
            return newCache;
          });
        }, 5 * 60 * 1000); 
        
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Request was aborted');
          return;
        }
        console.error('Error fetching YouTube videos:', err);
        setError(`Unable to load YouTube videos for this location: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchYouTubeVideos();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [location, cache]);

  if (loading) {
    return (
      <div className="youtube-videos-container">
        <h3>Location Videos</h3>
        <div className="youtube-loading">
          <div className="youtube-spinner"></div>
          <div className="loading-text">
            <span>Loading weather videos for {location}...</span>
            <small>This should take just a few seconds</small>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
          <div className="youtube-videos-container">
      <h3>Location Videos</h3>
      <div className="youtube-error">Unable to load location videos for this location: {error}</div>
    </div>
    );
  }

  if (videos.length === 0) {
    return (
          <div className="youtube-videos-container">
      <h3>Location Videos</h3>
      <div className="youtube-no-videos">Loading location videos...</div>
    </div>
    );
  }

  return (
    <div className="youtube-videos-container">
      <h3>Location Videos</h3>
      <div className="youtube-videos-grid">
        {videos.map((video) => {
          const videoId = video.id?.videoId || video.id;
          const videoUrl = `${config.YOUTUBE_URL}/watch?v=${videoId}`;
          const title = video.title || video.snippet?.title || 'Untitled Video';
          const description = video.description || video.snippet?.description || '';
          const channelTitle = video.channel_title || video.snippet?.channelTitle || 'Unknown Channel';
          const publishedAt = video.published_at || video.snippet?.publishedAt || new Date().toISOString();
          let thumbnailUrl = '';
          if (video.thumbnail) {
            thumbnailUrl = video.thumbnail;
          } else if (video.snippet?.thumbnails?.medium?.url) {
            thumbnailUrl = video.snippet.thumbnails.medium.url;
          } else if (video.snippet?.thumbnails?.default?.url) {
            thumbnailUrl = video.snippet.thumbnails.default.url;
          } else {
            thumbnailUrl = `${config.PLACEHOLDER_URL}/320x180/ff0000/ffffff?text=No+Thumbnail`;
          }
          
          const handleVideoClick = () => {
            console.log('Video clicked:', videoUrl);
            try {
              window.open(videoUrl, '_blank', 'noopener,noreferrer');
            } catch (error) {
              console.error('Error opening video:', error);
              window.location.href = videoUrl;
            }
          };

          return (
            <div key={videoId} className="youtube-video-card">
              <div className="video-thumbnail" onClick={handleVideoClick}>
                <img 
                  src={thumbnailUrl} 
                  alt={title}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = `${config.PLACEHOLDER_URL}/320x180/ff0000/ffffff?text=Error+Loading+Image`;
                  }}
                />
                <div className="play-button">▶</div>
              </div>
              <div className="video-info">
                <h4 
                  className="video-title" 
                  title={title}
                  onClick={handleVideoClick}
                  style={{ cursor: 'pointer' }}
                >
                  {title.length > 50 
                    ? title.substring(0, 50) + '...' 
                    : title}
                </h4>
                <p className="video-channel">{channelTitle}</p>
                <p className="video-published">
                  {new Date(publishedAt).toLocaleDateString()}
                </p>
                <button 
                  className="watch-video-btn"
                  onClick={handleVideoClick}
                  style={{
                    background: '#ff0000',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginTop: '10px',
                    fontWeight: 'bold'
                  }}
                >
                  Watch on YouTube
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YouTubeVideos;
