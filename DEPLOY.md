# Deployment Guide (Render.com)

This guide shows you how to deploy your full-stack application (Frontend + Backend) to Render.com for free.

## Why Render?
- **Free Tier**: Hosting for web services and static sites.
- **Blueprints**: Deploy both apps from one configuration file (`render.yaml`).
- **Simplicity**: No need to manage separate Vercel/Heroku accounts.

## Prerequisites
1.  **GitHub Account**: You must have this code pushed to GitHub (Done).
2.  **Render Account**: Sign up at [render.com](https://render.com).

---

## Step-by-Step Deployment

### 1. Connect to Render
1.  Log in to your [Render Dashboard](https://dashboard.render.com).
2.  Click the **"New +"** button in the top right.
3.  Select **"Blueprint"**.

### 2. Select Your Repository
1.  Connect your GitHub account if prompted.
2.  Search for your repository name: `Spur-AI-Chat`.
3.  Click **"Connect"**.

### 3. Configure the Blueprint
Render will automatically detect the `render.yaml` file in your repository.
It will show you two services to be created:
1.  `spur-chat-backend` (Web Service)
2.  `spur-chat-client` (Static Site)

**Important**: You will see a section for **Environment Variables**.
1.  Locate `OPENAI_API_KEY` for the backend service.
2.  Paste your actual key: `sk-or-v1-...` (the one you gave me).
    *   *Note: If you don't paste it, the app will run in "Demo Mode" (canned responses).*

### 4. Deploy
1.  Click **"Apply Blueprint"**.
2.  Render will start building both services.
    *   **Backend Build**: installs dependencies, generates database client, compiles TypeScript.
    *   **Frontend Build**: compiles React/Vite into static HTML/CSS/JS.

### 5. Verify
Once the deployment finishes (green "Live" status):
1.  Click on the `spur-chat-client` service.
2.  Click the URL (e.g., `https://spur-chat-client.onrender.com`).
3.  Try sending a message!

---

## Troubleshooting

### "Connection Error" / "ERR_NAME_NOT_RESOLVED"?
This happens if the **Frontend** cannot guess the URL of the **Backend**.
**Fix:**
1.  Go to your Render Dashboard -> Click `spur-chat-backend`.
2.  **Copy** the URL (top left, e.g., `https://spur-chat-backend-xyz.onrender.com`).
3.  Go back to Dashboard -> Click `spur-chat-client` -> **Environment**.
4.  Add a new Environment Variable:
    *   **Key**: `VITE_API_URL`
    *   **Value**: (Paste the backend URL you just copied)
5.  Save Changes. Render will redeploy the frontend automatically.

### Database Reset?
-   **Warning**: On the free tier, the SQLite database file is **deleted** every time the server restarts (spins down after inactivity).
-   This means chat history will vanish after ~15 minutes of no use.
-   **Fix**: For a permanent app, use a managed database like [Neon](https://neon.tech) (Postgres) and change `DATABASE_URL`.
