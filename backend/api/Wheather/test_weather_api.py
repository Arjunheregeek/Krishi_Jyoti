import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_weather_by_city(city_name):
    """
    Get current weather data for a specific city using OpenWeatherMap API
    """
    api_key = os.getenv('weather_api_key')
    
    if not api_key:
        return {"error": "Weather API key not found in environment variables"}
    
    # OpenWeatherMap Current Weather API endpoint
    base_url = "http://api.openweathermap.org/data/2.5/weather"
    
    # Parameters for the API request
    params = {
        'q': city_name,
        'appid': api_key,
        'units': 'metric'  # Use Celsius, change to 'imperial' for Fahrenheit
    }
    
    try:
        # Make API request
        response = requests.get(base_url, params=params)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        # Parse JSON response
        data = response.json()
        
        # Extract relevant weather information
        weather_info = {
            'city': data['name'],
            'country': data['sys']['country'],
            'temperature': data['main']['temp'],
            'feels_like': data['main']['feels_like'],
            'humidity': data['main']['humidity'],
            'pressure': data['main']['pressure'],
            'description': data['weather'][0]['description'],
            'main': data['weather'][0]['main'],
            'wind_speed': data['wind']['speed'],
            'visibility': data.get('visibility', 'N/A')
        }
        
        return weather_info
        
    except requests.exceptions.RequestException as e:
        return {"error": f"Request failed: {str(e)}"}
    except KeyError as e:
        return {"error": f"Unexpected response format: {str(e)}"}
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}

def get_weather_by_coordinates(lat, lon):
    """
    Get current weather data for specific coordinates using OpenWeatherMap API
    """
    api_key = os.getenv('weather_api_key')
    
    if not api_key:
        return {"error": "Weather API key not found in environment variables"}
    
    # OpenWeatherMap Current Weather API endpoint
    base_url = "http://api.openweathermap.org/data/2.5/weather"
    
    # Parameters for the API request
    params = {
        'lat': lat,
        'lon': lon,
        'appid': api_key,
        'units': 'metric'
    }
    
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        weather_info = {
            'city': data['name'],
            'country': data['sys']['country'],
            'coordinates': {'lat': data['coord']['lat'], 'lon': data['coord']['lon']},
            'temperature': data['main']['temp'],
            'feels_like': data['main']['feels_like'],
            'humidity': data['main']['humidity'],
            'pressure': data['main']['pressure'],
            'description': data['weather'][0]['description'],
            'main': data['weather'][0]['main'],
            'wind_speed': data['wind']['speed'],
            'visibility': data.get('visibility', 'N/A')
        }
        
        return weather_info
        
    except requests.exceptions.RequestException as e:
        return {"error": f"Request failed: {str(e)}"}
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}

def test_api_key():
    """
    Test if the API key is working by making a simple request
    """
    print("Testing OpenWeatherMap API key...")
    print("-" * 40)
    
    # Test with a well-known city
    test_city = "London"
    result = get_weather_by_city(test_city)
    
    if "error" in result:
        print(f"❌ API test failed: {result['error']}")
        return False
    else:
        print("✅ API key is working!")
        print(f"Test city: {result['city']}, {result['country']}")
        print(f"Temperature: {result['temperature']}°C")
        print(f"Weather: {result['description']}")
        return True

if __name__ == "__main__":
    # Test the API key first
    if test_api_key():
        print("\n" + "=" * 50)
        print("Weather API Test - Enter cities to check weather")
        print("Type 'quit' to exit")
        print("=" * 50)
        
        while True:
            city = input("\nEnter city name: ").strip()
            
            if city.lower() in ['quit', 'exit', 'q']:
                print("Goodbye!")
                break
            
            if city:
                print(f"\nFetching weather for {city}...")
                weather = get_weather_by_city(city)
                
                if "error" in weather:
                    print(f"❌ Error: {weather['error']}")
                else:
                    print(f"\n🌡️  Weather in {weather['city']}, {weather['country']}")
                    print(f"Temperature: {weather['temperature']}°C (feels like {weather['feels_like']}°C)")
                    print(f"Condition: {weather['main']} - {weather['description']}")
                    print(f"Humidity: {weather['humidity']}%")
                    print(f"Pressure: {weather['pressure']} hPa")
                    print(f"Wind Speed: {weather['wind_speed']} m/s")
                    if weather['visibility'] != 'N/A':
                        print(f"Visibility: {weather['visibility']} meters")
            else:
                print("Please enter a valid city name.")