import React, { useState, useEffect, useRef } from 'react';
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
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      // Check cache first
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
        
        // Use the new direct endpoint - much faster!
        const encodedLocation = encodeURIComponent(location);
        const apiUrl = `http://localhost:5000/api/youtube/direct/${encodedLocation}`;
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
        setVideos(videoList);
        
        // Cache the results for 5 minutes
        setCache(prevCache => ({
          ...prevCache,
          [cacheKey]: videoList
        }));
        
        // Clear cache after 5 minutes
        setTimeout(() => {
          setCache(prevCache => {
            const newCache = { ...prevCache };
            delete newCache[cacheKey];
            return newCache;
          });
        }, 5 * 60 * 1000); // 5 minutes
        
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

    // Cleanup function
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
            <span>Loading videos for {location}...</span>
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
        <div className="youtube-error">{error}</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="youtube-videos-container">
        <h3>Location Videos</h3>
        <div className="youtube-no-videos">Loading...</div>
      </div>
    );
  }

  return (
    <div className="youtube-videos-container">
      <h3>Location Videos</h3>
      <div className="youtube-videos-grid">
        {videos.map((video) => {
          const videoId = video.id?.videoId || video.id;
          const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
          
          const handleVideoClick = () => {
            console.log('Video clicked:', videoUrl);
            try {
              window.open(videoUrl, '_blank', 'noopener,noreferrer');
            } catch (error) {
              console.error('Error opening video:', error);
              // Fallback: try to open in same window
              window.location.href = videoUrl;
            }
          };

          return (
            <div key={videoId} className="youtube-video-card">
              <div className="video-thumbnail" onClick={handleVideoClick}>
                <img 
                  src={video.snippet.thumbnails.medium.url} 
                  alt={video.snippet.title}
                  loading="lazy"
                />
                <div className="play-button">▶</div>
              </div>
              <div className="video-info">
                <h4 
                  className="video-title" 
                  title={video.snippet.title}
                  onClick={handleVideoClick}
                  style={{ cursor: 'pointer' }}
                >
                  {video.snippet.title.length > 50 
                    ? video.snippet.title.substring(0, 50) + '...' 
                    : video.snippet.title}
                </h4>
                <p className="video-channel">{video.snippet.channelTitle}</p>
                <p className="video-published">
                  {new Date(video.snippet.publishedAt).toLocaleDateString()}
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
