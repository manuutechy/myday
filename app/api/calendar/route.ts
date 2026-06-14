import { auth } from "@/auth";
import { getTodayCalendarEvents } from "@/lib/google";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await getTodayCalendarEvents(session.user.id);
    
    // Fallback Mock Calendar Data for local dev if OAuth client is not configured
    if (events.length === 0 && process.env.GOOGLE_CLIENT_ID === "your_google_client_id") {
      const today = new Date();
      return NextResponse.json([
        {
          id: "mock-1",
          summary: "Munchify Pitch Review 🍔",
          start: new Date(today.setHours(9, 15, 0, 0)).toISOString(),
          end: new Date(today.setHours(9, 45, 0, 0)).toISOString(),
          htmlLink: "https://calendar.google.com",
        },
        {
          id: "mock-2",
          summary: "Nuru API Alignment Sync 💳",
          start: new Date(today.setHours(11, 0, 0, 0)).toISOString(),
          end: new Date(today.setHours(12, 0, 0, 0)).toISOString(),
          htmlLink: "https://calendar.google.com",
        },
        {
          id: "mock-3",
          summary: "Coffee with Potential Plottwear Partner ☕",
          start: new Date(today.setHours(16, 45, 0, 0)).toISOString(),
          end: new Date(today.setHours(17, 30, 0, 0)).toISOString(),
          htmlLink: "https://calendar.google.com",
        }
      ]);
    }

    return NextResponse.json(events);
  } catch (error: any) {
    console.error("Calendar Route Error:", error);
    return NextResponse.json([], { status: 200 }); // Graceful fallback
  }
}
