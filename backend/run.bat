@echo off
echo Nutrition AI Backend Startup

rem Check if virtual environment exists, if not create it
if not exist venv (
    echo Creating virtual environment...
    python3106 -m venv venv
)

rem Activate virtual environment
call venv\Scripts\activate

rem Install dependencies
echo Installing dependencies...
python3106 -m pip install -r requirements.txt

rem Run the server
echo Starting the server...
uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause 