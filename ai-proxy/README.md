# HB Tracker — AI Proxy

This is a tiny serverless function that sits between the HB Tracker app and the Anthropic API. It exists so that the Anthropic API key is never embedded in the Android APK (where anyone could extract it).

## What it does

Receives a POST request from the app, adds the API key from a server-side environment variable, forwards the request to Anthropic, and returns the response.

## Deploying to Vercel (free tier — no credit card needed)

### 1. Get an Anthropic API key

1. Go to https://console.anthropic.com
2. Sign up / sign in
3. Add credits — even $5 covers thousands of meal suggestions
4. Go to API Keys → create a new key. Copy it. **Save it somewhere safe** — Anthropic only shows it once.

### 2. Create a separate GitHub repo for this proxy

You don't strictly need a separate repo — Vercel can deploy a subfolder of an existing repo — but it's cleaner.

1. On GitHub, create a new repo called `hb-tracker-ai-proxy` (Public is fine — there are no secrets in the code itself)
2. In your project on your computer, copy the `ai-proxy` folder out to its own location
3. `cd` into that folder, then:
   ```
   git init
   git add .
   git commit -m "Initial proxy"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/hb-tracker-ai-proxy.git
   git push -u origin main
   ```

### 3. Deploy on Vercel

1. Go to https://vercel.com → sign in with GitHub
2. Click **Add New** → **Project**
3. Pick the `hb-tracker-ai-proxy` repo
4. **Before clicking Deploy**, expand "Environment Variables" and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: (paste the key you got from Anthropic)
5. Click **Deploy**

Wait a minute. When it's done, Vercel gives you a URL like `https://hb-tracker-ai-proxy-yourname.vercel.app`.

Your full proxy URL is that URL with `/api/messages` on the end — for example:
```
https://hb-tracker-ai-proxy-yourname.vercel.app/api/messages
```

### 4. Connect the app

1. Open HB Tracker on your phone
2. Tap "Suggest a meal" on Home
3. Read and accept the disclaimer
4. On the configure screen, paste the full proxy URL
5. Save

The app will remember the URL. You only do this once.

## Cost expectations

Each meal suggestion is ~150-200 input tokens + ~100-200 output tokens via `claude-haiku-4-5`. That's roughly 0.001 USD per suggestion. $5 of credit covers around 5000 suggestions.

Vercel free tier: 100 GB-hours/month of serverless execution. Each call takes ~1-2 seconds. You'd need tens of thousands of calls a month to hit the limit.

## Security notes

- The API key only lives as a Vercel environment variable. It is never in the GitHub repo, never in the APK.
- The proxy is open to anyone who knows the URL. If you want to add a simple shared-secret check, edit `api/messages.js` to require an `x-app-token` header that matches another environment variable, and add the same header to the app's fetch call in `src/aiMeal.js`. For a small pilot deployment this isn't usually necessary.
- Rotate the key if you ever publish a screenshot of the URL, suspect abuse, or move on from a person who knew the URL.
