import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notifyTaskAssigned, notifyTaskStatusChanged } from "@/lib/notifications";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const task = await prisma.task.findUnique({
        where: { id: params.id },
        include: {
            assignees: {
                include: { user: { select: { id: true, name: true } } },
            },
            milestone: { select: { id: true, title: true } },
            subTasks: {
                include: {
                    assignees: {
                        include: { user: { select: { id: true, name: true } } },
                    },
                },
            },
            comments: {
                include: { author: { select: { id: true, name: true } } },
                orderBy: { createdAt: "asc" },
            },
            timeLogs: {
                include: { user: { select: { id: true, name: true } } },
                orderBy: { date: "desc" },
            },
            _count: { select: { comments: true, attachments: true } },
        },
    });

    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(task);
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();

        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true },
        });

        const oldTask = await prisma.task.findUnique({
            where: { id: params.id },
            include: {
                assignees: { select: { userId: true } },
            },
        });

        const task = await prisma.task.update({
            where: { id: params.id },
            data: {
                title: body.title,
                description: body.description || null,
                status: body.status,
                priority: body.priority,
                startDate: body.startDate ? new Date(body.startDate) : null,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
                plannedHours: body.plannedHours ? parseFloat(body.plannedHours) : null,
                milestoneId: body.milestoneId || null,
            },
        });

        // Обновляем исполнителей
        if (body.assigneeIds !== undefined) {
            const oldAssigneeIds = oldTask?.assignees.map((a) => a.userId) ?? [];

            await prisma.taskAssignee.deleteMany({ where: { taskId: params.id } });
            if (body.assigneeIds.length > 0) {
                await prisma.taskAssignee.createMany({
                    data: body.assigneeIds.map((userId: string) => ({
                        taskId: params.id,
                        userId,
                    })),
                });
            }

            // Уведомляем новых исполнителей
            const newAssigneeIds = body.assigneeIds.filter(
                (id: string) => !oldAssigneeIds.includes(id)
            );
            if (newAssigneeIds.length > 0) {
                await notifyTaskAssigned(
                    params.id,
                    task.title,
                    newAssigneeIds,
                    currentUser?.name ?? "Пользователь"
                );
            }
        }

        // Уведомляем при смене статуса
        if (oldTask && body.status && body.status !== oldTask.status) {
            const assigneeIds = oldTask.assignees.map((a) => a.userId);
            await notifyTaskStatusChanged(
                params.id,
                task.title,
                assigneeIds,
                body.status,
                currentUser?.name ?? "Пользователь"
            );
        }

        return NextResponse.json(task);
    } catch (error) {
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.task.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
}