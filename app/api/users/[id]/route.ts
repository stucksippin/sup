import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: params.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            position: true,
            skills: true,
            isActive: true,
            createdAt: true,
            _count: {
                select: {
                    taskAssignees: {
                        where: {
                            task: { status: { in: ["NEW", "IN_PROGRESS", "ON_REVIEW"] } },
                        },
                    },
                    managedProjects: true,
                },
            },
        },
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(user);
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!currentUser || currentUser.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const user = await prisma.user.update({
        where: { id: params.id },
        data: {
            name: body.name,
            email: body.email,
            role: body.role,
            position: body.position || null,
            skills: body.skills || [],
            isActive: body.isActive,
        },
    });

    return NextResponse.json(user);
}