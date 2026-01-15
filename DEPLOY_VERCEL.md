# Deploying to Vercel (Easiest Method)

Since you are having trouble with Google Cloud tools locally, **Vercel** is the easiest alternative. It connects directly to your code and deploys it automatically.

## Method A: Deploy via GitHub (Recommended)

1. **Upload your code to GitHub**
   - Create a new repository on GitHub.
   - Upload all your project files to it.

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com/signup) and sign up (you can use your GitHub account).
   - Click **"Add New Project"** -> **"Project"**.
   - Select your GitHub repository.

3. **Configure Environment Variables**
   - On the deployment screen, find the **"Environment Variables"** section.
   - Add a new variable:
     - **Name:** `GEMINI_API_KEY`
     - **Value:** `AIzaSyDpKERAbNqNymCtPynmA9JvLQYV018fl50` (Or your latest key)

4. **Deploy**
   - Click **"Deploy"**.
   - Your site will live in 1 minute!

---

## Important Note
Vercel is "Serverless", which means **data stored in files (like users and history) will vanish** when the server sleeps.
For a permanent app, you will eventually need a real database (like Firebase or MongoDB). 
But for showing a demo to someone, this method works perfectly!
