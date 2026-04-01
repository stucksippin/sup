"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    plannedHours: number | null;
    assignees: { user: { id: string; name: string } }[];
    subTasks: Task[];
    _count: { comments: number };
}

const statusLabel: Record<string, string> = {
    NEW: "Новая",
    IN_PROGRESS: "В работе",
    ON_REVIEW: "На проверке",
    DONE: "Выполнена",
    CANCELLED: "Отменена",
};

const statusColor: Record<string, string> = {
    NEW: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    ON_REVIEW: "bg-yellow-100 text-yellow-700",
    DONE: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
};

const priorityColor: Record<string, string> = {
    LOW: "bg-gray-200",
    MEDIUM: "bg-orange-400",
    HIGH: "bg-red-500",
    CRITICAL: "bg-red-700",
};

const priorityLabel: Record<string, string> = {
    LOW: "Низкий",
    MEDIUM: "Средний",
    HIGH: "Высокий",
    CRITICAL: "Критический",
};

function TaskRow({ task, projectId, depth = 0 }: { task: Task; projectId: string; depth?: number }) {
    const [expanded, setExpanded] = useState(false);
    const hasSubtasks = task.subTasks.length > 0;

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

    return (
        <>
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                    <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
                        {hasSubtasks ? (
                            <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600">
                                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                        ) : (
                            <span className="w-4" />
                        )}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColor[task.priority]}`} />
                        <Link
                            href={`/dashboard/projects/${projectId}/tasks/${task.id}`}
                            className="text-sm text-gray-900 hover:text-blue-600 font-medium"
                        >
                            {task.title}
                        </Link>
                        {hasSubtasks && (
                            <span className="text-xs text-gray-400">
                                ({task.subTasks.filter((s) => s.status === "DONE").length}/{task.subTasks.length})
                            </span>
                        )}
                    </div>
                </td>
                <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[task.status]}`}>
                        {statusLabel[task.status]}
                    </span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-xs text-gray-600">{priorityLabel[task.priority]}</span>
                </td>
                <td className="py-3 px-4">
                    <div className="flex -space-x-1">
                        {task.assignees.slice(0, 3).map(({ user }) => (
                            <div
                                key={user.id}
                                title={user.name}
                                className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white"
                            >
                                {user.name[0]}
                            </div>
                        ))}
                    </div>
                </td>
                <td className="py-3 px-4">
                    <span className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                        {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString("ru-RU")
                            : "—"}
                    </span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-xs text-gray-500">
                        {task.plannedHours ? `${task.plannedHours} ч` : "—"}
                    </span>
                </td>
            </tr>
            {expanded && task.subTasks.map((sub) => (
                <TaskRow key={sub.id} task={sub} projectId={projectId} depth={depth + 1} />
            ))}
        </>
    );
}

export default function TasksPage() {
    const { id } = useParams();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        fetch(`/api/projects/${id}/tasks`)
            .then((r) => r.json())
            .then((data) => {
                setTasks(data);
                setLoading(false);
            });
    }, [id]);

    const filtered = statusFilter
        ? tasks.filter((t) => t.status === statusFilter)
        : tasks;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Задачи проекта</h1>
                    <p className="text-gray-500 text-sm mt-1">Всего: {tasks.length}</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Все статусы</option>
                        <option value="NEW">Новая</option>
                        <option value="IN_PROGRESS">В работе</option>
                        <option value="ON_REVIEW">На проверке</option>
                        <option value="DONE">Выполнена</option>
                        <option value="CANCELLED">Отменена</option>
                    </select>
                    <Link
                        href={`/dashboard/projects/${id}/tasks/new`}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} />
                        Новая задача
                    </Link>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 text-sm">Загрузка...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 text-sm">Задачи не найдены</p>
                        <Link
                            href={`/dashboard/projects/${id}/tasks/new`}
                            className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                        >
                            Создать первую задачу
                        </Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Название
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Статус
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Приоритет
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Исполнители
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Срок
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Часы
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((task) => (
                                <TaskRow key={task.id} task={task} projectId={id as string} />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}