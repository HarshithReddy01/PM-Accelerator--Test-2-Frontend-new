# Weather Web App - Frontend

A modern, responsive React-based frontend for a comprehensive weather forecasting application. This frontend provides an intuitive user interface for accessing weather data, location services, and additional features like nearby places and YouTube content.

## Live Demo
- **Frontend Deployment**: [https://harshithreddy01.github.io/PM-Accelerator--Test-2-Frontend-new/](https://harshithreddy01.github.io/PM-Accelerator--Test-2-Frontend-new/)
- **Backend Repository**: [https://github.com/HarshithReddy01/PM-Accelerator--Test-2-Backend](https://github.com/HarshithReddy01/PM-Accelerator--Test-2-Backend)

For all backend functionality, please visit the backend repository linked above.

## Features

### Core Weather Functionality
- Real-time weather data display with current conditions
- Detailed weather forecasts with temperature, humidity, and wind speed
- Location-based weather information
- Geolocation support for current location weather
- Nearby places recommendations
- Place review
  
### User Interface
- Modern, responsive design with video background
- Interactive search functionality with location suggestions
- Weather history tracking and management
- Save weather data functionality
- Loading states and error handling

### Advanced Features
- Nearby places discovery with Google Places integration
- YouTube video recommendations for locations
- Interactive maps integration
- Weather data export capabilities
- Location validation and geocoding

### User Experience
- Smooth navigation with React Router
- Responsive design for mobile and desktop
- Accessibility features and keyboard navigation
- Error messages and user feedback
- Loading spinners and progress indicators

## Architecture

### Technology Stack
- **Framework**: React 19.1.1
- **Routing**: React Router DOM 7.8.0
- **Styling**: CSS3 with modern design patterns
- **Icons**: React Icons 5.5.0
- **Build Tool**: Create React App 5.0.1
- **Deployment**: GitHub Pages

### Project Structure
```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.svg
│   └── Assets/
│       └── naturevideo.mp4
├── src/
│   ├── App.js                 # Main application component
│   ├── App.css               # Main application styles
│   ├── index.js              # Application entry point
│   ├── index.css             # Global styles
│   ├── config.js             # Configuration settings
│   └── components/
│       ├── SearchBar.js      # Search functionality
│       ├── WeatherPage.js    # Main weather display
│       ├── WeatherDisplay.js # Weather information display
│       ├── ForecastDisplay.js # Forecast information
│       ├── HourlyForecast.js # Hourly weather breakdown
│       ├── WeatherHistory.js # Weather history management
│       ├── SaveWeather.js    # Save weather functionality
│       ├── NearbyPlaces.js   # Nearby places display
│       ├── YouTubeVideos.js  # YouTube content display
│       ├── LoadingSpinner.js # Loading indicators
│       └── ErrorMessage.js   # Error handling
```

### Component Architecture
- **App.js**: Main application with routing setup
- **SearchBar**: Location search with geolocation support
- **WeatherPage**: Comprehensive weather information display
- **WeatherDisplay**: Current weather conditions
- **ForecastDisplay**: Weather forecast information
- **HourlyForecast**: Detailed hourly weather data
- **WeatherHistory**: Historical weather data management
- **SaveWeather**: Weather data saving functionality
- **NearbyPlaces**: Location-based place discovery
- **YouTubeVideos**: Location-based video content

## Deployment Pipeline

The application follows a complete CI/CD pipeline:

Local Changes → GitHub Commit → Pipeline → Automatic Docker Compose → EC2 Hosting

### Pipeline Flow:
1. **Local Development**: Make changes to the codebase
2. **GitHub Commit**: Push changes to GitHub repository
3. **Automated Pipeline**: GitHub Actions triggers deployment
4. **Docker Containerization**: Application is containerized using Docker
5. **EC2 Deployment**: Container is automatically deployed to AWS EC2 instance
6. **Live Application**: Frontend (GitHub Pages) connects to backend (EC2)

### Technologies Used in Deployment:
- **Containerization**: Docker with Docker Compose
- **Cloud Platform**: AWS EC2 for backend hosting
- **Frontend Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions for automated deployment
- **Database**: AWS RDS MySQL Database
- **Load Balancer**: AWS Application Load Balancer (if configured)

## Prerequisites

Before running this application, ensure you have:

- Node.js 16.0 or higher
- npm or yarn package manager
- Backend API server running (see backend README)
- Modern web browser with JavaScript enabled

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend directory (optional, uses default config):
   ```env
   REACT_APP_API_BASE_URL=http://localhost:5000
   REACT_APP_OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
   REACT_APP_OPENWEATHER_GEO_URL=https://api.openweathermap.org/geo/1.0
   ```

4. **Backend Setup**
   Ensure the backend server is running on `http://localhost:5000` (see backend README)

## Running the Application

### Development Mode
```bash
npm start
```
The application will start on `http://localhost:3000`

### Production Build
```bash
npm run build
```

### Deployment
```bash
npm run deploy
```
This will deploy to GitHub Pages (configured in package.json)

## Application Features

### Homepage
- Video background with a nature theme
- Search bar for location input
- Current location button with geolocation
- Navigation to weather pages

### Weather Display
- Current weather conditions
- Temperature, humidity, wind speed
- Weather icons and descriptions
- Location information with coordinates

### Forecast Information
- Multi-day weather forecasts
- Temperature ranges and conditions
- Weather trend visualization
- Detailed weather parameters

### Hourly Forecast
- Hour-by-hour weather breakdown
- Temperature and condition changes
- Interactive time selection
- Detailed weather metrics

### Weather History
- Saved weather records
- Historical data management
- Data export capabilities
- Record editing and deletion

### Nearby Places
- Location-based place discovery
- Restaurant, hospital, lodging options
- Place details and photos
- Interactive map integration

### YouTube Integration
- Location-based video content
- Weather-related video recommendations
- Video preview and links
- Content categorization

## Configuration

### API Configuration
The application uses a centralized configuration file (`src/config.js`):
- Backend API base URL
- External service endpoints
- Environment-specific settings

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API URL | `http://localhost:5000` |
| `REACT_APP_OPENWEATHER_BASE_URL` | OpenWeather API URL | `https://api.openweathermap.org/data/2.5` |
| `REACT_APP_OPENWEATHER_GEO_URL` | OpenWeather Geocoding URL | `https://api.openweathermap.org/geo/1.0` |

## User Interface

### Design Principles
- Modern, clean interface design
- Responsive layout for all devices
- Accessibility compliance
- Intuitive navigation
- Visual feedback for user actions

### Color Scheme
- Primary colors: Blue tones for weather theme
- Background: Video background with overlay
- Text: High contrast for readability
- Accent colors: Orange and green for weather indicators

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimization
- Touch-friendly interface elements
- Adaptive layout components

## API Integration

### Backend Communication
- RESTful API calls to the backend server
- Error handling and retry logic
- Loading states during API calls
- Data caching for performance

### External Services
- OpenWeatherMap API for weather data
- Google Places API for location services
- YouTube Data API for video content
- Geocoding services for location validation

## Error Handling

### User Experience
- Graceful error messages
- Fallback content when services fail
- Retry mechanisms for failed requests
- Offline state handling

### Error Types
- Network connectivity issues
- API service unavailability
- Invalid location inputs
- Geolocation permission denied

## Performance Optimization

### Code Splitting
- Lazy loading of components
- Route-based code splitting
- Optimized bundle sizes

### Caching Strategy
- API response caching
- Static asset optimization
- Browser caching utilization

## Testing

### Manual Testing
1. Start the development server
2. Test all major user flows
3. Verify responsive design on different devices
4. Check error handling scenarios

### Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

### GitHub Pages
The application is configured for GitHub Pages deployment:
```bash
npm run deploy
```

### Other Platforms
For other deployment platforms:
1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting service

## Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Verify backend server is running
   - Check API_BASE_URL in config.js
   - Ensure CORS is properly configured

2. **Geolocation Not Working**
   - Check browser permissions
   - Ensure HTTPS in production
   - Verify location services are enabled

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

4. **Styling Issues**
   - Clear browser cache
   - Check CSS file paths
   - Verify responsive breakpoints

## Development

### Code Style
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries
- Maintain consistent naming conventions

### Adding Features
1. Create new component in `src/components/`
2. Add corresponding CSS file
3. Update routing in `App.js` if needed
4. Test thoroughly before deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact harshithreddy0117@gmail.com

**Personal Website**: [https://harshithreddy01.github.io/My-Web/](https://harshithreddy01.github.io/My-Web/) 
