import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Начинаем сидирование...");

    // Очищаем базу
    await prisma.notification.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.timeLog.deleteMany();
    await prisma.taskAssignee.deleteMany();
    await prisma.task.deleteMany();
    await prisma.projectMember.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.projectDocument.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    console.log("🗑️ База очищена");

    // Хэши паролей
    const hash = await bcrypt.hash("password123", 10);

    // Пользователи
    const admin = await prisma.user.create({
        data: {
            name: "Дарья Власова",
            email: "admin@sup.ru",
            passwordHash: hash,
            role: "ADMIN",
            position: "Системный администратор",
            skills: ["Управление системой", "Администрирование"],
            isActive: true,
        },
    });

    const manager1 = await prisma.user.create({
        data: {
            name: "Алексей Петров",
            email: "petrov@sup.ru",
            passwordHash: hash,
            role: "MANAGER",
            position: "Руководитель проектов",
            skills: ["Управление проектами", "Scrum", "Agile"],
            isActive: true,
        },
    });

    const manager2 = await prisma.user.create({
        data: {
            name: "Мария Иванова",
            email: "ivanova@sup.ru",
            passwordHash: hash,
            role: "MANAGER",
            position: "Технический директор",
            skills: ["Архитектура", "DevOps", "Python"],
            isActive: true,
        },
    });

    const dev1 = await prisma.user.create({
        data: {
            name: "Иван Сидоров",
            email: "sidorov@sup.ru",
            passwordHash: hash,
            role: "EXECUTOR",
            position: "Frontend разработчик",
            skills: ["React", "TypeScript", "Next.js", "TailwindCSS"],
            isActive: true,
        },
    });

    const dev2 = await prisma.user.create({
        data: {
            name: "Анна Козлова",
            email: "kozlova@sup.ru",
            passwordHash: hash,
            role: "EXECUTOR",
            position: "Backend разработчик",
            skills: ["Node.js", "PostgreSQL", "Prisma", "Docker"],
            isActive: true,
        },
    });

    const dev3 = await prisma.user.create({
        data: {
            name: "Сергей Новиков",
            email: "novikov@sup.ru",
            passwordHash: hash,
            role: "EXECUTOR",
            position: "Fullstack разработчик",
            skills: ["React", "Python", "Django", "PostgreSQL"],
            isActive: true,
        },
    });

    const designer = await prisma.user.create({
        data: {
            name: "Елена Морозова",
            email: "morozova@sup.ru",
            passwordHash: hash,
            role: "EXECUTOR",
            position: "UI/UX Дизайнер",
            skills: ["Figma", "UI/UX", "Прототипирование"],
            isActive: true,
        },
    });

    const observer = await prisma.user.create({
        data: {
            name: "Дмитрий Заказчиков",
            email: "observer@sup.ru",
            passwordHash: hash,
            role: "OBSERVER",
            position: "Представитель заказчика",
            skills: [],
            isActive: true,
        },
    });

    console.log("👥 Пользователи созданы");

    // =====================
    // ПРОЕКТ 1 — В работе
    // =====================
    const project1 = await prisma.project.create({
        data: {
            title: "Корпоративный портал HR",
            description: "Разработка внутреннего портала для управления персоналом. Включает модули найма, онбординга, оценки и обучения сотрудников.",
            status: "IN_PROGRESS",
            priority: "HIGH",
            customer: "ООО Ромашка",
            managerId: manager1.id,
            startDate: new Date("2025-01-15"),
            endDate: new Date("2025-06-30"),
            budget: 2500000,
            category: "IT",
        },
    });

    // Участники проекта 1
    await prisma.projectMember.createMany({
        data: [
            { projectId: project1.id, userId: dev1.id, roleInProject: "EXECUTOR" },
            { projectId: project1.id, userId: dev2.id, roleInProject: "EXECUTOR" },
            { projectId: project1.id, userId: designer.id, roleInProject: "EXECUTOR" },
            { projectId: project1.id, userId: observer.id, roleInProject: "OBSERVER" },
        ],
    });

    // Вехи проекта 1
    const milestone1_1 = await prisma.milestone.create({
        data: {
            projectId: project1.id,
            title: "Дизайн и прототип",
            description: "Разработка дизайн-системы и прототипов всех экранов",
            plannedDate: new Date("2025-02-28"),
            actualDate: new Date("2025-02-25"),
            status: "ACHIEVED",
        },
    });

    const milestone1_2 = await prisma.milestone.create({
        data: {
            projectId: project1.id,
            title: "MVP — модуль найма",
            description: "Запуск базового функционала модуля найма",
            plannedDate: new Date("2025-04-15"),
            status: "PLANNED",
        },
    });

    const milestone1_3 = await prisma.milestone.create({
        data: {
            projectId: project1.id,
            title: "Финальный релиз",
            description: "Полный запуск портала со всеми модулями",
            plannedDate: new Date("2025-06-30"),
            status: "PLANNED",
        },
    });

    // Задачи проекта 1
    const task1_1 = await prisma.task.create({
        data: {
            projectId: project1.id,
            milestoneId: milestone1_1.id,
            title: "Разработать дизайн-систему",
            description: "Создать компонентную библиотеку в Figma: цвета, типографика, кнопки, формы, таблицы",
            status: "DONE",
            priority: "HIGH",
            startDate: new Date("2025-01-20"),
            dueDate: new Date("2025-02-10"),
            plannedHours: 40,
        },
    });

    await prisma.taskAssignee.create({ data: { taskId: task1_1.id, userId: designer.id } });
    await prisma.timeLog.createMany({
        data: [
            { taskId: task1_1.id, userId: designer.id, date: new Date("2025-01-22"), hours: 8, comment: "Работа над цветовой схемой" },
            { taskId: task1_1.id, userId: designer.id, date: new Date("2025-01-25"), hours: 8, comment: "Компоненты кнопок и форм" },
            { taskId: task1_1.id, userId: designer.id, date: new Date("2025-02-01"), hours: 8, comment: "Таблицы и навигация" },
            { taskId: task1_1.id, userId: designer.id, date: new Date("2025-02-07"), hours: 6, comment: "Финальные правки" },
        ],
    });

    const task1_2 = await prisma.task.create({
        data: {
            projectId: project1.id,
            milestoneId: milestone1_2.id,
            title: "Настройка инфраструктуры",
            description: "Настройка CI/CD, Docker, облачного хостинга, базы данных PostgreSQL",
            status: "DONE",
            priority: "HIGH",
            startDate: new Date("2025-01-15"),
            dueDate: new Date("2025-02-01"),
            plannedHours: 24,
        },
    });

    await prisma.taskAssignee.create({ data: { taskId: task1_2.id, userId: dev2.id } });
    await prisma.timeLog.createMany({
        data: [
            { taskId: task1_2.id, userId: dev2.id, date: new Date("2025-01-16"), hours: 8, comment: "Docker и CI/CD" },
            { taskId: task1_2.id, userId: dev2.id, date: new Date("2025-01-20"), hours: 8, comment: "База данных и миграции" },
            { taskId: task1_2.id, userId: dev2.id, date: new Date("2025-01-25"), hours: 6, comment: "Настройка хостинга" },
        ],
    });

    const task1_3 = await prisma.task.create({
        data: {
            projectId: project1.id,
            milestoneId: milestone1_2.id,
            title: "Разработка API авторизации",
            description: "JWT авторизация, роли, middleware, рефреш токены",
            status: "DONE",
            priority: "HIGH",
            startDate: new Date("2025-02-01"),
            dueDate: new Date("2025-02-20"),
            plannedHours: 32,
        },
    });

    await prisma.taskAssignee.create({ data: { taskId: task1_3.id, userId: dev2.id } });
    await prisma.timeLog.createMany({
        data: [
            { taskId: task1_3.id, userId: dev2.id, date: new Date("2025-02-03"), hours: 8 },
            { taskId: task1_3.id, userId: dev2.id, date: new Date("2025-02-10"), hours: 8 },
            { taskId: task1_3.id, userId: dev2.id, date: new Date("2025-02-17"), hours: 8 },
        ],
    });

    const task1_4 = await prisma.task.create({
        data: {
            projectId: project1.id,
            milestoneId: milestone1_2.id,
            title: "Frontend — модуль найма",
            description: "Разработка страниц: список вакансий, карточка кандидата, воронка найма",
            status: "IN_PROGRESS",
            priority: "HIGH",
            startDate: new Date("2025-03-01"),
            dueDate: new Date("2025-04-10"),
            plannedHours: 60,
        },
    });

    await prisma.taskAssignee.createMany({
        data: [
            { taskId: task1_4.id, userId: dev1.id },
            { taskId: task1_4.id, userId: designer.id },
        ],
    });
    await prisma.timeLog.createMany({
        data: [
            { taskId: task1_4.id, userId: dev1.id, date: new Date("2025-03-05"), hours: 8, comment: "Список вакансий" },
            { taskId: task1_4.id, userId: dev1.id, date: new Date("2025-03-12"), hours: 8, comment: "Карточка кандидата" },
            { taskId: task1_4.id, userId: dev1.id, date: new Date("2025-03-19"), hours: 6 },
        ],
    });

    // Подзадачи к task1_4
    const subtask1 = await prisma.task.create({
        data: {
            projectId: project1.id,
            parentTaskId: task1_4.id,
            title: "Страница списка вакансий",
            status: "DONE",
            priority: "MEDIUM",
            dueDate: new Date("2025-03-15"),
            plannedHours: 16,
        },
    });
    await prisma.taskAssignee.create({ data: { taskId: subtask1.id, userId: dev1.id } });

    const subtask2 = await prisma.task.create({
        data: {
            projectId: project1.id,
            parentTaskId: task1_4.id,
            title: "Карточка кандидата",
            status: "IN_PROGRESS",
            priority: "MEDIUM",
            dueDate: new Date("2025-04-01"),
            plannedHours: 24,
        },
    });
    await prisma.taskAssignee.create({ data: { taskId: subtask2.id, userId: dev1.id } });

    const subtask3 = await prisma.task.create({
        data: {
            projectId: project1.id,
            parentTaskId: task1_4.id,
            title: "Воронка найма (Kanban)",
            status: "NEW",
            priority: "HIGH",
            dueDate: new Date("2025-04-10"),
            plannedHours: 20,
        },
    });
    await prisma.taskAssignee.create({ data: { taskId: subtask3.id, userId: dev1.id } });

    const task1_5 = await prisma.task.create({
        data: {
            projectId: project1.id,
            milestoneId: milestone1_2.id,
            title: "Backend — API модуля найма",
            description: "CRUD вакансий, кандидатов, статусов воронки",
            status: "IN_PROGRESS",
            priority: "HIGH",
            startDate: new Date("2025-03-01"),
            dueDate: new Date("2025-04-05"),
            plannedHours: 48,
        },
    });
    await prisma.taskAssignee.create({ data: { taskId: task1_5.id, userId: dev2.id } });
    await prisma.timeLog.createMany({
        data: [
            { taskId: task1_5.id, userId: dev2.id, date: new Date("2025-03-03"), hours: 8 },
            { taskId: task1_5.id, userId: dev2.id, date: new Date("2025-03-10"), hours: 8 },
            { taskId: task1_5.id, userId: dev2.id, date: new Date("2025-03-17"), hours: 8 },
            { taskId: task1_5.id, userId: dev2.id, date: new Date("2025-03-24"), hours: 8 },
        ],
    });

    const task1_6 = await prisma.task.create({
        data: {
            projectId: project1.id,
            milestoneId: milestone1_3.id,
            title: "Тестирование и QA",
            description: "Функциональное тестирование всех модулей, нагрузочное тестирование",
            status: "NEW",
            priority: "MEDIUM",
            dueDate: new Date("2025-06-15"),
            plannedHours: 40,
        },
    });
    await prisma.taskAssignee.createMany({
        data: [
            { taskId: task1_6.id, userId: dev1.id },
            { taskId: task1_6.id, userId: dev2.id },
        ],
    });

    // Комментарии
    await prisma.comment.createMany({
        data: [
            {
                taskId: task1_4.id,
                authorId: manager1.id,
                text: "Хороший прогресс! Не забудьте про адаптивность на мобильных.",
                createdAt: new Date("2025-03-06"),
            },
            {
                taskId: task1_4.id,
                authorId: dev1.id,
                text: "Сделал адаптив для списка вакансий, карточку начну завтра.",
                createdAt: new Date("2025-03-07"),
            },
            {
                taskId: task1_5.id,
                authorId: dev2.id,
                text: "API вакансий готов, начинаю работу над API кандидатов.",
                createdAt: new Date("2025-03-11"),
            },
        ],
    });

    console.log("✅ Проект 1 создан");

    // =====================
    // ПРОЕКТ 2 — Завершён
    // =====================
    const project2 = await prisma.project.create({
        data: {
            title: "Редизайн сайта компании",
            description: "Полный редизайн корпоративного сайта с переходом на новый стек технологий. Next.js, TailwindCSS, headless CMS.",
            status: "COMPLETED",
            priority: "MEDIUM",
            customer: "Внутренний проект",
            managerId: manager2.id,
            startDate: new Date("2024-09-01"),
            endDate: new Date("2024-12-31"),
            budget: 800000,
            category: "Маркетинг",
        },
    });

    await prisma.projectMember.createMany({
        data: [
            { projectId: project2.id, userId: dev1.id, roleInProject: "EXECUTOR" },
            { projectId: project2.id, userId: dev3.id, roleInProject: "EXECUTOR" },
            { projectId: project2.id, userId: designer.id, roleInProject: "EXECUTOR" },
        ],
    });

    const ms2_1 = await prisma.milestone.create({
        data: {
            projectId: project2.id,
            title: "Дизайн готов",
            plannedDate: new Date("2024-10-15"),
            actualDate: new Date("2024-10-12"),
            status: "ACHIEVED",
        },
    });

    const ms2_2 = await prisma.milestone.create({
        data: {
            projectId: project2.id,
            title: "Запуск",
            plannedDate: new Date("2024-12-31"),
            actualDate: new Date("2024-12-28"),
            status: "ACHIEVED",
        },
    });

    const task2_1 = await prisma.task.create({
        data: {
            projectId: project2.id,
            milestoneId: ms2_1.id,
            title: "Дизайн главной страницы",
            status: "DONE",
            priority: "HIGH",
            startDate: new Date("2024-09-05"),
            dueDate: new Date("2024-09-30"),
            plannedHours: 32,
        },
    });
    await prisma.taskAssignee.create({ data: { taskId: task2_1.id, userId: designer.id } });
    await prisma.timeLog.createMany({
        data: [
            { taskId: task2_1.id, userId: designer.id, date: new Date("2024-09-10"), hours: 8 },
            { taskId: task2_1.id, userId: designer.id, date: new Date("2024-09-15"), hours: 8 },
            { taskId: task2_1.id, userId: designer.id, date: new Date("2024-09-20"), hours: 8 },
            { taskId: task2_1.id, userId: designer.id, date: new Date("2024-09-25"), hours: 6 },
        ],
    });

    const task2_2 = await prisma.task.create({
        data: {
            projectId: project2.id,
            milestoneId: ms2_2.id,
            title: "Разработка на Next.js",
            status: "DONE",
            priority: "HIGH",
            startDate: new Date("2024-10-15"),
            dueDate: new Date("2024-12-15"),
            plannedHours: 80,
        },
    });
    await prisma.taskAssignee.createMany({
        data: [
            { taskId: task2_2.id, userId: dev1.id },
            { taskId: task2_2.id, userId: dev3.id },
        ],
    });
    await prisma.timeLog.createMany({
        data: [
            { taskId: task2_2.id, userId: dev1.id, date: new Date("2024-10-20"), hours: 8 },
            { taskId: task2_2.id, userId: dev1.id, date: new Date("2024-10-27"), hours: 8 },
            { taskId: task2_2.id, userId: dev1.id, date: new Date("2024-11-03"), hours: 8 },
            { taskId: task2_2.id, userId: dev3.id, date: new Date("2024-10-21"), hours: 8 },
            { taskId: task2_2.id, userId: dev3.id, date: new Date("2024-10-28"), hours: 8 },
            { taskId: task2_2.id, userId: dev3.id, date: new Date("2024-11-04"), hours: 8 },
        ],
    });

    console.log("✅ Проект 2 создан");

    // =====================
    // ПРОЕКТ 3 — Новый
    // =====================
    const project3 = await prisma.project.create({
        data: {
            title: "Мобильное приложение доставки",
            description: "Разработка мобильного приложения для курьеров и клиентов службы доставки. React Native, Node.js backend.",
            status: "NEW",
            priority: "HIGH",
            customer: "ИП Быстров А.В.",
            managerId: manager1.id,
            startDate: new Date("2025-05-01"),
            endDate: new Date("2025-11-30"),
            budget: 3500000,
            category: "Мобильная разработка",
        },
    });

    await prisma.projectMember.createMany({
        data: [
            { projectId: project3.id, userId: dev1.id, roleInProject: "EXECUTOR" },
            { projectId: project3.id, userId: dev2.id, roleInProject: "EXECUTOR" },
            { projectId: project3.id, userId: dev3.id, roleInProject: "EXECUTOR" },
            { projectId: project3.id, userId: designer.id, roleInProject: "EXECUTOR" },
        ],
    });

    const ms3_1 = await prisma.milestone.create({
        data: {
            projectId: project3.id,
            title: "Аналитика и проектирование",
            plannedDate: new Date("2025-05-31"),
            status: "PLANNED",
        },
    });

    const ms3_2 = await prisma.milestone.create({
        data: {
            projectId: project3.id,
            title: "MVP для курьеров",
            plannedDate: new Date("2025-08-31"),
            status: "PLANNED",
        },
    });

    await prisma.task.createMany({
        data: [
            {
                projectId: project3.id,
                milestoneId: ms3_1.id,
                title: "Анализ требований",
                description: "Сбор и документирование требований от заказчика",
                status: "NEW",
                priority: "HIGH",
                dueDate: new Date("2025-05-15"),
                plannedHours: 16,
            },
            {
                projectId: project3.id,
                milestoneId: ms3_1.id,
                title: "Проектирование архитектуры",
                status: "NEW",
                priority: "HIGH",
                dueDate: new Date("2025-05-31"),
                plannedHours: 24,
            },
            {
                projectId: project3.id,
                milestoneId: ms3_2.id,
                title: "UI/UX дизайн приложения",
                status: "NEW",
                priority: "MEDIUM",
                dueDate: new Date("2025-06-30"),
                plannedHours: 48,
            },
        ],
    });

    console.log("✅ Проект 3 создан");

    // =====================
    // ПРОЕКТ 4 — Приостановлен
    // =====================
    const project4 = await prisma.project.create({
        data: {
            title: "Система аналитики продаж",
            description: "BI-система для анализа продаж, построения отчётов и дашбордов.",
            status: "ON_HOLD",
            priority: "LOW",
            customer: "Торговая сеть Меркурий",
            managerId: manager2.id,
            startDate: new Date("2024-11-01"),
            endDate: new Date("2025-08-31"),
            budget: 1200000,
            category: "Аналитика",
        },
    });

    await prisma.projectMember.createMany({
        data: [
            { projectId: project4.id, userId: dev3.id, roleInProject: "EXECUTOR" },
            { projectId: project4.id, userId: dev2.id, roleInProject: "EXECUTOR" },
        ],
    });

    await prisma.task.createMany({
        data: [
            {
                projectId: project4.id,
                title: "Анализ источников данных",
                status: "DONE",
                priority: "HIGH",
                dueDate: new Date("2024-11-30"),
                plannedHours: 20,
            },
            {
                projectId: project4.id,
                title: "Разработка ETL процессов",
                status: "IN_PROGRESS",
                priority: "HIGH",
                dueDate: new Date("2025-03-01"),
                plannedHours: 60,
            },
            {
                projectId: project4.id,
                title: "Дашборд продаж",
                status: "NEW",
                priority: "MEDIUM",
                dueDate: new Date("2025-06-01"),
                plannedHours: 40,
            },
        ],
    });

    console.log("✅ Проект 4 создан");

    // Уведомления
    await prisma.notification.createMany({
        data: [
            {
                userId: dev1.id,
                type: "TASK_ASSIGNED",
                message: "Алексей Петров назначил вас исполнителем задачи «Frontend — модуль найма»",
                entityType: "task",
                entityId: task1_4.id,
                isRead: false,
            },
            {
                userId: dev1.id,
                type: "TASK_COMMENTED",
                message: "Алексей Петров прокомментировал задачу «Frontend — модуль найма»",
                entityType: "task",
                entityId: task1_4.id,
                isRead: false,
            },
            {
                userId: dev2.id,
                type: "TASK_DUE_SOON",
                message: "Задача «Backend — API модуля найма» истекает через 2 дня",
                entityType: "task",
                entityId: task1_5.id,
                isRead: false,
            },
            {
                userId: designer.id,
                type: "PROJECT_STATUS_CHANGED",
                message: "Мария Иванова изменила статус проекта «Редизайн сайта компании» на «Завершён»",
                isRead: true,
            },
        ],
    });

    console.log("🔔 Уведомления созданы");
    console.log("✅ Сидирование завершено!");
    console.log("\n📋 Аккаунты для входа (пароль: password123):");
    console.log("  admin@sup.ru — Администратор");
    console.log("  petrov@sup.ru — Руководитель проектов");
    console.log("  ivanova@sup.ru — Технический директор");
    console.log("  sidorov@sup.ru — Frontend разработчик");
    console.log("  kozlova@sup.ru — Backend разработчик");
    console.log("  novikov@sup.ru — Fullstack разработчик");
    console.log("  morozova@sup.ru — Дизайнер");
    console.log("  observer@sup.ru — Наблюдатель");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());