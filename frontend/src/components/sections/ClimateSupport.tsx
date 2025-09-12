import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Thermometer, 
  Droplets, 
  Wind, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  MapPin,
  Sprout
} from 'lucide-react';

interface ClimateSupportProps {
  currentLanguage: string;
}

interface WeatherData {
  location: string;
  temperature: { current: number; min: number; max: number };
  humidity: number;
  rainfall: { today: number; forecast: number };
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  uvIndex: number;
  soilMoisture: number;
}

interface CropRecommendation {
  crop: string;
  suitability: 'excellent' | 'good' | 'moderate' | 'poor';
  reason: string;
  bestPractices: string[];
  expectedYield: string;
}

interface ClimateAlert {
  type: 'weather' | 'pest' | 'disease' | 'irrigation';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: string;
  validUntil: string;
}

const mockWeatherData: WeatherData = {
  location: 'Punjab, India',
  temperature: { current: 28, min: 22, max: 35 },
  humidity: 65,
  rainfall: { today: 2.5, forecast: 15 },
  windSpeed: 12,
  condition: 'cloudy',
  uvIndex: 6,
  soilMoisture: 45
};

const cropRecommendations: CropRecommendation[] = [
  {
    crop: 'Wheat',
    suitability: 'excellent',
    reason: 'Optimal temperature and soil conditions for winter wheat',
    bestPractices: ['Sow by November 15', 'Use drought-resistant varieties', 'Apply phosphorus fertilizer'],
    expectedYield: '40-45 quintals/hectare'
  },
  {
    crop: 'Mustard',
    suitability: 'good',
    reason: 'Suitable for current climate with moderate water requirements',
    bestPractices: ['Plant in well-drained soil', 'Monitor for aphid infestation', 'Harvest timely to avoid shattering'],
    expectedYield: '12-15 quintals/hectare'
  },
  {
    crop: 'Rice',
    suitability: 'poor',
    reason: 'Not suitable for current season and water availability',
    bestPractices: ['Consider for next kharif season', 'Prepare fields early', 'Arrange adequate water supply'],
    expectedYield: 'Not recommended'
  }
];

const climateAlerts: ClimateAlert[] = [
  {
    type: 'weather',
    severity: 'medium',
    title: 'Heavy Rainfall Expected',
    description: 'Moderate to heavy rainfall predicted in next 3 days (15-25mm)',
    action: 'Ensure proper drainage in fields, postpone spraying activities',
    validUntil: '2024-10-18'
  },
  {
    type: 'pest',
    severity: 'high',
    title: 'Aphid Alert',
    description: 'High humidity favorable for aphid multiplication in mustard crops',
    action: 'Monitor crops regularly, apply neem oil or recommended insecticide',
    validUntil: '2024-10-20'
  }
];

const getConditionIcon = (condition: string) => {
  switch (condition) {
    case 'sunny': return <Sun className="w-6 h-6 text-yellow-500" />;
    case 'cloudy': return <Cloud className="w-6 h-6 text-gray-500" />;
    case 'rainy': return <CloudRain className="w-6 h-6 text-blue-500" />;
    default: return <Cloud className="w-6 h-6 text-gray-500" />;
  }
};

const getSuitabilityColor = (suitability: string) => {
  switch (suitability) {
    case 'excellent': return 'bg-success/10 text-success';
    case 'good': return 'bg-primary/10 text-primary';
    case 'moderate': return 'bg-warning/10 text-warning';
    case 'poor': return 'bg-destructive/10 text-destructive';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low': return 'bg-success/10 text-success border-success/20';
    case 'medium': return 'bg-warning/10 text-warning border-warning/20';
    case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
    default: return 'bg-muted text-muted-foreground border-muted/20';
  }
};

const ClimateSupport = ({ currentLanguage }: ClimateSupportProps) => {
  const [location, setLocation] = useState('Punjab, India');
  const [weatherData, setWeatherData] = useState(mockWeatherData);
  const [selectedCrop, setSelectedCrop] = useState('');

  // Simulate weather updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWeatherData(prev => ({
        ...prev,
        temperature: {
          ...prev.temperature,
          current: prev.temperature.current + (Math.random() - 0.5) * 2
        },
        humidity: Math.max(20, Math.min(90, prev.humidity + (Math.random() - 0.5) * 5))
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getLocationWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation(`Lat: ${position.coords.latitude.toFixed(2)}, Lng: ${position.coords.longitude.toFixed(2)}`);
      });
    }
  };
  return (
    <div className="space-y-6" id="climate">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-primary">Climate-Smart Farming</h2>
        <p className="text-muted-foreground">
          Weather-based recommendations and climate predictions for better farming decisions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Dashboard */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getConditionIcon(mockWeatherData.condition)}
                Current Weather
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {location}
                </div>
                <Button variant="ghost" size="sm" onClick={getLocationWeather}>
                  Update Location
                </Button>
              </div>
            </div>
            <CardDescription>
              Real-time weather data and 7-day forecast for your location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Temperature */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <Thermometer className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{Math.round(weatherData.temperature.current)}°C</div>
                <div className="text-xs text-muted-foreground">Current</div>
              </div>
              <div className="text-center p-3 bg-accent/5 rounded-lg">
                <Droplets className="w-6 h-6 mx-auto mb-2 text-accent" />
                <div className="text-2xl font-bold">{Math.round(weatherData.humidity)}%</div>
                <div className="text-xs text-muted-foreground">Humidity</div>
              </div>
              <div className="text-center p-3 bg-secondary/5 rounded-lg">
                <CloudRain className="w-6 h-6 mx-auto mb-2 text-secondary" />
                <div className="text-2xl font-bold">{weatherData.rainfall.today}mm</div>
                <div className="text-xs text-muted-foreground">Rainfall</div>
              </div>
              <div className="text-center p-3 bg-success/5 rounded-lg">
                <Wind className="w-6 h-6 mx-auto mb-2 text-success" />
                <div className="text-2xl font-bold">{weatherData.windSpeed}km/h</div>
                <div className="text-xs text-muted-foreground">Wind Speed</div>
              </div>
            </div>

            {/* Soil Moisture */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-primary" />
                  Soil Moisture Level
                </span>
                <span className="text-sm font-bold">{weatherData.soilMoisture}%</span>
              </div>
              <Progress value={weatherData.soilMoisture} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {weatherData.soilMoisture > 60 ? 'Optimal for most crops' : 
                 weatherData.soilMoisture > 30 ? 'Moderate - consider irrigation' : 
                 'Low - irrigation recommended'}
              </p>
            </div>

            {/* 7-Day Forecast */}
            <div className="space-y-2">
              <h4 className="font-medium">7-Day Forecast</h4>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({length: 7}, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  return (
                    <div key={i} className="text-center p-2 bg-muted/30 rounded text-xs">
                      <div className="font-medium">{date.getDate()}</div>
                      <Sun className="w-4 h-4 mx-auto my-1 text-yellow-500" />
                      <div>32°/24°</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Climate Alerts */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Climate Alerts
            </CardTitle>
            <CardDescription>
              Important weather and farming advisories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {climateAlerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getSeverityColor(alert.severity)} variant="secondary">
                    {alert.severity} priority
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Valid until {new Date(alert.validUntil).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                <p className="text-xs font-medium">{alert.action}</p>
              </div>
            ))}
            
            <Button variant="outline" className="w-full mt-4">
              View All Alerts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Crop Recommendations */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Climate-Based Crop Recommendations
          </CardTitle>
          <CardDescription>
            Crop suggestions based on current and predicted weather patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cropRecommendations.map((crop, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">{crop.crop}</h4>
                  <Badge className={getSuitabilityColor(crop.suitability)} variant="secondary">
                    {crop.suitability}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{crop.reason}</p>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Expected Yield: </span>
                    <span className={crop.expectedYield === 'Not recommended' ? 'text-destructive' : 'text-success'}>
                      {crop.expectedYield}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Best Practices:</span>
                    <ul className="space-y-1">
                      {crop.bestPractices.slice(0, 2).map((practice, idx) => (
                        <li key={idx} className="text-xs flex items-start gap-1">
                          <div className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                          {practice}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button variant="hero" size="lg">
              Get Detailed Climate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClimateSupport;