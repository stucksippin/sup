"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface Project {
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
    members: { id: string; user: { id: string; name: string }; roleInProject: string }[];
    milestones: { id: string; title: string; status: string; plannedDate: string }[];
    _count: { tasks: number };
}

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

const tabs = ["Обзор", "Задачи", "Вехи", "Участники", "Документы"];

export default function ProjectPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Обзор");
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        fetch(`/api/projects/${id}`)
            .then((r) => r.json())
            .then((data) => {
                setProject(data);
                setLoading(false);
            });
    }, [id]);

    async function handleDelete() {
        const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
        if (res.ok) router.push("/dashboard/projects");
    }

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
        );
    }

    if (!project) {
        return <p className="text-gray-500">Проект не найден</p>;
    }

    const isAdmin = session?.user?.role === "ADMIN";

    return (
        <div>
            {/* Шапка */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3">
                    <Link
                        href="/dashboard/projects"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[project.status]}`}>
                                {statusLabel[project.status]}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            Приоритет: {priorityLabel[project.priority]}
                            {project.customer && ` · Заказчик: ${project.customer}`}
                            {project.category && ` · ${project.category}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={`/dashboard/projects/${id}/edit`}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Pencil size={15} />
                        Редактировать
                    </Link>
                    {isAdmin && (
                        <button
                            onClick={() => setDeleteConfirm(true)}
                            className="flex items-center gap-2 px-3 py-2 border border-red-300 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={15} />
                            Удалить
                        </button>
                    )}
                </div>
            </div>

            {/* Вкладки */}
            <div className="flex gap-1 border-b border-gray-200 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Контент вкладок */}
            {activeTab === "Обзор" && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-2">Описание</h2>
                            <p className="text-sm text-gray-600">
                                {project.description || "Описание не указано"}
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-3">Статистика</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{project._count.tasks}</p>
                                    <p className="text-xs text-gray-500 mt-1">Задач</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{project.members.length}</p>
                                    <p className="text-xs text-gray-500 mt-1">Участников</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{project.milestones.length}</p>
                                    <p className="text-xs text-gray-500 mt-1">Вех</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-3">Детали</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Руководитель</span>
                                    <span className="text-gray-900 font-medium">{project.manager.name}</span>
                                </div>
                                {project.startDate && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Начало</span>
                                        <span className="text-gray-900">
                                            {new Date(project.startDate).toLocaleDateString("ru-RU")}
                                        </span>
                                    </div>
                                )}
                                {project.endDate && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Завершение</span>
                                        <span className="text-gray-900">
                                            {new Date(project.endDate).toLocaleDateString("ru-RU")}
                                        </span>
                                    </div>
                                )}
                                {project.budget && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Бюджет</span>
                                        <span className="text-gray-900">
                                            {project.budget.toLocaleString("ru-RU")} ₽
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Задачи" && (
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-700">Задачи проекта</h2>
                        <Link
                            href={`/dashboard/projects/${id}/tasks/new`}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            + Добавить задачу
                        </Link>
                    </div>
                    <Link
                        href={`/dashboard/projects/${id}/tasks`}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Открыть список задач →
                    </Link>
                </div>
            )}

            {activeTab === "Вехи" && (
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-700">Вехи проекта</h2>
                        <Link
                            href={`/dashboard/projects/${id}/milestones/new`}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            + Добавить веху
                        </Link>
                    </div>
                    {project.milestones.length === 0 ? (
                        <p className="text-sm text-gray-500">Вехи не добавлены</p>
                    ) : (
                        <div className="space-y-2">
                            {project.milestones.map((m) => (
                                <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                    <span className="text-sm text-gray-900">{m.title}</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(m.plannedDate).toLocaleDateString("ru-RU")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "Участники" && (
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-700">Команда проекта</h2>
                    </div>
                    {project.members.length === 0 ? (
                        <p className="text-sm text-gray-500">Участники не добавлены</p>
                    ) : (
                        <div className="space-y-2">
                            {project.members.map((m) => (
                                <div key={m.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-medium">
                                        {m.user.name[0]}
                                    </div>
                                    <span className="text-sm text-gray-900">{m.user.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "Документы" && (
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm text-gray-500">Раздел документов будет добавлен позже</p>
                </div>
            )}

            {/* Модал удаления */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Удалить проект?</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Это действие удалит все задачи, комментарии и файлы проекта. Отменить нельзя.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                                Удалить
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}