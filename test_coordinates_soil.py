import requests
from geopy.geocoders import Nominatim

def get_coordinates(address_string):
    """
    Takes a text address and returns its (latitude, longitude).
    """
    print(f"📍 Finding coordinates for '{address_string}'...")
    geolocator = Nominatim(user_agent="soil_data_app")
    try:
        location = geolocator.geocode(address_string)
        if location:
            print(f"✅ Coordinates found: ({location.latitude:.2f}, {location.longitude:.2f})")
            return location.latitude, location.longitude
        else:
            print("❌ Could not find coordinates for the address.")
            return None, None
    except Exception as e:
        print(f"An error occurred during geocoding: {e}")
        return None, None

def get_soil_data(lat, lon):
    """
    Calls the SoilGrids API with coordinates and returns predicted soil properties.
    """
    print("\n🔬 Getting soil data from SoilGrids.org API...")
    base_url = "https://rest.isric.org/soilgrids/v2.0/properties/query"
    
    # Note: SoilGrids does not provide direct N, P, K.
    # We query for pH and Organic Carbon (ocd), a key indicator of fertility.
    params = {
        'lon': lon,
        'lat': lat,
        'property': ["phh2o", "ocd"], 
        'depth': "0-5cm", # Topsoil
        'value': 'mean'
    }
    
    try:
        response = requests.get(base_url, params=params)
        if response.status_code == 200:
            print("✅ Successfully fetched soil data.")
            data = response.json()
            properties = data['properties']['layers']
            
            soil_details = {}
            for prop in properties:
                name = prop['name']
                value = prop['depths'][0]['values']['mean']
                
                if name == "phh2o":
                    # SoilGrids returns pH multiplied by 10
                    soil_details['pH'] = value / 10
                elif name == "ocd":
                    # Organic Carbon Density is a proxy for soil health/fertility
                    soil_details['Organic_Carbon_Density'] = value
            
            return soil_details
        else:
            print(f"❌ Error: API returned status code {response.status_code}")
            return None
    except Exception as e:
        print(f"An error occurred during API call: {e}")
        return None

# --- MAIN WORKFLOW ---
if __name__ == "__main__":
    # The location you want to check
    my_location = "Rohta Road, Meerut, Uttar Pradesh"
    
    # Step 1: Get the coordinates
    latitude, longitude = get_coordinates(my_location)
    
    # Step 2: If coordinates were found, get the soil data
    if latitude and longitude:
        soil_data = get_soil_data(latitude, longitude)
        
        if soil_data:
            print("\n--- Predicted Soil Details ---")
            print(f"Soil pH: {soil_data.get('pH', 'N/A'):.2f}")
            print(f"Organic Carbon Density: {soil_data.get('Organic_Carbon_Density', 'N/A')} dg/m³")
            print("\nNote: Direct N, P, K values are not available via this global API. Organic Carbon is a key indicator of soil fertility.")