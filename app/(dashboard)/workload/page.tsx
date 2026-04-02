"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface WorkloadUser {
    user: { id: string; name: string; position: string | null };
    totalHours: number;
    loadStatus: "normal" | "high" | "overload";
    activeTasksCount: number;
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

const loadBg = {
    normal: "bg-green-50",
    high: "bg-yellow-50",
    overload: "bg-red-50",
};

const loadLabels = {
    normal: "Норма",
    high: "Повышенная",
    overload: "Перегрузка",
};

export default function WorkloadPage() {
    const [data, setData] = useState<WorkloadData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<"week" | "month">("week");

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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Загрузка сотрудников</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {data && `${new Date(data.startDate).toLocaleDateString("ru-RU")} — ${new Date(data.endDate).toLocaleDateString("ru-RU")}`}
                    </p>
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
                    <span className="text-xs text-gray-500">до {maxHours} ч — норма</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-xs text-gray-500">{Math.round(maxHours * 0.8)}–{maxHours} ч — повышенная</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs text-gray-500">более {maxHours} ч — перегрузка</span>
                </div>
            </div>

            {loading ? (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
                    <div className="h-12 bg-gray-100" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-14 border-t border-gray-100 bg-white" />
                    ))}
                </div>
            ) : !data || data.workload.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <p className="text-gray-500 text-sm">Нет данных за выбранный период</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Сотрудник</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Должность</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                                    Часов ({period === "week" ? "неделя" : "месяц"})
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Загрузка</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Активных задач</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">График</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.workload.map(({ user, totalHours, loadStatus, activeTasksCount }) => {
                                const percent = Math.min((totalHours / maxHours) * 100, 100);
                                return (
                                    <tr key={user.id} className={`border-b border-gray-100 ${loadBg[loadStatus]}`}>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-medium">
                                                    {user.name[0]}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm text-gray-500">{user.position ?? "—"}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm font-semibold text-gray-900">{totalHours}</span>
                                            <span className="text-xs text-gray-400 ml-1">/ {maxHours} ч</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${loadColors[loadStatus]}`}>
                                                {loadLabels[loadStatus]}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm text-gray-700">{activeTasksCount}</span>
                                        </td>
                                        <td className="py-3 px-4 w-48">
                                            <div className="bg-gray-200 rounded-full h-2 w-full">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${loadStatus === "overload" ? "bg-red-500" :
                                                            loadStatus === "high" ? "bg-yellow-500" : "bg-green-500"
                                                        }`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">{Math.round(percent)}%</p>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}