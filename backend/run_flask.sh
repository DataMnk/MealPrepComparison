#!/bin/bash
echo "Starting Flask server..."

# Check if venv exists, if not create it
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate the virtual environment
source venv/bin/activate

# Install requirements
echo "Installing dependencies..."
pip install -r requirements.txt

# Run the Flask application
echo "Starting server..."
python3 app.py

# Note: The script will not reach here until the server is stopped
# Deactivate the virtual environment
deactivate 