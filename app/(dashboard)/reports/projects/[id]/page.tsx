"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { TASK_STATUS_LABEL, TASK_STATUS_COLOR, PRIORITY_LABEL } from "@/types";

interface ReportData {
    project: {
        id: string;
        title: string;
        status: string;
        startDate: string | null;
        endDate: string | null;
        manager: { name: string };
        budget: number | null;
    };
    stats: {
        totalTasks: number;
        doneTasks: number;
        progressPercent: number;
        tasksByStatus: Record<string, number>;
        plannedHours: number;
        factHours: number;
        overdueCount: number;
    };
    overdueTasks: {
        id: string;
        title: string;
        dueDate: string;
        status: string;
        assignees: { user: { name: string } }[];
    }[];
    milestones: {
        achieved: { id: string; title: string; actualDate: string | null }[];
        upcoming: { id: string; title: string; plannedDate: string }[];
    };
    tasks: {
        id: string;
        title: string;
        status: string;
        priority: string;
        dueDate: string | null;
        plannedHours: number | null;
        factHours: number;
        assignees: string;
    }[];
}

const STATUS_ORDER = ["NEW", "IN_PROGRESS", "ON_REVIEW", "DONE", "CANCELLED"];

export default function ProjectReportPage() {
    const { id } = useParams();
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetch(`/api/reports/project/${id}`)
            .then((r) => r.json())
            .then((d) => {
                setData(d);
                setLoading(false);
            });
    }, [id]);

    async function handleExport() {
        setExporting(true);
        const res = await fetch(`/api/reports/project/${id}/export`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report-${id}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        setExporting(false);
    }

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-100 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data) return <p className="text-gray-500">Данные не найдены</p>;

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3">
                    <Link href="/reports" className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{data.project.title}</h1>
                        <p className="text-gray-500 text-sm mt-1">Отчёт по проекту</p>
                    </div>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                    <Download size={16} />
                    {exporting ? "Экспорт..." : "Скачать Excel"}
                </button>
            </div>

            {/* Виджеты */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm text-gray-500 mb-1">Прогресс</p>
                    <p className="text-3xl font-bold text-gray-900">{data.stats.progressPercent}%</p>
                    <p className="text-xs text-gray-400 mt-1">{data.stats.doneTasks} из {data.stats.totalTasks} задач</p>
                    <div className="mt-2 bg-gray-100 rounded-full h-2">
                        <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${data.stats.progressPercent}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm text-gray-500 mb-1">Просрочено</p>
                    <p className={`text-3xl font-bold ${data.stats.overdueCount > 0 ? "text-red-600" : "text-gray-900"}`}>
                        {data.stats.overdueCount}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">задач</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm text-gray-500 mb-1">Трудозатраты</p>
                    <p className="text-3xl font-bold text-gray-900">{data.stats.factHours}</p>
                    <p className="text-xs text-gray-400 mt-1">из {data.stats.plannedHours} план. ч</p>
                    <div className="mt-2 bg-gray-100 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${data.stats.factHours > data.stats.plannedHours ? "bg-red-500" : "bg-green-500"}`}
                            style={{ width: `${data.stats.plannedHours > 0 ? Math.min((data.stats.factHours / data.stats.plannedHours) * 100, 100) : 0}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm text-gray-500 mb-1">Руководитель</p>
                    <p className="text-base font-semibold text-gray-900">{data.project.manager.name}</p>
                    {data.project.endDate && (
                        <p className="text-xs text-gray-400 mt-1">
                            до {new Date(data.project.endDate).toLocaleDateString("ru-RU")}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Распределение по статусам */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Задачи по статусам</h2>
                    <div className="space-y-3">
                        {STATUS_ORDER.map((status) => {
                            const count = data.stats.tasksByStatus[status] ?? 0;
                            const percent = data.stats.totalTasks > 0
                                ? Math.round((count / data.stats.totalTasks) * 100)
                                : 0;
                            return (
                                <div key={status} className="flex items-center gap-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-28 text-center ${TASK_STATUS_COLOR[status]}`}>
                                        {TASK_STATUS_LABEL[status]}
                                    </span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${percent}%` }} />
                                    </div>
                                    <span className="text-sm text-gray-600 w-6 text-right">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Вехи */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Вехи</h2>
                    {data.milestones.achieved.length === 0 && data.milestones.upcoming.length === 0 ? (
                        <p className="text-sm text-gray-400">Вех нет</p>
                    ) : (
                        <div className="space-y-2">
                            {data.milestones.achieved.map((m) => (
                                <div key={m.id} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{m.title}</span>
                                    <span className="text-xs text-green-600 ml-auto">Достигнута</span>
                                </div>
                            ))}
                            {data.milestones.upcoming.map((m) => (
                                <div key={m.id} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{m.title}</span>
                                    <span className="text-xs text-gray-400 ml-auto">
                                        {new Date(m.plannedDate).toLocaleDateString("ru-RU")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Просроченные задачи */}
            {data.overdueTasks.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Просроченные задачи</h2>
                    <div className="space-y-2">
                        {data.overdueTasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <Link
                                    href={`/projects/${data.project.id}/tasks/${task.id}`}
                                    className="text-sm text-gray-900 hover:text-blue-600"
                                >
                                    {task.title}
                                </Link>
                                <span className="text-xs text-red-600 font-medium">
                                    {new Date(task.dueDate).toLocaleDateString("ru-RU")}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Все задачи */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700">Все задачи</h2>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Название</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Статус</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Исполнитель</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">План ч</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Факт ч</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.tasks.map((task) => (
                            <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <Link
                                        href={`/projects/${data.project.id}/tasks/${task.id}`}
                                        className="text-sm text-gray-900 hover:text-blue-600"
                                    >
                                        {task.title}
                                    </Link>
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TASK_STATUS_COLOR[task.status]}`}>
                                        {TASK_STATUS_LABEL[task.status]}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="text-sm text-gray-600">{task.assignees || "—"}</span>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="text-sm text-gray-600">{task.plannedHours ?? "—"}</span>
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`text-sm font-medium ${task.factHours > (task.plannedHours ?? Infinity) ? "text-red-600" : "text-gray-600"}`}>
                                        {task.factHours}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}