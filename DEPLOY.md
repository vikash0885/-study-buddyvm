# Deployment Guide for Google Cloud Platform (GCP)

## Prerequisites
1. **Google Cloud SDK**: Make sure you have the [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed.
2. **Google Cloud Project**: Create a new project in the [Google Cloud Console](https://console.cloud.google.com/).
3. **Billing**: Enable billing for your project.

## Option 1: Deploy to App Engine (Recommended for Simplicity)

1. **Initialize the App Engine app:**
   ```bash
   gcloud app create
   ```

2. **Set your API Key:**
   Open `app.yaml` and replace `"YOUR_API_KEY_HERE"` with your actual Gemini API Key.
   *Alternatively*, you can run the deployment command with env vars, but editing the file is easier for a start.

3. **Deploy:**
   Run the following command in your terminal:
   ```bash
   gcloud app deploy
   ```
   
4. **View your app:**
   ```bash
   gcloud app browse
   ```

## Option 2: Deploy to Cloud Run (Recommended for Scalability)

1. **Build the container image:**
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/study-buddy
   ```
   *(Replace `YOUR_PROJECT_ID` with your actual project ID)*

2. **Deploy the container:**
   ```bash
   gcloud run deploy study-buddy --image gcr.io/YOUR_PROJECT_ID/study-buddy --platform managed --allow-unauthenticated --set-env-vars GEMINI_API_KEY=YOUR_ACTUAL_KEY
   ```

## Important Note about Data Storage
This application currently uses `users.json` to store user accounts.
**Warning:** On GCP App Engine and Cloud Run, the file system is **ephemeral**. This means if the server restarts (which happens automatically), **all user accounts and history will be deleted**.

For a production app, you should use a database like **Firestore** or **Cloud SQL**.
