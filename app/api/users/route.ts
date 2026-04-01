import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role");

    const roles = roleParam ? roleParam.split(",") : [];

    const users = await prisma.user.findMany({
        where: {
            isActive: true,
            ...(roles.length > 0 && { role: { in: roles as any[] } }),
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            position: true,
        },
        orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
}