# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/5abfaca0-598e-4153-a0d5-8b19041916d9

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5abfaca0-598e-4153-a0d5-8b19041916d9) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5abfaca0-598e-4153-a0d5-8b19041916d9) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## Divine Echo Backend Configuration

### Environment Variables

This project requires a backend URL to connect to the Divine Echo translation service. Set the following environment variable:

```bash
VITE_BACKEND_URL=https://your-backend-url.com
```

For local development or testing with ngrok:

1. Create a `.env` file in the root directory (copy from `.env.example`):
```bash
cp .env.example .env
```

2. Update the `VITE_BACKEND_URL` with your ngrok URL:
```bash
VITE_BACKEND_URL=https://abc123.ngrok.io
```

3. Restart your dev server:
```bash
npm run dev
```

### Testing the Backend

#### WebSocket Connection Test
The frontend will automatically connect to `wss://your-backend-url.com/ws?lang=en` (or `es`, `es-419`).

Monitor the browser console for connection status:
```
Connecting to WebSocket: wss://abc123.ngrok.io/ws?lang=en
WebSocket connected
```

#### POST Transcript Endpoint Test
Test the `/transcript` endpoint with curl:

```bash
curl -X POST https://abc123.ngrok.io/transcript \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Hello, this is a test message",
    "source_lang": "en",
    "targets": ["es", "es-419"]
  }'
```

Expected response: `200 OK` or appropriate success response.

#### WebSocket Message Format
The backend should send messages in this format:

```json
{
  "text": "Translation text here",
  "audio_base64": "base64_encoded_mp3_audio_data"
}
```

### Features
- **Automatic WebSocket reconnection** with exponential backoff (5s, 10s, 20s, 30s)
- **Audio playback queue** for sequential MP3 audio playback
- **Language switching** automatically reconnects WebSocket with new language
- **Audio output device selection** (when browser supports setSinkId)
- **Offline testing** with "Simulate Message" button
- **Transcript posting** to backend `/transcript` endpoint
