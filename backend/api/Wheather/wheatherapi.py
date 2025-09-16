"""
Weather API Service for Krishi Jyoti
Provides weather data using OpenWeatherMap API for agricultural purposes
"""

import os
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class WeatherAPIError(Exception):
    """Custom exception for Weather API errors"""
    pass

class WeatherService:
    """
    Weather service class for handling OpenWeatherMap API requests
    Provides current weather, forecasts, and agricultural-specific weather data
    """
    
    def __init__(self):
        self.api_key = os.getenv('weather_api_key')
        if not self.api_key:
            raise WeatherAPIError("Weather API key not found in environment variables")
        
        self.base_url = "http://api.openweathermap.org/data/2.5"
        self.geo_url = "http://api.openweathermap.org/geo/1.0"
        
    def _make_request(self, url: str, params: Dict) -> Dict:
        """
        Make HTTP request to OpenWeatherMap API with error handling
        """
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            raise WeatherAPIError("Request timed out")
        except requests.exceptions.HTTPError as e:
            if response.status_code == 401:
                raise WeatherAPIError("Invalid API key")
            elif response.status_code == 404:
                raise WeatherAPIError("Location not found")
            else:
                raise WeatherAPIError(f"HTTP Error: {e}")
        except requests.exceptions.RequestException as e:
            raise WeatherAPIError(f"Request failed: {e}")
        except json.JSONDecodeError:
            raise WeatherAPIError("Invalid response format")

    def get_coordinates(self, city: str, country_code: Optional[str] = None) -> Dict:
        """
        Get latitude and longitude coordinates for a city
        """
        query = city
        if country_code:
            query += f",{country_code}"
            
        params = {
            'q': query,
            'limit': 1,
            'appid': self.api_key
        }
        
        url = f"{self.geo_url}/direct"
        data = self._make_request(url, params)
        
        if not data:
            raise WeatherAPIError(f"No coordinates found for {city}")
            
        location = data[0]
        return {
            'lat': location['lat'],
            'lon': location['lon'],
            'name': location['name'],
            'country': location['country'],
            'state': location.get('state', '')
        }

    def get_current_weather(self, city: str = None, lat: float = None, lon: float = None) -> Dict:
        """
        Get current weather data for a location
        """
        params = {
            'appid': self.api_key,
            'units': 'metric'
        }
        
        if city:
            params['q'] = city
        elif lat is not None and lon is not None:
            params['lat'] = lat
            params['lon'] = lon
        else:
            raise WeatherAPIError("Either city name or coordinates (lat, lon) must be provided")
        
        url = f"{self.base_url}/weather"
        data = self._make_request(url, params)
        
        return self._format_current_weather(data)

    def get_weather_forecast(self, city: str = None, lat: float = None, lon: float = None, days: int = 5) -> Dict:
        """
        Get weather forecast for up to 5 days
        """
        params = {
            'appid': self.api_key,
            'units': 'metric'
        }
        
        if city:
            params['q'] = city
        elif lat is not None and lon is not None:
            params['lat'] = lat
            params['lon'] = lon
        else:
            raise WeatherAPIError("Either city name or coordinates (lat, lon) must be provided")
        
        url = f"{self.base_url}/forecast"
        data = self._make_request(url, params)
        
        return self._format_forecast_data(data, days)

    def get_agricultural_weather(self, city: str = None, lat: float = None, lon: float = None) -> Dict:
        """
        Get weather data specifically useful for agriculture
        """
        current = self.get_current_weather(city=city, lat=lat, lon=lon)
        forecast = self.get_weather_forecast(city=city, lat=lat, lon=lon, days=5)
        
        # Calculate agricultural metrics
        agri_data = {
            'location': current['location'],
            'current_conditions': {
                'temperature': current['temperature'],
                'humidity': current['humidity'],
                'precipitation': current.get('precipitation', 0),
                'wind_speed': current['wind_speed'],
                'uv_index': self._get_uv_index(lat, lon) if lat and lon else None,
                'soil_temperature_estimate': self._estimate_soil_temperature(current['temperature'])
            },
            'farming_conditions': {
                'irrigation_needed': self._assess_irrigation_need(current, forecast),
                'pest_risk': self._assess_pest_risk(current, forecast),
                'disease_risk': self._assess_disease_risk(current, forecast),
                'optimal_activity_time': self._get_optimal_activity_time(forecast),
                'frost_risk': self._assess_frost_risk(forecast)
            },
            'weekly_outlook': self._get_weekly_agricultural_outlook(forecast)
        }
        
        return agri_data

    def _format_current_weather(self, data: Dict) -> Dict:
        """Format current weather data"""
        return {
            'location': {
                'name': data['name'],
                'country': data['sys']['country'],
                'coordinates': {
                    'lat': data['coord']['lat'],
                    'lon': data['coord']['lon']
                }
            },
            'timestamp': datetime.fromtimestamp(data['dt']).isoformat(),
            'temperature': data['main']['temp'],
            'feels_like': data['main']['feels_like'],
            'temp_min': data['main']['temp_min'],
            'temp_max': data['main']['temp_max'],
            'humidity': data['main']['humidity'],
            'pressure': data['main']['pressure'],
            'weather': {
                'main': data['weather'][0]['main'],
                'description': data['weather'][0]['description'],
                'icon': data['weather'][0]['icon']
            },
            'wind_speed': data['wind']['speed'],
            'wind_direction': data['wind'].get('deg', 0),
            'cloudiness': data['clouds']['all'],
            'visibility': data.get('visibility', 10000),
            'precipitation': data.get('rain', {}).get('1h', 0) + data.get('snow', {}).get('1h', 0),
            'sunrise': datetime.fromtimestamp(data['sys']['sunrise']).isoformat(),
            'sunset': datetime.fromtimestamp(data['sys']['sunset']).isoformat()
        }

    def _format_forecast_data(self, data: Dict, days: int) -> Dict:
        """Format forecast data"""
        forecasts = []
        current_date = None
        daily_data = {}
        
        for item in data['list'][:days * 8]:  # 8 forecasts per day (3-hour intervals)
            forecast_date = datetime.fromtimestamp(item['dt']).date()
            
            if current_date != forecast_date:
                if current_date is not None:
                    forecasts.append(self._aggregate_daily_forecast(daily_data, current_date))
                current_date = forecast_date
                daily_data = {'temps': [], 'humidity': [], 'precipitation': 0, 'weather': []}
            
            daily_data['temps'].append(item['main']['temp'])
            daily_data['humidity'].append(item['main']['humidity'])
            daily_data['precipitation'] += item.get('rain', {}).get('3h', 0) + item.get('snow', {}).get('3h', 0)
            daily_data['weather'].append(item['weather'][0])
        
        # Add the last day
        if daily_data['temps']:
            forecasts.append(self._aggregate_daily_forecast(daily_data, current_date))
        
        return {
            'location': {
                'name': data['city']['name'],
                'country': data['city']['country'],
                'coordinates': {
                    'lat': data['city']['coord']['lat'],
                    'lon': data['city']['coord']['lon']
                }
            },
            'forecast_days': len(forecasts),
            'forecasts': forecasts
        }

    def _aggregate_daily_forecast(self, daily_data: Dict, date) -> Dict:
        """Aggregate 3-hour forecasts into daily forecast"""
        return {
            'date': date.isoformat(),
            'temperature': {
                'min': min(daily_data['temps']),
                'max': max(daily_data['temps']),
                'avg': sum(daily_data['temps']) / len(daily_data['temps'])
            },
            'humidity_avg': sum(daily_data['humidity']) / len(daily_data['humidity']),
            'precipitation_total': daily_data['precipitation'],
            'weather': daily_data['weather'][0]  # Take the first weather condition
        }

    def _get_uv_index(self, lat: float, lon: float) -> Optional[float]:
        """Get UV index for coordinates (requires separate API call)"""
        try:
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.api_key
            }
            # Note: UV Index API might be premium feature
            # This is a placeholder implementation
            return None
        except:
            return None

    def _estimate_soil_temperature(self, air_temp: float) -> float:
        """Estimate soil temperature based on air temperature"""
        # Simple estimation: soil temp is usually 2-3°C lower than air temp
        return air_temp - 2.5

    def _assess_irrigation_need(self, current: Dict, forecast: Dict) -> Dict:
        """Assess irrigation needs based on weather conditions"""
        recent_precipitation = current.get('precipitation', 0)
        forecast_precipitation = sum(day['precipitation_total'] for day in forecast['forecasts'][:3])
        
        humidity = current['humidity']
        temp = current['temperature']
        
        # Simple irrigation assessment logic
        irrigation_score = 0
        
        if recent_precipitation < 2:  # Less than 2mm in last hour
            irrigation_score += 2
        
        if forecast_precipitation < 5:  # Less than 5mm expected in next 3 days
            irrigation_score += 3
            
        if humidity < 40:  # Low humidity
            irrigation_score += 2
            
        if temp > 30:  # High temperature
            irrigation_score += 2
        
        if irrigation_score >= 6:
            need_level = "High"
        elif irrigation_score >= 4:
            need_level = "Medium"
        else:
            need_level = "Low"
        
        return {
            'level': need_level,
            'score': irrigation_score,
            'factors': {
                'recent_precipitation': recent_precipitation,
                'forecast_precipitation': forecast_precipitation,
                'humidity': humidity,
                'temperature': temp
            }
        }

    def _assess_pest_risk(self, current: Dict, forecast: Dict) -> str:
        """Assess pest risk based on weather conditions"""
        temp = current['temperature']
        humidity = current['humidity']
        
        # High temperature and humidity favor pest activity
        if temp > 25 and humidity > 70:
            return "High"
        elif temp > 20 and humidity > 60:
            return "Medium"
        else:
            return "Low"

    def _assess_disease_risk(self, current: Dict, forecast: Dict) -> str:
        """Assess plant disease risk based on weather conditions"""
        humidity = current['humidity']
        precipitation = current.get('precipitation', 0)
        
        # High humidity and recent precipitation increase disease risk
        if humidity > 80 and precipitation > 1:
            return "High"
        elif humidity > 70:
            return "Medium"
        else:
            return "Low"

    def _get_optimal_activity_time(self, forecast: Dict) -> List[str]:
        """Get optimal times for farming activities"""
        optimal_days = []
        
        for day_forecast in forecast['forecasts'][:3]:
            temp_max = day_forecast['temperature']['max']
            temp_min = day_forecast['temperature']['min']
            precipitation = day_forecast['precipitation_total']
            
            # Optimal conditions: moderate temperature, no precipitation
            if 15 <= temp_max <= 28 and temp_min > 5 and precipitation < 1:
                optimal_days.append(day_forecast['date'])
        
        return optimal_days

    def _assess_frost_risk(self, forecast: Dict) -> Dict:
        """Assess frost risk in the coming days"""
        frost_risk_days = []
        
        for day_forecast in forecast['forecasts']:
            temp_min = day_forecast['temperature']['min']
            if temp_min <= 2:  # Frost risk when temperature drops to 2°C or below
                frost_risk_days.append({
                    'date': day_forecast['date'],
                    'min_temp': temp_min,
                    'risk_level': 'High' if temp_min <= 0 else 'Medium'
                })
        
        return {
            'has_risk': len(frost_risk_days) > 0,
            'risk_days': frost_risk_days
        }

    def _get_weekly_agricultural_outlook(self, forecast: Dict) -> Dict:
        """Get weekly outlook for agricultural planning"""
        total_precipitation = sum(day['precipitation_total'] for day in forecast['forecasts'])
        avg_temp = sum(day['temperature']['avg'] for day in forecast['forecasts']) / len(forecast['forecasts'])
        avg_humidity = sum(day['humidity_avg'] for day in forecast['forecasts']) / len(forecast['forecasts'])
        
        return {
            'average_temperature': round(avg_temp, 1),
            'total_precipitation': round(total_precipitation, 1),
            'average_humidity': round(avg_humidity, 1),
            'suitable_for_planting': 15 <= avg_temp <= 30 and total_precipitation > 5,
            'suitable_for_harvesting': total_precipitation < 10 and avg_humidity < 80
        }

# Convenience functions for easy usage
def get_weather(city: str = None, lat: float = None, lon: float = None) -> Dict:
    """Get current weather for a location"""
    service = WeatherService()
    return service.get_current_weather(city=city, lat=lat, lon=lon)

def get_forecast(city: str = None, lat: float = None, lon: float = None, days: int = 5) -> Dict:
    """Get weather forecast for a location"""
    service = WeatherService()
    return service.get_weather_forecast(city=city, lat=lat, lon=lon, days=days)

def get_agricultural_weather(city: str = None, lat: float = None, lon: float = None) -> Dict:
    """Get agricultural weather data for a location"""
    service = WeatherService()
    return service.get_agricultural_weather(city=city, lat=lat, lon=lon)

def find_coordinates(city: str, country_code: str = None) -> Dict:
    """Find coordinates for a city"""
    service = WeatherService()
    return service.get_coordinates(city, country_code)

if __name__ == "__main__":
    # Example usage
    try:
        # Test with a city
        print("Testing Weather API...")
        weather = get_weather(city="New Delhi")
        print(f"Current weather in {weather['location']['name']}: {weather['temperature']}°C")
        
        # Test agricultural weather
        print("\nGetting agricultural weather data...")
        agri_weather = get_agricultural_weather(city="New Delhi")
        print(f"Irrigation need: {agri_weather['farming_conditions']['irrigation_needed']['level']}")
        print(f"Pest risk: {agri_weather['farming_conditions']['pest_risk']}")
        
    except WeatherAPIError as e:
        print(f"Weather API Error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")