import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const milestones = await prisma.milestone.findMany({
        where: { projectId: params.id },
        include: {
            _count: { select: { tasks: true } },
        },
        orderBy: { plannedDate: "asc" },
    });

    return NextResponse.json(milestones);
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const milestone = await prisma.milestone.create({
        data: {
            projectId: params.id,
            title: body.title,
            description: body.description || null,
            plannedDate: new Date(body.plannedDate),
            status: body.status || "PLANNED",
        },
    });

    return NextResponse.json(milestone);
}