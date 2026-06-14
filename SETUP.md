# Google Cloud Console Setup Guide for Myday

Follow these steps to configure Google OAuth credentials and enable required API scopes.

---

### Step 1: Create a Google Cloud Project
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown in the top navigation bar and select **New Project**.
3. Set the **Project name** to `Myday` and click **Create**.

---

### Step 2: Enable Google APIs
1. Navigate to **APIs & Services** > **Library** via the left menu.
2. Search for **Google Calendar API**, select it, and click **Enable**.
3. Return to the Library search, look up **Gmail API**, select it, and click **Enable**.

---

### Step 3: Configure the OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** and click **Create**.
3. Fill in the App Information:
   - **App name**: `Myday`
   - **User support email**: (Your Google Email)
   - **Developer contact information**: (Your Email)
4. Click **Save and Continue**.
5. On the **Scopes** page, click **Add or Remove Scopes** and manually enter the following scopes:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/gmail.readonly`
6. Save and proceed to **Test Users**. Add your own Google email address as a test user so you can log in during local development.
7. Click **Save and Continue**.

---

### Step 4: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** and select **OAuth client ID**.
3. Set **Application type** to `Web application`.
4. In the **Authorized JavaScript origins** section, add:
   - `http://localhost:3000`
5. In the **Authorized redirect URIs** section, add:
   - `http://localhost:3000/api/auth/callback/google`
   - (For production: `https://yourdomain.com/api/auth/callback/google`)
6. Click **Create**.

---

### Step 5: Update Environment Variables
Copy the generated **Client ID** and **Client Secret** and add them to your local environment file:

```env
GOOGLE_CLIENT_ID=your_copied_client_id_here
GOOGLE_CLIENT_SECRET=your_copied_client_secret_here
```
