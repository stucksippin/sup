"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Clock, AlertCircle } from "lucide-react";

interface WorkloadUser {
    user: { id: string; name: string; position: string | null; role: string };
    totalHours: number;
    loadStatus: "normal" | "high" | "overload";
    activeTasksCount: number;
    byProject: { title: string; hours: number }[];
    activeTasks: {
        id: string;
        title: string;
        plannedHours: number | null;
        dueDate: string | null;
        status: string;
        project: { id: string; title: string };
    }[];
}

interface WorkloadData {
    workload: WorkloadUser[];
    period: string;
    startDate: string;
    endDate: string;
}

const loadColors = {
    normal: "bg-green-100 text-green-700",
    high: "bg-yellow-100 text-yellow-700",
    overload: "bg-red-100 text-red-700",
};

const loadLabels = {
    normal: "Норма",
    high: "Повышенная",
    overload: "Перегрузка",
};

const loadBarColors = {
    normal: "bg-green-500",
    high: "bg-yellow-500",
    overload: "bg-red-500",
};

export default function WorkloadReportPage() {
    const [data, setData] = useState<WorkloadData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<"week" | "month">("week");
    const [expandedUser, setExpandedUser] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/reports/workload?period=${period}`)
            .then((r) => r.json())
            .then((d) => {
                setData(d);
                setLoading(false);
            });
    }, [period]);

    const maxHours = period === "week" ? 40 : 160;

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3">
                    <Link href="/reports" className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Загрузка сотрудников</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {data && `${new Date(data.startDate).toLocaleDateString("ru-RU")} — ${new Date(data.endDate).toLocaleDateString("ru-RU")}`}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setPeriod("week")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === "week" ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        Неделя
                    </button>
                    <button
                        onClick={() => setPeriod("month")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === "month" ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        Месяц
                    </button>
                </div>
            </div>

            {/* Легенда */}
            <div className="flex gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-500">Норма (до {period === "week" ? "40" : "160"} ч)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-xs text-gray-500">Повышенная ({period === "week" ? "32–40" : "128–160"} ч)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs text-gray-500">Перегрузка (более {period === "week" ? "40" : "160"} ч)</span>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                            <div className="h-2 bg-gray-100 rounded" />
                        </div>
                    ))}
                </div>
            ) : !data || data.workload.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <Users size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Нет данных за выбранный период</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {data.workload.map(({ user, totalHours, loadStatus, activeTasksCount, byProject, activeTasks }) => {
                        const percent = Math.min((totalHours / maxHours) * 100, 100);
                        const isExpanded = expandedUser === user.id;

                        return (
                            <div key={user.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div
                                    className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-medium">
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-400">{user.position ?? "—"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-gray-900">{totalHours} ч</p>
                                                <p className="text-xs text-gray-400">из {maxHours} ч</p>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${loadColors[loadStatus]}`}>
                                                {loadLabels[loadStatus]}
                                            </span>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Clock size={12} />
                                                {activeTasksCount} задач
                                            </div>
                                        </div>
                                    </div>

                                    {/* Прогресс-бар */}
                                    <div className="bg-gray-100 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${loadBarColors[loadStatus]}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>

                                    {/* По проектам */}
                                    {byProject.length > 0 && (
                                        <div className="flex gap-3 mt-2 flex-wrap">
                                            {byProject.map((p) => (
                                                <span key={p.title} className="text-xs text-gray-500">
                                                    {p.title}: <span className="font-medium text-gray-700">{p.hours} ч</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Раскрывающийся список задач */}
                                {isExpanded && activeTasks.length > 0 && (
                                    <div className="border-t border-gray-100 px-5 py-4">
                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Активные задачи</p>
                                        <div className="space-y-2">
                                            {activeTasks.map((task) => {
                                                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                                                return (
                                                    <div key={task.id} className="flex items-center justify-between py-1">
                                                        <div>
                                                            <Link
                                                                href={`/projects/${task.project.id}/tasks/${task.id}`}
                                                                className="text-sm text-gray-900 hover:text-blue-600"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {task.title}
                                                            </Link>
                                                            <p className="text-xs text-gray-400">{task.project.title}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {task.dueDate && (
                                                                <span className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-gray-400"}`}>
                                                                    {isOverdue && <AlertCircle size={12} className="inline mr-1" />}
                                                                    {new Date(task.dueDate).toLocaleDateString("ru-RU")}
                                                                </span>
                                                            )}
                                                            {task.plannedHours && (
                                                                <span className="text-xs text-gray-400">{task.plannedHours} ч</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {isExpanded && activeTasks.length === 0 && (
                                    <div className="border-t border-gray-100 px-5 py-4">
                                        <p className="text-sm text-gray-400">Нет активных задач</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}