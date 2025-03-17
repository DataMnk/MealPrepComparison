# Nutrition AI Backend

This is a FastAPI backend for the Nutrition AI application that processes patient information and queries ChatGPT and Perplexity APIs for nutrition recommendations.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- On Windows:
```bash
venv\Scripts\activate
```
- On macOS/Linux:
```bash
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file:
```bash
cp .env.example .env
```

5. Edit the `.env` file and add your API keys:
```
OPENAI_API_KEY=your_actual_openai_api_key
PERPLEXITY_API_KEY=your_actual_perplexity_api_key
```

## Running the Server

To run the development server:

```bash
uvicorn main:app --reload
```

Or use:

```bash
python main.py
```

The server will be available at http://localhost:8000.

## API Endpoints

- `GET /`: Health check endpoint
- `POST /nutrition-recommendation`: Submit patient information and receive nutrition recommendations from ChatGPT and Perplexity.

## API Documentation

When the server is running, you can access the automatic API documentation at:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc) 