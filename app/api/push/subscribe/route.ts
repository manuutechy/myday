import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { endpoint, keys } = await req.json();
    if (!endpoint || !keys?.auth || !keys?.p256dh) {
      return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
    }

    // Save/upsert the push subscription
    const pushSub = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId: session.user.id,
        auth: keys.auth,
        p256dh: keys.p256dh,
      },
      create: {
        userId: session.user.id,
        endpoint,
        auth: keys.auth,
        p256dh: keys.p256dh,
      },
    });

    return NextResponse.json({ success: true, id: pushSub.id });
  } catch (error: any) {
    console.error("Subscription save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
