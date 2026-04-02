import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function GET(req: Request) {
    try {
        const now = new Date();
        const in1day = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const in2days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

        // Задачи со сроком через 1 день
        const tasksDue1Day = await prisma.task.findMany({
            where: {
                dueDate: {
                    gte: new Date(in1day.setHours(0, 0, 0, 0)),
                    lte: new Date(in1day.setHours(23, 59, 59, 999)),
                },
                status: { notIn: ["DONE", "CANCELLED"] },
            },
            include: {
                assignees: { select: { userId: true } },
            },
        });

        // Задачи со сроком через 2 дня
        const tasksDue2Days = await prisma.task.findMany({
            where: {
                dueDate: {
                    gte: new Date(in2days.setHours(0, 0, 0, 0)),
                    lte: new Date(in2days.setHours(23, 59, 59, 999)),
                },
                status: { notIn: ["DONE", "CANCELLED"] },
            },
            include: {
                assignees: { select: { userId: true } },
            },
        });

        // Просроченные задачи
        const overdueTasks = await prisma.task.findMany({
            where: {
                dueDate: { lt: now },
                status: { notIn: ["DONE", "CANCELLED"] },
            },
            include: {
                assignees: { select: { userId: true } },
            },
        });

        let count = 0;

        for (const task of tasksDue1Day) {
            for (const { userId } of task.assignees) {
                await createNotification({
                    userId,
                    type: "TASK_DUE_SOON",
                    message: `Задача «${task.title}» истекает завтра`,
                    entityType: "task",
                    entityId: task.id,
                });
                count++;
            }
        }

        for (const task of tasksDue2Days) {
            for (const { userId } of task.assignees) {
                await createNotification({
                    userId,
                    type: "TASK_DUE_SOON",
                    message: `Задача «${task.title}» истекает через 2 дня`,
                    entityType: "task",
                    entityId: task.id,
                });
                count++;
            }
        }

        for (const task of overdueTasks) {
            for (const { userId } of task.assignees) {
                await createNotification({
                    userId,
                    type: "TASK_OVERDUE",
                    message: `Задача «${task.title}» просрочена`,
                    entityType: "task",
                    entityId: task.id,
                });
                count++;
            }
        }

        return NextResponse.json({ success: true, notificationsSent: count });
    } catch (error) {
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}