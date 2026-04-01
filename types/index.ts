export enum Role {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    EXECUTOR = "EXECUTOR",
    OBSERVER = "OBSERVER",
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    position?: string;
    isActive: boolean;
}

export interface Project {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    customer: string | null;
    startDate: string | null;
    endDate: string | null;
    budget: number | null;
    category: string | null;
    manager: { id: string; name: string };
    members: ProjectMember[];
    milestones: Milestone[];
    _count: { tasks: number };
}

export interface ProjectMember {
    id: string;
    user: { id: string; name: string };
    roleInProject: string;
}

export interface Milestone {
    id: string;
    title: string;
    description?: string | null;
    plannedDate: string;
    actualDate?: string | null;
    status: string;
}

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    startDate: string | null;
    dueDate: string | null;
    plannedHours: number | null;
    assignees: { user: { id: string; name: string } }[];
    milestone: { id: string; title: string } | null;
    subTasks: SubTask[];
    comments: Comment[];
    timeLogs: TimeLog[];
    _count?: { comments: number; attachments: number };
}

export interface SubTask {
    id: string;
    title: string;
    status: string;
    assignees: { user: { id: string; name: string } }[];
}

export interface Comment {
    id: string;
    text: string;
    createdAt: string;
    author: { id: string; name: string };
}

export interface TimeLog {
    id: string;
    date: string;
    hours: number;
    comment: string | null;
    user: { id: string; name: string };
}

export interface TaskListItem {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    plannedHours: number | null;
    assignees: { user: { id: string; name: string } }[];
    subTasks: { id: string; status: string }[];
    _count: { comments: number };
}

export const STATUS_LABEL: Record<string, string> = {
    NEW: "Новый",
    IN_PROGRESS: "В работе",
    ON_HOLD: "Приостановлен",
    COMPLETED: "Завершён",
    CANCELLED: "Отменён",
};

export const TASK_STATUS_LABEL: Record<string, string> = {
    NEW: "Новая",
    IN_PROGRESS: "В работе",
    ON_REVIEW: "На проверке",
    DONE: "Выполнена",
    CANCELLED: "Отменена",
};

export const TASK_STATUS_COLOR: Record<string, string> = {
    NEW: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    ON_REVIEW: "bg-yellow-100 text-yellow-700",
    DONE: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
};

export const PROJECT_STATUS_COLOR: Record<string, string> = {
    NEW: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    ON_HOLD: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
};

export const PRIORITY_LABEL: Record<string, string> = {
    LOW: "Низкий",
    MEDIUM: "Средний",
    HIGH: "Высокий",
    CRITICAL: "Критический",
};

export const PRIORITY_DOT_COLOR: Record<string, string> = {
    LOW: "bg-gray-300",
    MEDIUM: "bg-orange-400",
    HIGH: "bg-red-500",
    CRITICAL: "bg-red-700",
};

export const PRIORITY_BADGE_COLOR: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-600",
    MEDIUM: "bg-orange-100 text-orange-700",
    HIGH: "bg-red-100 text-red-700",
    CRITICAL: "bg-red-200 text-red-800",
};