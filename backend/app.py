from flask import Flask, request, jsonify
import os
from openai import OpenAI
import threading

app = Flask(__name__)

# Get API keys from environment variables
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
PERPLEXITY_API_KEY = os.environ.get("PERPLEXITY_API_KEY")

# Base prompt template
BASE_PROMPT = """I have a patient with the following info and the following chronic conditions, what are their dietary needs in terms of macronutrients and micronutrients. Use only the most updated dietary guidelines according to the patient's profile and possible chronic conditions:
Personal Information:
Patient's Age: {age}
Patient's Weight (kg): {weight}
Patient's Height (cm): {height}
Patient's Gender: {gender}
ZIP Code: {zipcode}
Medical Conditions: {conditions}
HbA1c: {hba1c}
Medications: {medications}
"""

def query_perplexity(prompt, result_dict):
    """Query the Perplexity API."""
    try:
        client = OpenAI(api_key=PERPLEXITY_API_KEY, base_url="https://api.perplexity.ai")
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an artificial intelligence assistant and you need to "
                    "engage in a helpful, detailed, polite conversation with a user."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ]
        
        response = client.chat.completions.create(
            model="sonar-pro",
            messages=messages,
        )
        
        result_dict["perplexity"] = response.choices[0].message.content.strip()
    except Exception as e:
        result_dict["perplexity"] = f"Error querying Perplexity API: {str(e)}"

def query_chatgpt(prompt, result_dict):
    """Query the ChatGPT API."""
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="o3-mini",  # Using o3-mini as specified in the instructions
            messages=[{"role": "user", "content": prompt}]
        )
        
        result_dict["chatgpt"] = response.choices[0].message.content.strip()
    except Exception as e:
        result_dict["chatgpt"] = f"Error querying ChatGPT API: {str(e)}"

@app.route('/api/query', methods=['POST'])
def query_apis():
    """
    Endpoint to query both Perplexity and ChatGPT APIs with the form data.
    Expected form data: age, weight, height, gender, zipcode, conditions, hba1c, medications
    """
    try:
        data = request.json
        
        # Format the prompt with the form data
        prompt = BASE_PROMPT.format(
            age=data.get('age', 'N/A'),
            weight=data.get('weight', 'N/A'),
            height=data.get('height', 'N/A'),
            gender=data.get('gender', 'N/A'),
            zipcode=data.get('zipcode', 'N/A'),
            conditions=data.get('conditions', 'N/A'),
            hba1c=data.get('hba1c', 'N/A'),
            medications=data.get('medications', 'N/A')
        )
        
        # Query both APIs concurrently
        results = {}
        threads = [
            threading.Thread(target=query_perplexity, args=(prompt, results)),
            threading.Thread(target=query_chatgpt, args=(prompt, results))
        ]
        
        for thread in threads:
            thread.start()
        
        for thread in threads:
            thread.join()
        
        return jsonify({
            "success": True,
            "perplexity_response": results.get("perplexity", "No response from Perplexity"),
            "chatgpt_response": results.get("chatgpt", "No response from ChatGPT")
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 