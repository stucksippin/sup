import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const period = searchParams.get("period") || "week"; // week | month

        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        if (period === "week") {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            startDate = new Date(now.setDate(diff));
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        // Все активные пользователи
        const users = await prisma.user.findMany({
            where: { isActive: true, role: { in: ["MANAGER", "EXECUTOR"] } },
            select: { id: true, name: true, position: true, role: true },
            orderBy: { name: "asc" },
        });

        // Трудозатраты за период
        const timeLogs = await prisma.timeLog.findMany({
            where: {
                date: { gte: startDate, lte: endDate },
            },
            include: {
                task: {
                    select: {
                        id: true,
                        title: true,
                        projectId: true,
                        project: { select: { id: true, title: true } },
                    },
                },
            },
        });

        // Активные задачи на каждого пользователя
        const activeTasks = await prisma.taskAssignee.findMany({
            where: {
                task: { status: { in: ["NEW", "IN_PROGRESS", "ON_REVIEW"] } },
            },
            include: {
                task: {
                    select: {
                        id: true,
                        title: true,
                        plannedHours: true,
                        dueDate: true,
                        status: true,
                        project: { select: { id: true, title: true } },
                    },
                },
            },
        });

        // Считаем загрузку по пользователям
        const workload = users.map((user) => {
            const userLogs = timeLogs.filter((l) => l.userId === user.id);
            const totalHours = userLogs.reduce((s, l) => s + l.hours, 0);

            const userActiveTasks = activeTasks
                .filter((a) => a.userId === user.id)
                .map((a) => a.task);

            // Группируем по проектам
            const byProject: Record<string, { title: string; hours: number }> = {};
            for (const log of userLogs) {
                const pid = log.task.project.id;
                if (!byProject[pid]) {
                    byProject[pid] = { title: log.task.project.title, hours: 0 };
                }
                byProject[pid].hours += log.hours;
            }

            // Определяем статус загрузки
            const maxHours = period === "week" ? 40 : 160;
            let loadStatus: "normal" | "high" | "overload" = "normal";
            if (totalHours > maxHours) loadStatus = "overload";
            else if (totalHours > maxHours * 0.8) loadStatus = "high";

            return {
                user,
                totalHours,
                loadStatus,
                activeTasksCount: userActiveTasks.length,
                byProject: Object.values(byProject),
                activeTasks: userActiveTasks.slice(0, 5),
            };
        });

        return NextResponse.json({
            workload,
            period,
            startDate,
            endDate,
        });
    } catch (error) {
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}