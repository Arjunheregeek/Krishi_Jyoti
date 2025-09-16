# Crop Recommendation System 

This document provides a complete guide for the Crop Recommendation system, including input feature units, statistics, crop preferences, and seasonal crop guidance.

---

## 1. Dataset Feature Summary

| Feature       | Description                           | Unit          | Min Value | Max Value | Mean Value |
|---------------|---------------------------------------|---------------|-----------|-----------|------------|
| N             | Nitrogen content in soil               | kg/ha         | ~0        | ~140      | 50.55      |
| P             | Phosphorus content in soil             | kg/ha         | ~0        | ~140      | 53.36      |
| K             | Potassium content in soil              | kg/ha         | ~0        | ~205      | 48.15      |
| temperature   | Average temperature of region         | °C            | ~8        | ~45       | 25.62      |
| humidity      | Average relative humidity             | %             | ~10       | ~100      | 71.48      |
| ph            | Soil pH (acidity/alkalinity)          | pH scale 0-14 | ~3.5      | ~9        | 6.47       |
| rainfall      | Annual rainfall                        | mm            | ~20       | ~300      | 103.46     |
| label         | Crop name (target variable)           | —             | —         | —         | —          |

> Note: Values are approximate based on the training dataset.

---

## 2. Crops Requiring Extreme Soil/Climate Conditions

| Condition                                | Crops                              |
|------------------------------------------|------------------------------------|
| Very high Nitrogen content                | cotton                             |
| Very high Phosphorus content              | grapes, apple                      |
| Very high Potassium content               | grapes, apple                      |
| Very high Rainfall                        | rice, papaya, coconut              |
| Very low Temperature                      | grapes                             |
| Very high Temperature                     | grapes, papaya                     |
| Very low Humidity                         | chickpea, kidneybeans              |
| Very low pH                               | mothbeans                          |
| Very high pH                              | mothbeans                          |

---

## 3. Seasonal Crop Suitability

| Season       | Suitable Crops                                      |
|--------------|---------------------------------------------------|
| Summer       | pigeonpeas, mothbeans, blackgram, mango, grapes, orange, papaya |
| Winter       | maize, pigeonpeas, lentil, pomegranate, grapes, orange          |
| Rainy        | rice, papaya, coconut                                           |

> These are crops most likely to thrive in the respective seasons based on temperature, humidity, and rainfall data.

---

## 4. Crop Labels Available

- rice  
- maize  
- chickpea  
- kidneybeans  
- lentil  
- pigeonpeas  
- mothbeans  
- mungbean  
- blackgram  
- adzuki bean  
- broadbean  
- cowpea  
- horsegram  
- soybean  
- banana  
- papaya  
- coconut  
- apple  
- orange  
- peach  
- mango  
- cotton  
- grapes  
- pomegranate  

> These are all the crops included in the dataset and recognized by the model.

---

## 5. Guidance for Farmers

1. **N, P, K:** Input your soil nutrient levels in **kg/ha**.  
2. **Temperature:** Provide the **average regional temperature** in °C.  
3. **Humidity:** Provide **average relative humidity** in %.  
4. **pH:** Soil pH (0–14 scale). Ideal range for most crops is 5–8.  
5. **Rainfall:** Provide **annual rainfall in mm**.  
6. **Missing Inputs:** If you do not know a value, the system can automatically use the **dataset average**.

---

## 6. Example Usage

| Inputs (Example)                   | Description                                    |
|-----------------------------------|------------------------------------------------|
| N=120, P=90, K=80, temperature=25 | Partial input; missing features auto-filled   |
| N=None, P=50, K=None, temperature=30 | None values replaced by averages             |
| All inputs unknown                 | Model predicts based on **average dataset values** |

> The system will return **top suitable crops** for the given conditions. Multiple crops may be suggested for better decision-making.

---

## 7. Notes

- Always use **soil testing** for accurate N, P, K, and pH values.  
- Model recommendations are based on historical data trends; **local microclimates, pests, and soil conditions** may influence results.  
- Use recommendations as a **guide to narrow down suitable crops**, not as the sole deciding factor.  
- Seasonal crop guidance helps plan **summer, winter, and rainy season cultivation** effectively.

---
