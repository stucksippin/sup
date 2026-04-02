import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import ExcelJS from "exceljs";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const projectId = searchParams.get("projectId");

        const timeLogs = await prisma.timeLog.findMany({
            where: {
                ...(from && { date: { gte: new Date(from) } }),
                ...(to && { date: { lte: new Date(to) } }),
                ...(projectId && { task: { projectId } }),
            },
            include: {
                user: { select: { name: true } },
                task: {
                    select: {
                        title: true,
                        plannedHours: true,
                        project: { select: { title: true } },
                    },
                },
            },
            orderBy: [{ user: { name: "asc" } }, { date: "desc" }],
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Трудозатраты");

        sheet.columns = [
            { header: "Сотрудник", key: "user", width: 25 },
            { header: "Проект", key: "project", width: 30 },
            { header: "Задача", key: "task", width: 40 },
            { header: "Дата", key: "date", width: 15 },
            { header: "Часов (факт)", key: "hours", width: 14 },
            { header: "Комментарий", key: "comment", width: 30 },
        ];

        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE2E8F0" },
        };

        timeLogs.forEach((log) => {
            sheet.addRow({
                user: log.user.name,
                project: log.task.project.title,
                task: log.task.title,
                date: new Date(log.date).toLocaleDateString("ru-RU"),
                hours: log.hours,
                comment: log.comment || "",
            });
        });

        // Итоговая строка
        sheet.addRow([]);
        const totalRow = sheet.addRow({
            user: "ИТОГО",
            hours: timeLogs.reduce((s, l) => s + l.hours, 0),
        });
        totalRow.font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="timelogs-report.xlsx"`,
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}