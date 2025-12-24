# Spur AI Support Agent

A "boring makes money" customer engagement chat widget powered by a mockable LLM backend.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite (via Prisma ORM)
- **LLM**: OpenAI (Mock mode enabled if no key provided)

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Install dependencies for the entire monorepo (or separate folders):
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
2. Setup Database:
   ```bash
   cd server
   npx prisma db push
   ```

### Configuration
1. Create a `.env` file in `server/` (optional for demo mode):
   ```env
   OPENAI_API_KEY=your_sk_key_here
   ```
   *If no key is provided, the agent will respond with a static "demo mode" message.*

### Running Locally
You will need two terminals:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```
(Runs on http://localhost:3001)

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
(Runs on http://localhost:5173)

## Architecture
- **Data Model**: Simple `Session` -> `Message[]` relationship using generic `uuid`s.
- **Service Layer**: 
  - `llm.ts`: Encapsulates OpenAI logic. Can be swapped for Anthropic/Others easily.
  - `chat.ts`: Handles database persistence.
- **API**: RESTful `POST /message` (handles full turn) and `GET /history`.

## Trade-offs & Future Improvements
- **Security**: No auth currently. Anyone can create sessions.
- **Scalability**: SQLite is great for dev, but Postgres is better for prod. Code is unrelated to DB engine thanks to Prisma.
- **UX**: Optimistic updates are currently simple. Could add "Agent typing..." real-time streams via WebSockets/SSE.
- **Robustness**: Error handling is basic. We catch 500s but could be more granular.
