"""
Demo script to showcase Weather API features for Krishi Jyoti
"""

from .wheatherapi import WeatherService, get_weather, get_forecast, get_agricultural_weather, find_coordinates
import json

def print_json(data, title="Data"):
    """Pretty print JSON data"""
    print(f"\n{'='*50}")
    print(f"  {title}")
    print(f"{'='*50}")
    print(json.dumps(data, indent=2, default=str))

def demo_weather_api():
    """Demonstrate all weather API features"""
    
    print("🌾 Krishi Jyoti Weather API Demo")
    print("=" * 60)
    
    # Test cities (you can modify these)
    test_cities = ["New Delhi", "Mumbai", "Bangalore", "Punjab"]
    
    for city in test_cities[:1]:  # Test with first city to avoid too much output
        try:
            print(f"\n🏙️  Testing with city: {city}")
            
            # 1. Get current weather
            print("\n1️⃣  Current Weather:")
            current_weather = get_weather(city=city)
            print(f"   Temperature: {current_weather['temperature']}°C")
            print(f"   Weather: {current_weather['weather']['description']}")
            print(f"   Humidity: {current_weather['humidity']}%")
            print(f"   Wind Speed: {current_weather['wind_speed']} m/s")
            
            # 2. Get weather forecast
            print("\n2️⃣  5-Day Weather Forecast:")
            forecast = get_forecast(city=city, days=3)  # 3 days for demo
            for day in forecast['forecasts'][:3]:
                print(f"   {day['date']}: {day['temperature']['min']}°C - {day['temperature']['max']}°C")
                print(f"     Precipitation: {day['precipitation_total']}mm")
            
            # 3. Get agricultural weather insights
            print("\n3️⃣  Agricultural Weather Insights:")
            agri_weather = get_agricultural_weather(city=city)
            
            print(f"   📊 Current Conditions:")
            print(f"     Temperature: {agri_weather['current_conditions']['temperature']}°C")
            print(f"     Humidity: {agri_weather['current_conditions']['humidity']}%")
            print(f"     Estimated Soil Temperature: {agri_weather['current_conditions']['soil_temperature_estimate']}°C")
            
            print(f"\n   🚜 Farming Conditions:")
            irrigation = agri_weather['farming_conditions']['irrigation_needed']
            print(f"     Irrigation Need: {irrigation['level']} (Score: {irrigation['score']}/9)")
            print(f"     Pest Risk: {agri_weather['farming_conditions']['pest_risk']}")
            print(f"     Disease Risk: {agri_weather['farming_conditions']['disease_risk']}")
            
            frost_risk = agri_weather['farming_conditions']['frost_risk']
            if frost_risk['has_risk']:
                print(f"     ❄️ Frost Risk: YES - {len(frost_risk['risk_days'])} days at risk")
            else:
                print(f"     ❄️ Frost Risk: No")
            
            optimal_days = agri_weather['farming_conditions']['optimal_activity_time']
            if optimal_days:
                print(f"     ✅ Optimal Activity Days: {', '.join(optimal_days)}")
            else:
                print(f"     ⚠️ No optimal activity days in next 3 days")
            
            print(f"\n   📈 Weekly Agricultural Outlook:")
            outlook = agri_weather['weekly_outlook']
            print(f"     Average Temperature: {outlook['average_temperature']}°C")
            print(f"     Total Precipitation: {outlook['total_precipitation']}mm")
            print(f"     Suitable for Planting: {'Yes' if outlook['suitable_for_planting'] else 'No'}")
            print(f"     Suitable for Harvesting: {'Yes' if outlook['suitable_for_harvesting'] else 'No'}")
            
            # 4. Coordinates lookup
            print("\n4️⃣  Location Coordinates:")
            coords = find_coordinates(city)
            print(f"   📍 {coords['name']}, {coords['country']}")
            print(f"     Latitude: {coords['lat']}")
            print(f"     Longitude: {coords['lon']}")
            
            # Uncomment below to see full JSON output
            # print_json(agri_weather, f"Complete Agricultural Weather Data for {city}")
            
        except Exception as e:
            print(f"❌ Error testing {city}: {e}")
    
    print(f"\n{'='*60}")
    print("✅ Weather API Demo completed successfully!")
    print("\n📝 Usage Examples:")
    print("   - get_weather(city='Delhi')")
    print("   - get_forecast(lat=28.6139, lon=77.2090)")  
    print("   - get_agricultural_weather(city='Mumbai')")
    print("   - find_coordinates('Pune', 'IN')")

if __name__ == "__main__":
    demo_weather_api()