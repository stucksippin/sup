import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const projectId = searchParams.get("projectId");

        const timeLogs = await prisma.timeLog.findMany({
            where: {
                ...(from && { date: { gte: new Date(from) } }),
                ...(to && { date: { lte: new Date(to) } }),
                ...(projectId && { task: { projectId } }),
            },
            include: {
                user: { select: { id: true, name: true } },
                task: {
                    select: {
                        id: true,
                        title: true,
                        plannedHours: true,
                        projectId: true,
                        project: { select: { id: true, title: true } },
                    },
                },
            },
            orderBy: { date: "desc" },
        });

        // Группируем по пользователям
        const byUser: Record<string, { name: string; totalHours: number; logs: typeof timeLogs }> = {};
        for (const log of timeLogs) {
            if (!byUser[log.userId]) {
                byUser[log.userId] = { name: log.user.name, totalHours: 0, logs: [] };
            }
            byUser[log.userId].totalHours += log.hours;
            byUser[log.userId].logs.push(log);
        }

        return NextResponse.json({ timeLogs, byUser });
    } catch (error) {
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}