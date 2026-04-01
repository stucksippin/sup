"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { TaskListItem } from "@/types";
import { TASK_STATUS_LABEL, TASK_STATUS_COLOR, PRIORITY_DOT_COLOR } from "@/types";

export default function TasksTab({ projectId }: { projectId: string }) {
    const [tasks, setTasks] = useState<TaskListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/projects/${projectId}/tasks`)
            .then((r) => r.json())
            .then((data) => {
                setTasks(data);
                setLoading(false);
            });
    }, [projectId]);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">Всего задач: {tasks.length}</p>
                <Link
                    href={`/dashboard/projects/${projectId}/tasks/new`}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus size={15} />
                    Новая задача
                </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 text-sm">Загрузка...</div>
                ) : tasks.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 text-sm">Задачи не созданы</p>
                        <Link
                            href={`/dashboard/projects/${projectId}/tasks/new`}
                            className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                        >
                            Создать первую задачу
                        </Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Название</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Статус</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Исполнители</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Срок</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => {
                                const isOverdue =
                                    task.dueDate &&
                                    new Date(task.dueDate) < new Date() &&
                                    task.status !== "DONE";
                                return (
                                    <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT_COLOR[task.priority]}`} />
                                                <Link
                                                    href={`/dashboard/projects/${projectId}/tasks/${task.id}`}
                                                    className="text-sm text-gray-900 hover:text-blue-600 font-medium"
                                                >
                                                    {task.title}
                                                </Link>
                                                {task.subTasks?.length > 0 && (
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
                                            <div className="flex -space-x-1">
                                                {task.assignees?.slice(0, 3).map(({ user }) => (
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
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}