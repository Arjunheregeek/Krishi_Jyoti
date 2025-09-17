import pickle
import pandas as pd
import numpy as np

try:
    with open('backend\ml\models\crop_recommendation_model.pkl', 'rb') as file:
        model = pickle.load(file)
    print("✅ Model loaded successfully!")
except FileNotFoundError:
    print("🚨 Error: Model file not found. Make sure 'crop_recommendation_model.pkl' is in the correct directory.")
    exit()

new_data = np.array([[100,
                            96,
                                     82,
                                     18,
                                     25,
                                     8,
                                     170]])
print("\nInput data for prediction:\n", new_data)

prediction = model.predict(new_data)

print(f"\n🔮 Model Prediction: {prediction[0]}")