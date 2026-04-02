"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AlertCircle, Clock, FolderKanban, CheckSquare } from "lucide-react";
import { TASK_STATUS_LABEL, TASK_STATUS_COLOR } from "@/types";

interface DashboardData {
    stats: {
        activeProjects: number;
        totalProjects: number;
        tasksByStatus: { status: string; _count: { id: number } }[];
    };
    overdueTasks: {
        id: string;
        title: string;
        dueDate: string;
        project: { id: string; title: string };
        assignees: { user: { id: string; name: string } }[];
    }[];
    upcomingTasks: {
        id: string;
        title: string;
        dueDate: string;
        status: string;
        project: { id: string; title: string };
        assignees: { user: { id: string; name: string } }[];
    }[];
    recentTimeLogs: {
        id: string;
        date: string;
        hours: number;
        task: { id: string; title: string; projectId: string };
    }[];
}

const STATUS_ORDER = ["NEW", "IN_PROGRESS", "ON_REVIEW", "DONE", "CANCELLED"];

export default function DashboardPage() {
    const { data: session } = useSession();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard")
            .then((r) => r.json())
            .then((d) => {
                setData(d);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data) return null;

    const totalTasks = data.stats.tasksByStatus.reduce(
        (sum, s) => sum + s._count.id,
        0
    );

    const doneTasks =
        data.stats.tasksByStatus.find((s) => s.status === "DONE")?._count.id ?? 0;

    const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Добро пожаловать, {session?.user?.name}
                </p>
            </div>

            {/* Верхние виджеты */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-500">Активные проекты</p>
                        <FolderKanban size={18} className="text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{data.stats.activeProjects}</p>
                    <p className="text-xs text-gray-400 mt-1">из {data.stats.totalProjects} всего</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-500">Всего задач</p>
                        <CheckSquare size={18} className="text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
                    <p className="text-xs text-gray-400 mt-1">{progressPercent}% выполнено</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-500">Просрочено</p>
                        <AlertCircle size={18} className="text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-red-600">{data.overdueTasks.length}</p>
                    <p className="text-xs text-gray-400 mt-1">требуют внимания</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-500">Дедлайны (7 дней)</p>
                        <Clock size={18} className="text-orange-500" />
                    </div>
                    <p className="text-3xl font-bold text-orange-600">{data.upcomingTasks.length}</p>
                    <p className="text-xs text-gray-400 mt-1">предстоящих задач</p>
                </div>
            </div>

            {/* Задачи по статусам */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Распределение задач по статусам</h2>
                <div className="space-y-3">
                    {STATUS_ORDER.map((status) => {
                        const count = data.stats.tasksByStatus.find((s) => s.status === status)?._count.id ?? 0;
                        const percent = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                        return (
                            <div key={status} className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-32 text-center ${TASK_STATUS_COLOR[status]}`}>
                                    {TASK_STATUS_LABEL[status]}
                                </span>
                                <div className="flex-1 bg-gray-100 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-blue-500 transition-all"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                                <span className="text-xs text-gray-400 w-8">{percent}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Просроченные задачи */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-500" />
                        Просроченные задачи
                    </h2>
                    {data.overdueTasks.length === 0 ? (
                        <p className="text-sm text-gray-400">Просроченных задач нет 🎉</p>
                    ) : (
                        <div className="space-y-3">
                            {data.overdueTasks.map((task) => (
                                <Link
                                    key={task.id}
                                    href={`/projects/${task.project.id}/tasks/${task.id}`}
                                    className="block p-3 bg-red-50 border border-red-100 rounded-lg hover:border-red-300 transition-colors"
                                >
                                    <p className="text-sm font-medium text-gray-900 mb-1">{task.title}</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-500">{task.project.title}</p>
                                        <p className="text-xs text-red-600 font-medium">
                                            {new Date(task.dueDate).toLocaleDateString("ru-RU")}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ближайшие дедлайны */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Clock size={16} className="text-orange-500" />
                        Ближайшие дедлайны
                    </h2>
                    {data.upcomingTasks.length === 0 ? (
                        <p className="text-sm text-gray-400">Нет задач на ближайшие 7 дней</p>
                    ) : (
                        <div className="space-y-3">
                            {data.upcomingTasks.map((task) => {
                                const daysLeft = Math.ceil(
                                    (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                                );
                                return (
                                    <Link
                                        key={task.id}
                                        href={`/projects/${task.project.id}/tasks/${task.id}`}
                                        className="block p-3 bg-orange-50 border border-orange-100 rounded-lg hover:border-orange-300 transition-colors"
                                    >
                                        <p className="text-sm font-medium text-gray-900 mb-1">{task.title}</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-gray-500">{task.project.title}</p>
                                            <p className="text-xs text-orange-600 font-medium">
                                                {daysLeft === 0 ? "Сегодня" : daysLeft === 1 ? "Завтра" : `через ${daysLeft} дн.`}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Последние трудозатраты */}
            {data.recentTimeLogs.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Мои последние трудозатраты</h2>
                    <div className="space-y-2">
                        {data.recentTimeLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <Link
                                    href={`/projects/${log.task.projectId}/tasks/${log.task.id}`}
                                    className="text-sm text-gray-900 hover:text-blue-600"
                                >
                                    {log.task.title}
                                </Link>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400">
                                        {new Date(log.date).toLocaleDateString("ru-RU")}
                                    </span>
                                    <span className="text-sm font-medium text-gray-700">{log.hours} ч</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}