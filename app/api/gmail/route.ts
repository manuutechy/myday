import { auth } from "@/auth";
import { getImportantEmails } from "@/lib/google";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const emails = await getImportantEmails(session.user.id);

    // Fallback Mock Gmail Data for local dev if OAuth client is not configured
    if (emails.length === 0 && process.env.GOOGLE_CLIENT_ID === "your_google_client_id") {
      return NextResponse.json([
        {
          id: "msg-1",
          sender: "Munchify Dev Team",
          subject: "Urgent: Payment Gateway Webhook Failing in Staging",
          date: new Date(Date.now() - 3600000 * 2).toISOString(), // 2h ago
          snippet: "Hey Manuu, the Paystack integration is throwing 500 errors on webhooks. We need to review the signature checking code...",
        },
        {
          id: "msg-2",
          sender: "Nuru Capital Partners",
          subject: "RE: Term Sheet Feedback & Legal Draft",
          date: new Date(Date.now() - 3600000 * 5).toISOString(), // 5h ago
          snippet: "Thank you for the updated projections. We have reviewed the legal terms and have a couple of notes regarding equity vest...",
        },
        {
          id: "msg-3",
          sender: "Plottwear Merchant",
          subject: "New Custom Catalog Request - Urgent Pricing Sync",
          date: new Date(Date.now() - 60000 * 45).toISOString(), // 45m ago
          snippet: "Hi, I checked the Shopify store catalog and I am interested in ordering 150 units of custom embroidery hoodies. What's the timeline?",
        },
      ]);
    }

    return NextResponse.json(emails);
  } catch (error: any) {
    console.error("Gmail Route Error:", error);
    return NextResponse.json([], { status: 200 }); // Graceful fallback
  }
}
