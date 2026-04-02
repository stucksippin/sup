"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import type { Project } from "@/types";
import { PROJECT_STATUS_COLOR, STATUS_LABEL, PRIORITY_LABEL } from "@/types";
import TasksTab from "@/components/projects/TasksTab";
import MembersTab from "@/components/projects/MembersTab";
import ConfirmModal from "@/components/ui/ConfirmModal";
import MilestonesTab from "@/components/projects/MilestonesTab";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import DocumentsTab from "@/components/projects/DocumentsTab";
import { useSearchParams } from "next/navigation";

const tabs = ["Обзор", "Задачи", "Kanban", "Вехи", "Участники", "Документы"];

export default function ProjectPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Обзор");
    const [deleteConfirm, setDeleteConfirm] = useState(false);


    const searchParams = useSearchParams();

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "tasks") setActiveTab("Задачи");
        else if (tab === "kanban") setActiveTab("Kanban");
    }, [searchParams]);

    function loadProject() {
        fetch(`/api/projects/${id}`)
            .then((r) => r.json())
            .then((data) => {
                setProject(data);
                setLoading(false);
            });
    }

    useEffect(() => {
        loadProject();
    }, [id]);

    async function handleDelete() {
        const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
        if (res.ok) router.push("/projects");
    }

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
        );
    }

    if (!project) return <p className="text-gray-500">Проект не найден</p>;

    const isAdmin = session?.user?.role === "ADMIN";

    return (
        <div>
            {/* Шапка */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3">
                    <Link
                        href="/projects"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PROJECT_STATUS_COLOR[project.status]}`}>
                                {STATUS_LABEL[project.status]}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            Приоритет: {PRIORITY_LABEL[project.priority]}
                            {project.customer && ` · Заказчик: ${project.customer}`}
                            {project.category && ` · ${project.category}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={`/projects/${id}/edit`}
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

            {/* Обзор */}
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

            {activeTab === "Задачи" && <TasksTab projectId={id as string} />}
            {activeTab === "Kanban" && <KanbanBoard projectId={id as string} />}

            {activeTab === "Вехи" && <MilestonesTab projectId={id as string} />}

            {activeTab === "Участники" && (
                <MembersTab
                    projectId={id as string}
                    members={project.members}
                    onUpdate={loadProject}
                />
            )}

            {activeTab === "Документы" && <DocumentsTab projectId={id as string} />}

            {deleteConfirm && (
                <ConfirmModal
                    title="Удалить проект?"
                    description="Это действие удалит все задачи, комментарии и файлы проекта. Отменить нельзя."
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteConfirm(false)}
                />
            )}
        </div>
    );
}