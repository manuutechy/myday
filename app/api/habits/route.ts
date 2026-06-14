import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const habits = await prisma.habit.findMany({
      where: { userId: session.user.id },
      include: {
        logs: {
          where: {
            date: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(habits);
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
    const body = await req.json();

    // 1. Create a custom habit
    if (body.name) {
      const { name, icon, color } = body;
      const habit = await prisma.habit.create({
        data: {
          userId: session.user.id,
          name,
          icon: icon || "Flame",
          color: color || "#FF6B00",
          streak: 0,
          longestStreak: 0,
        },
      });
      return NextResponse.json(habit);
    }

    // 2. Toggle check-in log for today
    const { habitId } = body;
    if (!habitId) {
      return NextResponse.json({ error: "Missing habit ID" }, { status: 400 });
    }

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: session.user.id },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Check if logged today
    const todayLog = await prisma.habitLog.findFirst({
      where: {
        habitId,
        userId: session.user.id,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    if (todayLog) {
      // Already checked in today -> Undo check-in
      await prisma.habitLog.delete({
        where: { id: todayLog.id },
      });

      // Dec streak (min 0)
      const newStreak = Math.max(0, habit.streak - 1);
      const updated = await prisma.habit.update({
        where: { id: habitId },
        data: { streak: newStreak },
      });

      return NextResponse.json({ checkedIn: false, habit: updated });
    } else {
      // Check in for today
      await prisma.habitLog.create({
        data: {
          habitId,
          userId: session.user.id,
          date: new Date(),
        },
      });

      // Calculate streak: check if logged yesterday
      const yesterdayStart = new Date();
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date();
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);

      const yesterdayLog = await prisma.habitLog.findFirst({
        where: {
          habitId,
          userId: session.user.id,
          date: {
            gte: yesterdayStart,
            lte: yesterdayEnd,
          },
        },
      });

      let newStreak = 1;
      if (yesterdayLog) {
        newStreak = habit.streak + 1;
      }

      const longestStreak = Math.max(habit.longestStreak, newStreak);

      const updated = await prisma.habit.update({
        where: { id: habitId },
        data: {
          streak: newStreak,
          longestStreak,
        },
      });

      return NextResponse.json({ checkedIn: true, habit: updated });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
