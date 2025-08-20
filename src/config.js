
const config = {
  API_BASE_URL: 'https://wther.paninsight.org',
  
  OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  OPENWEATHER_GEO_URL: 'https://api.openweathermap.org/geo/1.0',
  
  NOMINATIM_URL: 'https://nominatim.openstreetmap.org',
  GOOGLE_MAPS_URL: 'https://maps.google.com',
  GOOGLE_PLACES_URL: 'https://maps.googleapis.com',
  YOUTUBE_URL: 'https://www.youtube.com',
  PLACEHOLDER_URL: 'https://via.placeholder.com',
  
  ENV: process.env.NODE_ENV || 'development'
};
export default config;
