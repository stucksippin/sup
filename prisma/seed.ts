import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash("admin123", 10);

    const admin = await prisma.user.upsert({
        where: { email: "admin@sup.ru" },
        update: {},
        create: {
            name: "Администратор",
            email: "admin@sup.ru",
            passwordHash,
            role: "ADMIN",
            isActive: true,
        },
    });

    console.log("Создан администратор:", admin.email);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());