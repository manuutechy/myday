import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

export async function getGoogleAuthClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account) {
    throw new Error("Google account not connected");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );

  oauth2Client.setCredentials({
    access_token: account.access_token || undefined,
    refresh_token: account.refresh_token || undefined,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  // Automatically listen to token refresh events
  oauth2Client.on("tokens", async (tokens) => {
    const updateData: any = {};
    if (tokens.access_token) {
      updateData.access_token = tokens.access_token;
    }
    if (tokens.expiry_date) {
      updateData.expires_at = Math.floor(tokens.expiry_date / 1000);
    }
    if (tokens.refresh_token) {
      updateData.refresh_token = tokens.refresh_token;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.account.update({
        where: { id: account.id },
        data: updateData,
      });
    }
  });

  return oauth2Client;
}

export async function getTodayCalendarEvents(userId: string) {
  try {
    const auth = await getGoogleAuthClient(userId);
    const calendar = google.calendar({ version: "v3", auth });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    return (response.data.items || []).map((event) => ({
      id: event.id,
      summary: event.summary || "(No Title)",
      start: event.start?.dateTime || event.start?.date || "",
      end: event.end?.dateTime || event.end?.date || "",
      htmlLink: event.htmlLink || "",
    }));
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
}

export async function getImportantEmails(userId: string) {
  try {
    const auth = await getGoogleAuthClient(userId);
    const gmail = google.gmail({ version: "v1", auth });

    const response = await gmail.users.messages.list({
      userId: "me",
      q: "label:important label:unread",
      maxResults: 5,
    });

    const messages = response.data.messages || [];
    const emails = [];

    for (const msg of messages) {
      if (!msg.id) continue;
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
      });

      const headers = detail.data.payload?.headers || [];
      const subject = headers.find((h) => h.name?.toLowerCase() === "subject")?.value || "(No Subject)";
      const from = headers.find((h) => h.name?.toLowerCase() === "from")?.value || "Unknown Sender";
      const dateStr = headers.find((h) => h.name?.toLowerCase() === "date")?.value || "";

      // Extract sender name from email format: "Name <email@example.com>"
      const senderName = from.split("<")[0].trim().replace(/"/g, "") || from;

      emails.push({
        id: msg.id,
        sender: senderName,
        subject: subject,
        date: dateStr,
        snippet: detail.data.snippet || "",
      });
    }

    return emails;
  } catch (error) {
    console.error("Error fetching Gmail emails:", error);
    return [];
  }
}
