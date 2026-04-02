import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const isAdmin = user.role === "ADMIN";
        const isManager = user.role === "MANAGER";

        const projectFilter = isAdmin
            ? {}
            : isManager
                ? { managerId: user.id }
                : { members: { some: { userId: user.id } } };

        const taskFilter = isAdmin
            ? {}
            : isManager
                ? { project: { managerId: user.id } }
                : { assignees: { some: { userId: user.id } } };

        const [
            activeProjects,
            totalProjects,
            tasksByStatus,
            overdueTasks,
            upcomingTasks,
            recentTimeLogs,
        ] = await Promise.all([
            prisma.project.count({
                where: { ...projectFilter, status: "IN_PROGRESS" },
            }),
            prisma.project.count({
                where: projectFilter,
            }),
            prisma.task.groupBy({
                by: ["status"],
                where: taskFilter,
                _count: { id: true },
            }),
            prisma.task.findMany({
                where: {
                    ...taskFilter,
                    dueDate: { lt: new Date() },
                    status: { notIn: ["DONE", "CANCELLED"] },
                },
                include: {
                    project: { select: { id: true, title: true } },
                    assignees: {
                        include: { user: { select: { id: true, name: true } } },
                        take: 1,
                    },
                },
                orderBy: { dueDate: "asc" },
                take: 5,
            }),
            prisma.task.findMany({
                where: {
                    ...taskFilter,
                    dueDate: {
                        gte: new Date(),
                        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                    status: { notIn: ["DONE", "CANCELLED"] },
                },
                include: {
                    project: { select: { id: true, title: true } },
                    assignees: {
                        include: { user: { select: { id: true, name: true } } },
                        take: 1,
                    },
                },
                orderBy: { dueDate: "asc" },
                take: 7,
            }),
            prisma.timeLog.findMany({
                where: { userId: user.id },
                include: {
                    task: { select: { id: true, title: true, projectId: true } },
                },
                orderBy: { date: "desc" },
                take: 5,
            }),
        ]);

        return NextResponse.json({
            stats: { activeProjects, totalProjects, tasksByStatus },
            overdueTasks,
            upcomingTasks,
            recentTimeLogs,
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        return NextResponse.json({ error: "Ошибка получения данных" }, { status: 500 });
    }
}