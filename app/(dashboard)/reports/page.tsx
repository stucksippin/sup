"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart2, Clock, Download } from "lucide-react";
import Link from "next/link";

interface Project {
    id: string;
    title: string;
    status: string;
}

export default function ReportsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/projects")
            .then((r) => r.json())
            .then((data) => {
                setProjects(data);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Отчёты</h1>
                <p className="text-gray-500 text-sm mt-1">Аналитика и экспорт данных</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <Link
                    href="/reports/timelogs"
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Clock size={20} className="text-blue-600" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">Трудозатраты</h2>
                    </div>
                    <p className="text-sm text-gray-500">
                        Сводная таблица фактических трудозатрат по сотрудникам и задачам за период. Экспорт в Excel.
                    </p>
                </Link>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <BarChart2 size={20} className="text-green-600" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">По проектам</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        Выберите проект для просмотра отчёта о прогрессе, трудозатратах и вехах.
                    </p>
                    {loading ? (
                        <div className="h-8 bg-gray-100 rounded animate-pulse" />
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {projects.map((p) => (
                                <Link
                                    key={p.id}
                                    href={`/reports/projects/${p.id}`}
                                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors text-sm text-gray-700"
                                >
                                    <span>{p.title}</span>
                                    <BarChart2 size={14} className="text-gray-400" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}