"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { TaskListItem } from "@/types";
import { TASK_STATUS_LABEL } from "@/types";
import TaskRow from "@/components/tasks/TaskRow";

export default function TasksTab({ projectId }: { projectId: string }) {
    const [tasks, setTasks] = useState<TaskListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        fetch(`/api/projects/${projectId}/tasks`)
            .then((r) => r.json())
            .then((data) => {
                setTasks(data);
                setLoading(false);
            });
    }, [projectId]);

    const filtered = statusFilter ? tasks.filter((t) => t.status === statusFilter) : tasks;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">Всего задач: {tasks.length}</p>
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
                        href={`/projects/${projectId}/tasks/new`}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={15} />
                        Новая задача
                    </Link>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 text-sm">Загрузка...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 text-sm">Задачи не созданы</p>
                        <Link
                            href={`/projects/${projectId}/tasks/new`}
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
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Приоритет</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Исполнители</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Срок</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Часы</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((task) => (
                                <TaskRow key={task.id} task={task} projectId={projectId} />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}