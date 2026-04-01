import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const project = await prisma.project.findUnique({
        where: { id: params.id },
        include: {
            manager: { select: { id: true, name: true } },
            members: {
                include: { user: { select: { id: true, name: true } } },
            },
            milestones: true,
            _count: { select: { tasks: true } },
        },
    });

    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(project);
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const project = await prisma.project.update({
        where: { id: params.id },
        data: {
            title: body.title,
            description: body.description || null,
            customer: body.customer || null,
            managerId: body.managerId,
            status: body.status,
            priority: body.priority,
            startDate: body.startDate ? new Date(body.startDate) : null,
            endDate: body.endDate ? new Date(body.endDate) : null,
            budget: body.budget ? parseFloat(body.budget) : null,
            category: body.category || null,
        },
    });

    return NextResponse.json(project);
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.project.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
}