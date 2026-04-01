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

    const log = await prisma.timeLog.create({
        data: {
            taskId: params.id,
            userId: session.user.id,
            date: new Date(body.date),
            hours: body.hours,
            comment: body.comment || null,
        },
    });

    return NextResponse.json(log);
}