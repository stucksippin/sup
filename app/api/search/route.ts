import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q")?.trim();

        if (!query || query.length < 2) {
            return NextResponse.json({ projects: [], tasks: [] });
        }

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

        const [projects, tasks] = await Promise.all([
            prisma.project.findMany({
                where: {
                    ...projectFilter,
                    title: { contains: query, mode: "insensitive" },
                },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                },
                take: 5,
            }),

            prisma.task.findMany({
                where: {
                    ...taskFilter,
                    title: { contains: query, mode: "insensitive" },
                },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    projectId: true,
                    project: { select: { title: true } },
                },
                take: 5,
            }),
        ]);

        return NextResponse.json({ projects, tasks });
    } catch (error) {
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}