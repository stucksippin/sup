"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import type { Project } from "@/types";

const statusLabel: Record<string, string> = {
    NEW: "Новый",
    IN_PROGRESS: "В работе",
    ON_HOLD: "Приостановлен",
    COMPLETED: "Завершён",
    CANCELLED: "Отменён",
};

const statusColor: Record<string, string> = {
    NEW: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    ON_HOLD: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
};

const priorityLabel: Record<string, string> = {
    LOW: "Низкий",
    MEDIUM: "Средний",
    HIGH: "Высокий",
};

const priorityColor: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-600",
    MEDIUM: "bg-orange-100 text-orange-700",
    HIGH: "bg-red-100 text-red-700",
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/projects")
            .then((r) => r.json())
            .then((data) => {
                setProjects(data);
                setLoading(false);
            });
    }, []);

    const filtered = projects.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Проекты</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Всего проектов: {projects.length}
                    </p>
                </div>
                <Link
                    href="/dashboard/projects/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus size={16} />
                    Новый проект
                </Link>
            </div>

            {/* Поиск */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-center gap-3">
                <Search size={18} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Поиск по названию..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />
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
                    <Link
                        href="/dashboard/projects/new"
                        className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                    >
                        Создать первый проект
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((project) => (
                        <Link
                            key={project.id}
                            href={`/dashboard/projects/${project.id}`}
                            className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-base font-semibold text-gray-900">
                                            {project.title}
                                        </h2>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[project.status]}`}>
                                            {statusLabel[project.status]}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[project.priority]}`}>
                                            {priorityLabel[project.priority]}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>Руководитель: {project.manager.name}</span>
                                        {project.customer && <span>Заказчик: {project.customer}</span>}
                                        <span>Задач: {project._count.tasks}</span>
                                        {project.endDate && (
                                            <span>
                                                Срок: {new Date(project.endDate).toLocaleDateString("ru-RU")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}