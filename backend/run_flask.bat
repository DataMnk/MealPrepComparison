@echo off
echo Starting Flask server...

REM Check if venv exists, if not create it
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate the virtual environment
call venv\Scripts\activate

REM Install requirements
echo Installing dependencies...
pip install -r requirements.txt

REM Run the Flask application
echo Starting server...
python app.py

REM Deactivate the virtual environment when the server is stopped
call venv\Scripts\deactivate 