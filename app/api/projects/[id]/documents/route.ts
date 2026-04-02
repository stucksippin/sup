import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/png",
    "image/jpeg",
    "application/zip",
];

const MAX_SIZE = 50 * 1024 * 1024; // 50 МБ

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");

        const documents = await prisma.projectDocument.findMany({
            where: {
                projectId: params.id,
                ...(category && { category: category as any }),
            },
            include: {
                uploader: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(documents);
    } catch (error) {
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const category = formData.get("category") as string || "OTHER";

        if (!file) {
            return NextResponse.json({ error: "Файл не выбран" }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: "Недопустимый формат файла" }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "Файл превышает 50 МБ" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "public", "uploads", "documents", params.id);
        await mkdir(uploadDir, { recursive: true });

        const uniqueName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
        const filepath = path.join(uploadDir, uniqueName);
        await writeFile(filepath, buffer);

        const relativePath = `/uploads/documents/${params.id}/${uniqueName}`;

        const document = await prisma.projectDocument.create({
            data: {
                projectId: params.id,
                filename: file.name,
                filepath: relativePath,
                category: category as any,
                size: file.size,
                uploadedBy: session.user.id,
            },
            include: {
                uploader: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json(document);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}