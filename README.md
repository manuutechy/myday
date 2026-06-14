# Myday Routine PWA

Myday is a personal productivity progressive web application (PWA) built specifically for founder and developer Manuu. It integrates Google Calendar, Gmail, custom Sales Pipeline tracker, Habit streak metrics, Pomodoro Focus tools, and daily routine configuration in Nairobi (GMT+3).

---

## Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js v5 (Auth.js) with Google Provider
- **Database:** Prisma ORM with local SQLite support
- **State Store:** Zustand
- **PWA Tooling:** `next-pwa` (Workbox)
- **Notification API:** Web Push Protocol (`web-push` library)

---

## Local Setup & Development

### 1. Clone & Install Dependencies
Navigate into the workspace and run installation:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory (Prisma also reads `.env` for migrations):
```bash
# Copy template variables
cp .env.local.example .env.local
```
Make sure to replace placeholder variables with your Google Cloud Client credentials and generate a NextAuth secret:
```bash
# Generate secret key
openssl rand -hex 32
```

### 3. Database Migration & Seeding
Initialize the SQLite database schema and pre-populate mock user habits:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Development Server
Start the local Next.js dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Web Push VAPID Generation
To generate your own VAPID keys for push notifications, run the following in your shell:
```bash
npx web-push generate-vapid-keys
```
Update your `.env.local` with the returned keys.

---

## PWA Installation
To verify PWA installation locally:
1. Run `npm run build && npm run start` (since service worker caching is disabled in development by default in `next.config.mjs`).
2. Open Chrome DevTools and check the **Application** > **Service Workers** dashboard.
3. Click **Add to Home Screen** inside Chrome or Safari to install Myday on your device.
