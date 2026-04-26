# HB Tracker

A simple, calm Android app that helps pregnant women in Ghana track their haemoglobin (HB) over time and get plain-language advice grounded in local foods (kontomire, beans, kosua, etc.) and WHO pregnancy thresholds.

**Built for:** Mpohor District Maternal & Child Health Unit Home Visit Programme.

## What it does

- Onboards a woman with just her first name (and optional EDD)
- Records HB readings with date and pregnancy week
- Classifies each reading using WHO pregnancy thresholds:
  - Healthy: ≥ 11.0 g/dL
  - Mild anaemia: 10.0–10.9
  - Moderate anaemia: 7.0–9.9
  - Severe anaemia: < 7.0 (urges same-day facility visit)
- Shows the trend over time on a simple line chart
- Gives plain-language advice for each status, with local food references
- All data stays on the phone (Capacitor Preferences). No login, no internet required.

## Tech stack

- React 18 + Vite
- Recharts for the trend chart
- Capacitor 6 (Android target)
- GitHub Actions for cloud APK builds (no Android Studio needed)

---

## Ship to your phone — step by step

### 1. Push to GitHub

```bash
cd hb-tracker
git init
git add .
git commit -m "Initial commit"
git branch -M main
# Create a new repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/hb-tracker.git
git push -u origin main
```

### 2. Wait for the APK build

- Go to your repo on GitHub
- Click the **Actions** tab
- You'll see a workflow called **Build Android APK** running. It takes ~5–8 minutes.
- When it finishes (green check), click into it.

### 3. Download the APK

- Scroll to the bottom of the workflow run page
- Under **Artifacts** you'll see **HB-Tracker-APK** — click it to download a zip
- Unzip it on your phone (or transfer it). You'll get `HB-Tracker.apk`.

### 4. Install on your Android phone

- Open the `.apk` file on your phone
- Android will ask if you want to allow installs from this source — say yes
- Tap **Install**
- Open **HB Tracker** from your home screen

That's it.

---

## Local development (optional)

```bash
npm install
npm run dev          # opens http://localhost:5173
```

To rebuild and sync to Android after changes:

```bash
npm run cap:sync
```

## Notes & caveats

- The APK built by GitHub Actions is a **debug** build — fine for personal use and testing, not for the Play Store. For Play Store you'd add a signed release workflow.
- Advice strings are static and reviewed against general MOH Ghana antenatal principles. They are **not** a substitute for clinical judgement.
- Severe anaemia advice always points the user to a facility — never to self-treat.
