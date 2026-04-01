"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import type { TaskListItem } from "@/types";
import { TASK_STATUS_LABEL, TASK_STATUS_COLOR, PRIORITY_DOT_COLOR, PRIORITY_LABEL } from "@/types";

function TaskRow({ task, projectId, depth = 0 }: { task: TaskListItem; projectId: string; depth?: number }) {
    const [expanded, setExpanded] = useState(false);
    const hasSubtasks = (task.subTasks?.length ?? 0) > 0;
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
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT_COLOR[task.priority]}`} />
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
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TASK_STATUS_COLOR[task.status]}`}>
                        {TASK_STATUS_LABEL[task.status]}
                    </span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-xs text-gray-600">{PRIORITY_LABEL[task.priority]}</span>
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
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString("ru-RU") : "—"}
                    </span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-xs text-gray-500">
                        {task.plannedHours ? `${task.plannedHours} ч` : "—"}
                    </span>
                </td>
            </tr>
            {expanded && task.subTasks.map((sub) => (
                <TaskRow key={sub.id} task={sub as TaskListItem} projectId={projectId} depth={depth + 1} />
            ))}
        </>
    );
}

export default function TasksPage() {
    const { id } = useParams();
    const [tasks, setTasks] = useState<TaskListItem[]>([]);
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

    const filtered = statusFilter ? tasks.filter((t) => t.status === statusFilter) : tasks;

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
                        {Object.entries(TASK_STATUS_LABEL).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
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
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Название</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Статус</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Приоритет</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Исполнители</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Срок</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Часы</th>
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