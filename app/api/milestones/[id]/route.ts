import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const milestone = await prisma.milestone.update({
        where: { id: params.id },
        data: {
            title: body.title,
            description: body.description || null,
            plannedDate: new Date(body.plannedDate),
            actualDate: body.actualDate ? new Date(body.actualDate) : null,
            status: body.status,
        },
    });

    return NextResponse.json(milestone);
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.milestone.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
}