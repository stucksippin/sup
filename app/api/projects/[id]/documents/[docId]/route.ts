import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string; docId: string } }
) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const document = await prisma.projectDocument.findUnique({
            where: { id: params.docId },
        });

        if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Удаляем файл с диска
        try {
            const fullPath = path.join(process.cwd(), "public", document.filepath);
            await unlink(fullPath);
        } catch {
            // файл уже удалён — не страшно
        }

        await prisma.projectDocument.delete({ where: { id: params.docId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}