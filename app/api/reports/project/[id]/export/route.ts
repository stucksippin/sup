import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import ExcelJS from "exceljs";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const project = await prisma.project.findUnique({
            where: { id: params.id },
            include: {
                manager: { select: { name: true } },
                milestones: true,
                tasks: {
                    include: {
                        assignees: { include: { user: { select: { name: true } } } },
                        timeLogs: true,
                    },
                },
            },
        });

        if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = "СУП";
        workbook.created = new Date();

        const statusLabel: Record<string, string> = {
            NEW: "Новая", IN_PROGRESS: "В работе", ON_REVIEW: "На проверке",
            DONE: "Выполнена", CANCELLED: "Отменена",
        };
        const priorityLabel: Record<string, string> = {
            LOW: "Низкий", MEDIUM: "Средний", HIGH: "Высокий", CRITICAL: "Критический",
        };

        // Лист 1 — Сводка
        const summarySheet = workbook.addWorksheet("Сводка");
        summarySheet.columns = [
            { width: 30 }, { width: 40 },
        ];

        summarySheet.addRow(["Отчёт по проекту", project.title]).font = { bold: true, size: 14 };
        summarySheet.addRow([]);
        summarySheet.addRow(["Руководитель", project.manager.name]);
        summarySheet.addRow(["Дата начала", project.startDate ? new Date(project.startDate).toLocaleDateString("ru-RU") : "—"]);
        summarySheet.addRow(["Дата завершения", project.endDate ? new Date(project.endDate).toLocaleDateString("ru-RU") : "—"]);
        summarySheet.addRow(["Бюджет", project.budget ? `${project.budget.toLocaleString("ru-RU")} ₽` : "—"]);
        summarySheet.addRow([]);

        const totalTasks = project.tasks.length;
        const doneTasks = project.tasks.filter((t) => t.status === "DONE").length;
        const plannedHours = project.tasks.reduce((s, t) => s + (t.plannedHours || 0), 0);
        const factHours = project.tasks.reduce(
            (s, t) => s + t.timeLogs.reduce((ls, l) => ls + l.hours, 0), 0
        );

        summarySheet.addRow(["Всего задач", totalTasks]);
        summarySheet.addRow(["Выполнено задач", doneTasks]);
        summarySheet.addRow(["Прогресс", totalTasks > 0 ? `${Math.round((doneTasks / totalTasks) * 100)}%` : "0%"]);
        summarySheet.addRow(["Плановые трудозатраты (ч)", plannedHours]);
        summarySheet.addRow(["Фактические трудозатраты (ч)", factHours]);
        summarySheet.addRow(["Отклонение (ч)", factHours - plannedHours]);

        // Лист 2 — Задачи
        const tasksSheet = workbook.addWorksheet("Задачи");
        tasksSheet.columns = [
            { header: "Название", key: "title", width: 40 },
            { header: "Статус", key: "status", width: 15 },
            { header: "Приоритет", key: "priority", width: 15 },
            { header: "Исполнители", key: "assignees", width: 30 },
            { header: "Срок", key: "dueDate", width: 15 },
            { header: "План (ч)", key: "plannedHours", width: 12 },
            { header: "Факт (ч)", key: "factHours", width: 12 },
            { header: "Отклонение (ч)", key: "diff", width: 15 },
        ];

        tasksSheet.getRow(1).font = { bold: true };
        tasksSheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE2E8F0" },
        };

        project.tasks.forEach((task) => {
            const fact = task.timeLogs.reduce((s, l) => s + l.hours, 0);
            const planned = task.plannedHours || 0;
            const row = tasksSheet.addRow({
                title: task.title,
                status: statusLabel[task.status] ?? task.status,
                priority: priorityLabel[task.priority] ?? task.priority,
                assignees: task.assignees.map((a) => a.user.name).join(", "),
                dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString("ru-RU") : "—",
                plannedHours: planned,
                factHours: fact,
                diff: fact - planned,
            });

            if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE") {
                row.getCell("dueDate").font = { color: { argb: "FFDC2626" } };
            }
            if (fact > planned && planned > 0) {
                row.getCell("diff").font = { color: { argb: "FFDC2626" } };
            }
        });

        // Лист 3 — Вехи
        const milestonesSheet = workbook.addWorksheet("Вехи");
        milestonesSheet.columns = [
            { header: "Название", key: "title", width: 40 },
            { header: "Плановая дата", key: "plannedDate", width: 18 },
            { header: "Фактическая дата", key: "actualDate", width: 18 },
            { header: "Статус", key: "status", width: 18 },
        ];

        milestonesSheet.getRow(1).font = { bold: true };
        milestonesSheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE2E8F0" },
        };

        const msStatusLabel: Record<string, string> = {
            PLANNED: "Запланирована",
            ACHIEVED: "Достигнута",
            OVERDUE: "Просрочена",
        };

        project.milestones.forEach((m) => {
            milestonesSheet.addRow({
                title: m.title,
                plannedDate: new Date(m.plannedDate).toLocaleDateString("ru-RU"),
                actualDate: m.actualDate ? new Date(m.actualDate).toLocaleDateString("ru-RU") : "—",
                status: msStatusLabel[m.status] ?? m.status,
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="report-${project.id}.xlsx"`,
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}