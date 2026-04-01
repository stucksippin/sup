import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

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

    if (body.assigneeIds !== undefined) {
        await prisma.taskAssignee.deleteMany({ where: { taskId: params.id } });
        if (body.assigneeIds.length > 0) {
            await prisma.taskAssignee.createMany({
                data: body.assigneeIds.map((userId: string) => ({
                    taskId: params.id,
                    userId,
                })),
            });
        }
    }

    return NextResponse.json(task);
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