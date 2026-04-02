import { prisma } from "@/lib/prisma";

type NotificationType =
    | "TASK_ASSIGNED"
    | "TASK_STATUS_CHANGED"
    | "TASK_DUE_SOON"
    | "TASK_OVERDUE"
    | "TASK_COMMENTED"
    | "PROJECT_STATUS_CHANGED";

export async function createNotification({
    userId,
    type,
    message,
    entityType,
    entityId,
}: {
    userId: string;
    type: NotificationType;
    message: string;
    entityType?: string;
    entityId?: string;
}) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type,
                message,
                entityType: entityType || null,
                entityId: entityId || null,
            },
        });
    } catch (error) {
        console.error("Ошибка создания уведомления:", error);
    }
}

export async function notifyTaskAssigned(
    taskId: string,
    taskTitle: string,
    assigneeIds: string[],
    assignedByName: string
) {
    for (const userId of assigneeIds) {
        await createNotification({
            userId,
            type: "TASK_ASSIGNED",
            message: `${assignedByName} назначил вас исполнителем задачи «${taskTitle}»`,
            entityType: "task",
            entityId: taskId,
        });
    }
}

export async function notifyTaskStatusChanged(
    taskId: string,
    taskTitle: string,
    assigneeIds: string[],
    newStatus: string,
    changedByName: string
) {
    const statusLabel: Record<string, string> = {
        NEW: "Новая",
        IN_PROGRESS: "В работе",
        ON_REVIEW: "На проверке",
        DONE: "Выполнена",
        CANCELLED: "Отменена",
    };

    for (const userId of assigneeIds) {
        await createNotification({
            userId,
            type: "TASK_STATUS_CHANGED",
            message: `${changedByName} изменил статус задачи «${taskTitle}» на «${statusLabel[newStatus] ?? newStatus}»`,
            entityType: "task",
            entityId: taskId,
        });
    }
}

export async function notifyTaskCommented(
    taskId: string,
    taskTitle: string,
    assigneeIds: string[],
    authorId: string,
    authorName: string
) {
    for (const userId of assigneeIds) {
        if (userId === authorId) continue;
        await createNotification({
            userId,
            type: "TASK_COMMENTED",
            message: `${authorName} прокомментировал задачу «${taskTitle}»`,
            entityType: "task",
            entityId: taskId,
        });
    }
}

export async function notifyProjectStatusChanged(
    projectId: string,
    projectTitle: string,
    memberIds: string[],
    newStatus: string,
    changedByName: string
) {
    const statusLabel: Record<string, string> = {
        NEW: "Новый",
        IN_PROGRESS: "В работе",
        ON_HOLD: "Приостановлен",
        COMPLETED: "Завершён",
        CANCELLED: "Отменён",
    };

    for (const userId of memberIds) {
        await createNotification({
            userId,
            type: "PROJECT_STATUS_CHANGED",
            message: `${changedByName} изменил статус проекта «${projectTitle}» на «${statusLabel[newStatus] ?? newStatus}»`,
            entityType: "project",
            entityId: projectId,
        });
    }
}