import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const weekly = searchParams.get("weekly") === "true";

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (weekly) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Tasks stats for the week
      const tasksCreated = await prisma.task.count({
        where: { userId: session.user.id, createdAt: { gte: sevenDaysAgo } },
      });
      const tasksCompleted = await prisma.task.count({
        where: { userId: session.user.id, createdAt: { gte: sevenDaysAgo }, done: true },
      });

      // Habits logs for the week
      const habitLogsCount = await prisma.habitLog.count({
        where: { userId: session.user.id, date: { gte: sevenDaysAgo } },
      });

      // Pipeline activity for the week
      const leadsWon = await prisma.lead.count({
        where: { userId: session.user.id, updatedAt: { gte: sevenDaysAgo }, status: "won" },
      });
      const leadsLost = await prisma.lead.count({
        where: { userId: session.user.id, updatedAt: { gte: sevenDaysAgo }, status: "lost" },
      });

      // Past 7 days reviews
      const pastReviews = await prisma.review.findMany({
        where: { userId: session.user.id, date: { gte: sevenDaysAgo } },
        orderBy: { date: "desc" },
      });

      return NextResponse.json({
        tasksCreated,
        tasksCompleted,
        habitLogsCount,
        leadsWon,
        leadsLost,
        pastReviews,
      });
    }

    // Single check: review for today
    const todayReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    return NextResponse.json(todayReview || null);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { completedTasks, productiveBlock, outreachDone, hobbyProtected, differentWord } = await req.json();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Search existing review for today
    const existing = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    let review;
    if (existing) {
      review = await prisma.review.update({
        where: { id: existing.id },
        data: {
          completedTasks,
          productiveBlock,
          outreachDone: !!outreachDone,
          hobbyProtected: !!hobbyProtected,
          differentWord: differentWord || "",
        },
      });
    } else {
      review = await prisma.review.create({
        data: {
          userId: session.user.id,
          completedTasks,
          productiveBlock,
          outreachDone: !!outreachDone,
          hobbyProtected: !!hobbyProtected,
          differentWord: differentWord || "",
          date: new Date(),
        },
      });
    }

    return NextResponse.json(review);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
