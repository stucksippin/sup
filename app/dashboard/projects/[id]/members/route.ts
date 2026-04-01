import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const existing = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: params.id, userId: body.userId } },
    });

    if (existing) {
        return NextResponse.json({ error: "Уже в команде" }, { status: 400 });
    }

    const member = await prisma.projectMember.create({
        data: {
            projectId: params.id,
            userId: body.userId,
            roleInProject: body.role || "EXECUTOR",
        },
        include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json(member);
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    await prisma.projectMember.delete({
        where: { projectId_userId: { projectId: params.id, userId } },
    });

    return NextResponse.json({ success: true });
}