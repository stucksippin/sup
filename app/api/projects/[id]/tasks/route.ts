import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tasks = await prisma.task.findMany({
        where: {
            projectId: params.id,
            parentTaskId: null,
        },
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
            _count: { select: { comments: true, attachments: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const task = await prisma.task.create({
        data: {
            projectId: params.id,
            title: body.title,
            description: body.description || null,
            status: body.status || "NEW",
            priority: body.priority || "MEDIUM",
            startDate: body.startDate ? new Date(body.startDate) : null,
            dueDate: body.dueDate ? new Date(body.dueDate) : null,
            plannedHours: body.plannedHours ? parseFloat(body.plannedHours) : null,
            milestoneId: body.milestoneId || null,
            parentTaskId: body.parentTaskId || null,
        },
    });

    if (body.assigneeIds && body.assigneeIds.length > 0) {
        await prisma.taskAssignee.createMany({
            data: body.assigneeIds.map((userId: string) => ({
                taskId: task.id,
                userId,
            })),
        });
    }

    return NextResponse.json(task);
}