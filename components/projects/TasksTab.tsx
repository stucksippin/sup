"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import type { TaskListItem } from "@/types";
import { TASK_STATUS_LABEL, PRIORITY_LABEL } from "@/types";
import TaskRow from "@/components/tasks/TaskRow";

interface Member {
    id: string;
    name: string;
}

interface Milestone {
    id: string;
    title: string;
}

interface Filters {
    status: string;
    priority: string;
    assigneeId: string;
    milestoneId: string;
    dueDateFrom: string;
    dueDateTo: string;
    overdue: boolean;
}

const emptyFilters: Filters = {
    status: "",
    priority: "",
    assigneeId: "",
    milestoneId: "",
    dueDateFrom: "",
    dueDateTo: "",
    overdue: false,
};

export default function TasksTab({ projectId }: { projectId: string }) {
    const [tasks, setTasks] = useState<TaskListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [filters, setFilters] = useState<Filters>(emptyFilters);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetch(`/api/projects/${projectId}/tasks`)
            .then((r) => r.json())
            .then((data) => {
                setTasks(data);
                setLoading(false);
            });

        fetch(`/api/projects/${projectId}`)
            .then((r) => r.json())
            .then((project) => {
                setMembers(project.members.map((m: any) => m.user));
                setMilestones(project.milestones || []);
            });
    }, [projectId]);

    const filtered = tasks.filter((task) => {
        if (filters.status && task.status !== filters.status) return false;
        if (filters.priority && task.priority !== filters.priority) return false;
        if (filters.assigneeId && !task.assignees.some((a) => a.user.id === filters.assigneeId)) return false;
        if (filters.milestoneId) return false; // milestone не в TaskListItem, пропускаем
        if (filters.dueDateFrom && task.dueDate && new Date(task.dueDate) < new Date(filters.dueDateFrom)) return false;
        if (filters.dueDateTo && task.dueDate && new Date(task.dueDate) > new Date(filters.dueDateTo)) return false;
        if (filters.overdue && !(task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE")) return false;
        return true;
    });

    // Активные фильтры для тегов
    const activeTags: { label: string; onRemove: () => void }[] = [];
    if (filters.status) activeTags.push({ label: TASK_STATUS_LABEL[filters.status], onRemove: () => setFilters({ ...filters, status: "" }) });
    if (filters.priority) activeTags.push({ label: PRIORITY_LABEL[filters.priority], onRemove: () => setFilters({ ...filters, priority: "" }) });
    if (filters.assigneeId) {
        const m = members.find((m) => m.id === filters.assigneeId);
        if (m) activeTags.push({ label: m.name, onRemove: () => setFilters({ ...filters, assigneeId: "" }) });
    }
    if (filters.dueDateFrom) activeTags.push({ label: `от ${filters.dueDateFrom}`, onRemove: () => setFilters({ ...filters, dueDateFrom: "" }) });
    if (filters.dueDateTo) activeTags.push({ label: `до ${filters.dueDateTo}`, onRemove: () => setFilters({ ...filters, dueDateTo: "" }) });
    if (filters.overdue) activeTags.push({ label: "Просроченные", onRemove: () => setFilters({ ...filters, overdue: false }) });

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">Найдено: {filtered.length} из {tasks.length}</p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${showFilters || activeTags.length > 0
                                ? "bg-blue-50 border-blue-300 text-blue-700"
                                : "border-gray-300 text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        Фильтры {activeTags.length > 0 && `(${activeTags.length})`}
                    </button>
                    <Link
                        href={`/projects/${projectId}/tasks/new`}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={15} />
                        Новая задача
                    </Link>
                </div>
            </div>

            {/* Панель фильтров */}
            {showFilters && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Статус</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Все</option>
                                {Object.entries(TASK_STATUS_LABEL).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Приоритет</label>
                            <select
                                value={filters.priority}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Все</option>
                                {Object.entries(PRIORITY_LABEL).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Исполнитель</label>
                            <select
                                value={filters.assigneeId}
                                onChange={(e) => setFilters({ ...filters, assigneeId: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Все</option>
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Срок от</label>
                            <input
                                type="date"
                                value={filters.dueDateFrom}
                                onChange={(e) => setFilters({ ...filters, dueDateFrom: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Срок до</label>
                            <input
                                type="date"
                                value={filters.dueDateTo}
                                onChange={(e) => setFilters({ ...filters, dueDateTo: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.overdue}
                                    onChange={(e) => setFilters({ ...filters, overdue: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Только просроченные</span>
                            </label>
                        </div>
                    </div>

                    {activeTags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gray-100">
                            {activeTags.map((tag, i) => (
                                <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                                    {tag.label}
                                    <button onClick={tag.onRemove} className="hover:text-blue-900">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                            <button
                                onClick={() => setFilters(emptyFilters)}
                                className="text-xs text-red-500 hover:underline ml-1"
                            >
                                Сбросить все
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 text-sm">Загрузка...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 text-sm">Задачи не найдены</p>
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