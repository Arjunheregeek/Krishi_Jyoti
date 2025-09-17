import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_weather_by_city(city_name):
    api_key = os.getenv('weather_api_key')
    if not api_key:
        return {"error": "Weather API key not found"}

    # --- Part 1: Get coordinates for the city ---
    geo_url = "http://api.openweathermap.org/geo/1.0/direct"
    geo_params = {'q': city_name, 'limit': 1, 'appid': api_key}
    
    try:
        response = requests.get(geo_url, params=geo_params)
        response.raise_for_status()
        geo_data = response.json()
        if not geo_data:
            return {"error": f"City '{city_name}' not found."}
        lat, lon = geo_data[0]['lat'], geo_data[0]['lon']

    except requests.exceptions.RequestException as e:
        return {"error": f"Geocoding request failed: {e}"}

    # --- Part 2: Use coordinates to get daily forecast with rainfall ---
    one_call_url = "https://api.openweathermap.org/data/3.0/onecall"
    one_call_params = {
        'lat': lat,
        'lon': lon,
        'appid': api_key,
        'units': 'metric',
        'exclude': 'current,minutely,hourly,alerts' # We only need the daily forecast
    }

    try:
        response = requests.get(one_call_url, params=one_call_params)
        response.raise_for_status()
        data = response.json()

        # Extract today's rainfall (or 0 if not present)
        # 'rain' is the predicted rainfall in mm for the day
        daily_forecast = data.get('daily', [{}])[0]
        rainfall_mm = daily_forecast.get('rain', 0) 

        weather_info = {
            'temperature': daily_forecast.get('temp', {}).get('day', 25), # Use average day temp
            'humidity': daily_forecast.get('humidity', 70),
            'rainfall': rainfall_mm  # This is the key addition!
        }
        return weather_info

    except requests.exceptions.RequestException as e:
        return {"error": f"One Call API request failed: {e}"}
    except (KeyError, IndexError) as e:
        return {"error": f"Unexpected API response format: {e}"}