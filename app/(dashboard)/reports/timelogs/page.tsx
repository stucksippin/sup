"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface TimeLog {
    id: string;
    date: string;
    hours: number;
    comment: string | null;
    user: { id: string; name: string };
    task: {
        id: string;
        title: string;
        projectId: string;
        project: { id: string; title: string };
    };
}

interface Project {
    id: string;
    title: string;
}

export default function TimelogsReportPage() {
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [filters, setFilters] = useState({
        from: "",
        to: "",
        projectId: "",
    });

    useEffect(() => {
        fetch("/api/projects")
            .then((r) => r.json())
            .then(setProjects);
    }, []);

    async function loadReport() {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.from) params.set("from", filters.from);
        if (filters.to) params.set("to", filters.to);
        if (filters.projectId) params.set("projectId", filters.projectId);

        const res = await fetch(`/api/reports/timelogs?${params}`);
        const data = await res.json();
        setTimeLogs(data.timeLogs || []);
        setLoading(false);
    }

    async function handleExport() {
        setExporting(true);
        const params = new URLSearchParams();
        if (filters.from) params.set("from", filters.from);
        if (filters.to) params.set("to", filters.to);
        if (filters.projectId) params.set("projectId", filters.projectId);

        const res = await fetch(`/api/reports/timelogs/export?${params}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "timelogs-report.xlsx";
        a.click();
        URL.revokeObjectURL(url);
        setExporting(false);
    }

    const totalHours = timeLogs.reduce((s, l) => s + l.hours, 0);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Отчёт по трудозатратам</h1>
                    <p className="text-gray-500 text-sm mt-1">Фактические трудозатраты по сотрудникам и задачам</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting || timeLogs.length === 0}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                    <Download size={16} />
                    {exporting ? "Экспорт..." : "Скачать Excel"}
                </button>
            </div>

            {/* Фильтры */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
                <div className="grid grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">С даты</label>
                        <input
                            type="date"
                            value={filters.from}
                            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">По дату</label>
                        <input
                            type="date"
                            value={filters.to}
                            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Проект</label>
                        <select
                            value={filters.projectId}
                            onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Все проекты</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={loadReport}
                        disabled={loading}
                        className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Загрузка..." : "Применить"}
                    </button>
                </div>
            </div>

            {timeLogs.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <p className="text-gray-500 text-sm">Выберите фильтры и нажмите «Применить»</p>
                </div>
            ) : (
                <>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-center justify-between">
                        <p className="text-sm text-gray-500">Записей: {timeLogs.length}</p>
                        <p className="text-sm font-semibold text-gray-900">Итого: {totalHours} ч</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Сотрудник</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Проект</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Задача</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Дата</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Часов</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Комментарий</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timeLogs.map((log) => (
                                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-900">{log.user.name}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{log.task.project.title}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{log.task.title}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {new Date(log.date).toLocaleDateString("ru-RU")}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{log.hours} ч</td>
                                        <td className="py-3 px-4 text-sm text-gray-500">{log.comment || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}