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

    const comment = await prisma.comment.create({
        data: {
            taskId: params.id,
            authorId: session.user.id,
            text: body.text,
        },
    });

    return NextResponse.json(comment);
}