import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string; logId: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.timeLog.delete({ where: { id: params.logId } });

    return NextResponse.json({ success: true });
}