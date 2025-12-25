# How to Deploy Free (for 2 months+)

I recommend **Render.com** because it allows you to deploy both the Backend and Frontend for free.

## Steps to Deploy

1.  **Push your latest code** to GitHub (you already did this!).
2.  **Sign up/Login** to [Render.com](https://render.com).
3.  Click **New +** -> **Blueprint**.
4.  Connect your GitHub account and select your repository (`Spur-AI-Chat`).
5.  Render will automatically detect the `render.yaml` file I just created.
6.  Click **Apply Blueprint**.

## Configuration
During the setup, Render might ask for environment variables:
-   `OPENAI_API_KEY`: Paste your key (`sk-or-v1-...`).

## Important Note about Database
This setup uses SQLite. On Render's **Free Tier**, the file system is ephemeral, meaning **chats will reset if the server restarts** (it spins down after 15 mins of inactivity).
-   This is usually fine for a 2-month demo.
-   If you need permanent data, you would need to use a hosted Postgres (like [Neon.tech](https://neon.tech) - accurate free tier) and update the `DATABASE_URL` variable in Render.

## Frontend Connection
I configured the `render.yaml` to automatically set the `VITE_API_URL` for the frontend to talk to the backend. You might need to update your frontend code slightly if you hardcoded `localhost:3001` (I'll check this for you now).
