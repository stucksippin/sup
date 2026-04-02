import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const project = await prisma.project.findUnique({
            where: { id: params.id },
            include: {
                manager: { select: { name: true } },
                members: { include: { user: { select: { id: true, name: true } } } },
                milestones: true,
                tasks: {
                    include: {
                        assignees: { include: { user: { select: { id: true, name: true } } } },
                        timeLogs: true,
                    },
                },
            },
        });

        if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const totalTasks = project.tasks.length;
        const doneTasks = project.tasks.filter((t) => t.status === "DONE").length;
        const overdueTasks = project.tasks.filter(
            (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
        );

        const tasksByStatus = project.tasks.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const plannedHours = project.tasks.reduce(
            (sum, t) => sum + (t.plannedHours || 0),
            0
        );
        const factHours = project.tasks.reduce(
            (sum, t) => sum + t.timeLogs.reduce((s, l) => s + l.hours, 0),
            0
        );

        const achievedMilestones = project.milestones.filter(
            (m) => m.status === "ACHIEVED"
        );
        const upcomingMilestones = project.milestones.filter(
            (m) => m.status === "PLANNED"
        );

        return NextResponse.json({
            project: {
                id: project.id,
                title: project.title,
                status: project.status,
                priority: project.priority,
                startDate: project.startDate,
                endDate: project.endDate,
                manager: project.manager,
                budget: project.budget,
            },
            stats: {
                totalTasks,
                doneTasks,
                progressPercent: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
                tasksByStatus,
                plannedHours,
                factHours,
                overdueCount: overdueTasks.length,
            },
            overdueTasks: overdueTasks.map((t) => ({
                id: t.id,
                title: t.title,
                dueDate: t.dueDate,
                status: t.status,
                assignees: t.assignees,
            })),
            milestones: {
                achieved: achievedMilestones,
                upcoming: upcomingMilestones,
            },
            tasks: project.tasks.map((t) => ({
                id: t.id,
                title: t.title,
                status: t.status,
                priority: t.priority,
                dueDate: t.dueDate,
                plannedHours: t.plannedHours,
                factHours: t.timeLogs.reduce((s, l) => s + l.hours, 0),
                assignees: t.assignees.map((a) => a.user.name).join(", "),
            })),
        });
    } catch (error) {
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}