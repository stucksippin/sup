import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notifyTaskCommented } from "@/lib/notifications";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();

        const comment = await prisma.comment.create({
            data: {
                taskId: params.id,
                authorId: session.user.id,
                text: body.text,
            },
        });

        // Уведомляем исполнителей
        const task = await prisma.task.findUnique({
            where: { id: params.id },
            include: {
                assignees: { select: { userId: true } },
            },
        });

        if (task) {
            const author = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { name: true },
            });

            await notifyTaskCommented(
                params.id,
                task.title,
                task.assignees.map((a) => a.userId),
                session.user.id,
                author?.name ?? "Пользователь"
            );
        }

        return NextResponse.json(comment);
    } catch (error) {
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}