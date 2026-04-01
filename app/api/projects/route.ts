import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let projects;

    if (user.role === "ADMIN") {
        projects = await prisma.project.findMany({
            include: {
                manager: { select: { name: true } },
                _count: { select: { tasks: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    } else if (user.role === "MANAGER") {
        projects = await prisma.project.findMany({
            where: { managerId: user.id },
            include: {
                manager: { select: { name: true } },
                _count: { select: { tasks: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    } else {
        projects = await prisma.project.findMany({
            where: {
                members: { some: { userId: user.id } },
            },
            include: {
                manager: { select: { name: true } },
                _count: { select: { tasks: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    return NextResponse.json(projects);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const project = await prisma.project.create({
        data: {
            title: body.title,
            description: body.description || null,
            customer: body.customer || null,
            managerId: body.managerId || session.user.id,
            status: body.status || "NEW",
            priority: body.priority || "MEDIUM",
            startDate: body.startDate ? new Date(body.startDate) : null,
            endDate: body.endDate ? new Date(body.endDate) : null,
            budget: body.budget ? parseFloat(body.budget) : null,
            category: body.category || null,
        },
    });

    return NextResponse.json(project);
}