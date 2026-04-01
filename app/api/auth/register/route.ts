import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
    name: z.string().min(1),
    surname: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
        }

        const { name, surname, email, password } = parsed.data;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "Email уже используется" }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name: `${name} ${surname}`,
                email,
                passwordHash,
                role: "EXECUTOR",
            },
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}