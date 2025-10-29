#!/usr/bin/env python3
"""
Flask web application for InKCre Web Extension landing page.
This provides a simple landing page that can be deployed to Heroku.
"""

from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

# Get port from environment variable (Heroku sets this)
PORT = int(os.environ.get('PORT', 5000))

@app.route('/')
def index():
    """Main landing page for InKCre Web Extension."""
    return render_template('index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files."""
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=False)
