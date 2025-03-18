from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Union
import os
import httpx
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Nutrition AI Backend")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define data models based on the frontend types
class DiabetesDetails(BaseModel):
    a1c: Optional[float] = None
    fastingGlucose: Optional[float] = None
    type: Optional[str] = None

class CKDDetails(BaseModel):
    stage: Optional[str] = None
    gfr: Optional[float] = None
    creatinine: Optional[float] = None

class PatientInfo(BaseModel):
    age: int
    weight: float
    height: float
    gender: str
    medicalConditions: List[str]
    activityLevel: str
    diabetesDetails: Optional[DiabetesDetails] = None
    ckdDetails: Optional[CKDDetails] = None
    bmi: Optional[float] = None

class NutritionRequest(BaseModel):
    patientInfo: PatientInfo

class NutritionResponse(BaseModel):
    chatGptResponse: str
    perplexityResponse: str

# Helper function to create prompt for AI services
def create_ai_prompt(patient_info: PatientInfo) -> str:
    # Format basic info
    prompt = f"""
I have patient with the following info and the following chronic conditions, what are their dietary needs in terms of macronutrients and micronutrients. Use only the most updated dietary guidelines according to the patient's profile and possible chronic conditions:

Personal Information:
- Age: {patient_info.age} years
- Gender: {patient_info.gender}
- Weight: {patient_info.weight} kg
- Height: {patient_info.height} cm
- BMI: {patient_info.bmi if patient_info.bmi else 'Not calculated'}
- Activity Level: {patient_info.activityLevel.replace('_', ' ').title()}
    """
    
    # Add medical conditions
    if 'none' in patient_info.medicalConditions:
        prompt += "\n- Medical Conditions: None"
    else:
        prompt += "\n- Medical Conditions: " + ", ".join(condition.replace('_', ' ').title() for condition in patient_info.medicalConditions)
        
        # Add diabetes details if available
        if 'diabetes' in patient_info.medicalConditions and patient_info.diabetesDetails:
            prompt += "\n\nDiabetes Details:"
            if patient_info.diabetesDetails.type:
                prompt += f"\n- Type: {patient_info.diabetesDetails.type}"
            if patient_info.diabetesDetails.a1c:
                prompt += f"\n- A1C: {patient_info.diabetesDetails.a1c}%"
            if patient_info.diabetesDetails.fastingGlucose:
                prompt += f"\n- Fasting Glucose: {patient_info.diabetesDetails.fastingGlucose} mg/dL"
        
        # Add CKD details if available
        if 'chronic_kidney_disease' in patient_info.medicalConditions and patient_info.ckdDetails:
            prompt += "\n\nChronic Kidney Disease Details:"
            if patient_info.ckdDetails.stage:
                prompt += f"\n- Stage: {patient_info.ckdDetails.stage}"
            if patient_info.ckdDetails.gfr:
                prompt += f"\n- GFR: {patient_info.ckdDetails.gfr} mL/min/1.73m²"
            if patient_info.ckdDetails.creatinine:
                prompt += f"\n- Creatinine: {patient_info.ckdDetails.creatinine} mg/dL"
    
    # Add specific request
    prompt += "\n\nBased on this information, please provide a comprehensive nutrition plan including:\n"
    prompt += "1. Recommended macronutrient distribution (proteins, carbohydrates, fats)\n"
    prompt += "2. Specific micronutrient recommendations (vitamins, minerals)\n"
    prompt += "3. Foods to include in the diet\n"
    prompt += "4. Foods to limit or avoid\n"
    prompt += "5. Meal timing and frequency recommendations\n"
    prompt += "Please provide scientific rationale for your recommendations."
    
    return prompt

# Function to call ChatGPT API
async def call_chatgpt(prompt: str) -> str:
    try:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {openai_api_key}"
        }
        
        payload = {
            "model": "gpt-4o-search-preview",
            "messages": [
                {"role": "system", "content": "You are a nutritionist expert who provides detailed nutrition advice based on patient profiles and medical conditions."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 2000
        }
        print(prompt)
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=60.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"ChatGPT API error: {response.text}")
            
            response_data = response.json()
            return response_data["choices"][0]["message"]["content"]
    
    except Exception as e:
        # In a production environment, you'd want to log this error
        return f"Error calling ChatGPT API: {str(e)}"

# Function to call Perplexity API
async def call_perplexity(prompt: str) -> str:
    try:
        perplexity_api_key = os.getenv("PERPLEXITY_API_KEY")
        if not perplexity_api_key:
            raise HTTPException(status_code=500, detail="Perplexity API key not configured")
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {perplexity_api_key}"
        }
        
        payload = {
            "model": "sonar-pro",  # Or another appropriate Perplexity model
            "messages": [
                {"role": "system", "content": "You are a nutritionist expert who provides detailed nutrition advice based on patient profiles and medical conditions."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.perplexity.ai/chat/completions",
                headers=headers,
                json=payload,
                timeout=60.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"Perplexity API error: {response.text}")
            
            response_data = response.json()
            return response_data["choices"][0]["message"]["content"]
    
    except Exception as e:
        # In a production environment, you'd want to log this error
        return f"Error calling Perplexity API: {str(e)}"

@app.get("/")
async def root():
    return {"message": "Nutrition AI Backend API"}

@app.post("/nutrition-recommendation", response_model=NutritionResponse)
async def get_nutrition_recommendation(request: NutritionRequest):
    patient_info = request.patientInfo
    
    # Create prompt for AI services
    prompt = create_ai_prompt(patient_info)
    
    # Call AI services concurrently
    chatgpt_response = await call_chatgpt(prompt)
    perplexity_response = await call_perplexity(prompt)
    
    return NutritionResponse(
        chatGptResponse=chatgpt_response,
        perplexityResponse=perplexity_response
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 