# InKCre Heroku Deployment Guide

This document explains how to deploy the InKCre landing page to Heroku.

## Overview

The InKCre browser extension project includes a simple Flask web application that serves as a landing page. This can be deployed to Heroku to provide information about the extension and links to download it.

## Files for Heroku Deployment

The following files are required for Heroku deployment:

- `app.py` - Flask application that serves the landing page
- `requirements.txt` - Python dependencies (Flask and gunicorn)
- `Procfile` - Tells Heroku how to run the application
- `runtime.txt` - Specifies the Python version to use
- `templates/index.html` - The landing page HTML template

## Deployment Steps

### Prerequisites

1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Create a free [Heroku account](https://signup.heroku.com/)

### Deploy to Heroku

1. **Login to Heroku:**
   ```bash
   heroku login
   ```

2. **Create a new Heroku app:**
   ```bash
   heroku create your-app-name
   # Or let Heroku generate a name:
   heroku create
   ```

3. **Deploy the application:**
   ```bash
   git push heroku main
   ```
   
   Or if you're on a different branch:
   ```bash
   git push heroku your-branch-name:main
   ```

4. **Open your application:**
   ```bash
   heroku open
   ```

### Verify Deployment

After deployment, you can check the application logs:

```bash
heroku logs --tail
```

## Local Testing

To test the application locally before deploying:

1. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Flask app:**
   ```bash
   python app.py
   ```
   
   Or with gunicorn (like Heroku):
   ```bash
   gunicorn app:app
   ```

4. **Visit:** http://localhost:5000

## Application Structure

The Flask application:
- Serves a landing page at the root URL (`/`)
- Provides information about the InKCre browser extension
- Links to the GitHub repository and releases page
- Uses a minimalist black and white design consistent with the extension's aesthetic

## Environment Variables

The application uses the `PORT` environment variable (automatically set by Heroku) to determine which port to listen on. No additional configuration is required.

## Scaling

For a simple landing page, the free Heroku dyno is sufficient. If needed, you can scale up:

```bash
heroku ps:scale web=1
```

## Troubleshooting

If you encounter issues:

1. Check the logs: `heroku logs --tail`
2. Verify the Procfile is correct
3. Ensure all dependencies are in requirements.txt
4. Check that runtime.txt specifies a supported Python version

## Additional Resources

- [Heroku Python Support](https://devcenter.heroku.com/articles/python-support)
- [Getting Started with Python on Heroku](https://devcenter.heroku.com/articles/getting-started-with-python)
- [Deploying Python Applications with Gunicorn](https://devcenter.heroku.com/articles/python-gunicorn)
