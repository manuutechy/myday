import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, body } = await req.json();
    if (!title || !body) {
      return NextResponse.json({ error: "Missing title or body" }, { status: 400 });
    }

    // Retrieve user push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: session.user.id },
    });

    const dispatches = [];
    for (const sub of subscriptions) {
      const subPayload = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth,
          p256dh: sub.p256dh,
        },
      };

      const result = await sendPushNotification(subPayload, title, body);

      // Clean up database if subscription is expired
      if (result.expired) {
        await prisma.pushSubscription.delete({
          where: { id: sub.id },
        });
      }

      dispatches.push(result);
    }

    return NextResponse.json({ success: true, dispatchedCount: dispatches.length, details: dispatches });
  } catch (error: any) {
    console.error("Error dispatching push notifications:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
