"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, ChevronUp, ChevronDown as ChevronDownIcon } from "lucide-react";
import type { Project } from "@/types";
import {
    STATUS_LABEL,
    PROJECT_STATUS_COLOR,
    PRIORITY_LABEL,
    PRIORITY_BADGE_COLOR,
} from "@/types";

type SortField = "title" | "startDate" | "endDate" | "status";
type SortOrder = "asc" | "desc";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [sortField, setSortField] = useState<SortField>("title");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

    useEffect(() => {
        fetch("/api/projects")
            .then((r) => r.json())
            .then((data) => {
                setProjects(data);
                setLoading(false);
            });
    }, []);

    function handleSort(field: SortField) {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    }

    function SortIcon({ field }: { field: SortField }) {
        if (sortField !== field) return <ChevronDownIcon size={14} className="text-gray-300" />;
        return sortOrder === "asc"
            ? <ChevronUp size={14} className="text-blue-500" />
            : <ChevronDownIcon size={14} className="text-blue-500" />;
    }

    const filtered = projects
        .filter((p) => {
            const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter ? p.status === statusFilter : true;
            const matchPriority = priorityFilter ? p.priority === priorityFilter : true;
            return matchSearch && matchStatus && matchPriority;
        })
        .sort((a, b) => {
            let aVal = "";
            let bVal = "";

            if (sortField === "title") {
                aVal = a.title;
                bVal = b.title;
            } else if (sortField === "status") {
                aVal = a.status;
                bVal = b.status;
            } else if (sortField === "startDate") {
                aVal = a.startDate ?? "";
                bVal = b.startDate ?? "";
            } else if (sortField === "endDate") {
                aVal = a.endDate ?? "";
                bVal = b.endDate ?? "";
            }

            if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
            if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

    const activeFilters = [
        statusFilter && { key: "status", label: STATUS_LABEL[statusFilter], onRemove: () => setStatusFilter("") },
        priorityFilter && { key: "priority", label: PRIORITY_LABEL[priorityFilter], onRemove: () => setPriorityFilter("") },
    ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Проекты</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Найдено: {filtered.length} из {projects.length}
                    </p>
                </div>
                <Link
                    href="/projects/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus size={16} />
                    Новый проект
                </Link>
            </div>

            {/* Фильтры */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
                <div className="flex items-center gap-3">
                    <Search size={18} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Поиск по названию..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                    />
                </div>
                <div className="flex gap-3 border-t border-gray-100 pt-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Все статусы</option>
                        <option value="NEW">Новый</option>
                        <option value="IN_PROGRESS">В работе</option>
                        <option value="ON_HOLD">Приостановлен</option>
                        <option value="COMPLETED">Завершён</option>
                        <option value="CANCELLED">Отменён</option>
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Все приоритеты</option>
                        <option value="LOW">Низкий</option>
                        <option value="MEDIUM">Средний</option>
                        <option value="HIGH">Высокий</option>
                    </select>

                    {activeFilters.length > 0 && (
                        <button
                            onClick={() => { setStatusFilter(""); setPriorityFilter(""); }}
                            className="text-sm text-red-500 hover:underline ml-auto"
                        >
                            Сбросить все
                        </button>
                    )}
                </div>

                {/* Активные фильтры */}
                {activeFilters.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {activeFilters.map((f) => (
                            <span
                                key={f.key}
                                className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                            >
                                {f.label}
                                <button onClick={f.onRemove} className="hover:text-blue-900 ml-1">×</button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Список */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                            <div className="h-3 bg-gray-100 rounded w-1/4" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <p className="text-gray-500">Проекты не найдены</p>
                    <Link href="/projects/new" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                        Создать проект
                    </Link>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left py-3 px-4">
                                    <button
                                        onClick={() => handleSort("title")}
                                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-900"
                                    >
                                        Название <SortIcon field="title" />
                                    </button>
                                </th>
                                <th className="text-left py-3 px-4">
                                    <button
                                        onClick={() => handleSort("status")}
                                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-900"
                                    >
                                        Статус <SortIcon field="status" />
                                    </button>
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                                    Приоритет
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                                    Руководитель
                                </th>
                                <th className="text-left py-3 px-4">
                                    <button
                                        onClick={() => handleSort("startDate")}
                                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-900"
                                    >
                                        Начало <SortIcon field="startDate" />
                                    </button>
                                </th>
                                <th className="text-left py-3 px-4">
                                    <button
                                        onClick={() => handleSort("endDate")}
                                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-900"
                                    >
                                        Завершение <SortIcon field="endDate" />
                                    </button>
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                                    Задач
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((project) => (
                                <tr
                                    key={project.id}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => window.location.href = `/projects/${project.id}`}
                                >
                                    <td className="py-3 px-4">
                                        <p className="text-sm font-medium text-gray-900">{project.title}</p>
                                        {project.customer && (
                                            <p className="text-xs text-gray-400">{project.customer}</p>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PROJECT_STATUS_COLOR[project.status]}`}>
                                            {STATUS_LABEL[project.status]}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE_COLOR[project.priority]}`}>
                                            {PRIORITY_LABEL[project.priority]}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm text-gray-600">{project.manager.name}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm text-gray-500">
                                            {project.startDate ? new Date(project.startDate).toLocaleDateString("ru-RU") : "—"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm text-gray-500">
                                            {project.endDate ? new Date(project.endDate).toLocaleDateString("ru-RU") : "—"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm text-gray-600">{project._count.tasks}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}