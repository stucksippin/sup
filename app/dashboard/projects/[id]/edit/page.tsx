"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { User } from "@/types";

export default function EditProjectPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [managers, setManagers] = useState<User[]>([]);
    const [form, setForm] = useState({
        title: "",
        description: "",
        customer: "",
        managerId: "",
        status: "NEW",
        priority: "MEDIUM",
        startDate: "",
        endDate: "",
        budget: "",
        category: "",
    });

    useEffect(() => {
        Promise.all([
            fetch(`/api/projects/${id}`).then((r) => r.json()),
            fetch("/api/users?role=MANAGER,ADMIN").then((r) => r.json()),
        ]).then(([project, users]) => {
            setManagers(users);
            setForm({
                title: project.title || "",
                description: project.description || "",
                customer: project.customer || "",
                managerId: project.manager?.id || "",
                status: project.status || "NEW",
                priority: project.priority || "MEDIUM",
                startDate: project.startDate ? project.startDate.split("T")[0] : "",
                endDate: project.endDate ? project.endDate.split("T")[0] : "",
                budget: project.budget ? String(project.budget) : "",
                category: project.category || "",
            });
            setFetching(false);
        });
    }, [id]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch(`/api/projects/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        setLoading(false);

        if (!res.ok) {
            setError("Ошибка при сохранении");
        } else {
            router.push(`/dashboard/projects/${id}`);
        }
    }

    if (fetching) {
        return (
            <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-64 bg-gray-100 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href={`/dashboard/projects/${id}`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Редактирование проекта</h1>
                    <p className="text-gray-500 text-sm">Измените нужные поля и сохраните</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Название <span className="text-red-500">*</span>
                    </label>
                    <input
                        required
                        maxLength={200}
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Описание
                    </label>
                    <textarea
                        maxLength={2000}
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="NEW">Новый</option>
                            <option value="IN_PROGRESS">В работе</option>
                            <option value="ON_HOLD">Приостановлен</option>
                            <option value="COMPLETED">Завершён</option>
                            <option value="CANCELLED">Отменён</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Приоритет</label>
                        <select
                            value={form.priority}
                            onChange={(e) => setForm({ ...form, priority: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="LOW">Низкий</option>
                            <option value="MEDIUM">Средний</option>
                            <option value="HIGH">Высокий</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Руководитель проекта
                    </label>
                    <select
                        value={form.managerId}
                        onChange={(e) => setForm({ ...form, managerId: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {managers.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Заказчик</label>
                    <input
                        value={form.customer}
                        onChange={(e) => setForm({ ...form, customer: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
                        <input
                            type="date"
                            value={form.startDate}
                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Дата завершения</label>
                        <input
                            type="date"
                            value={form.endDate}
                            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Бюджет</label>
                        <input
                            type="number"
                            min="0"
                            value={form.budget}
                            onChange={(e) => setForm({ ...form, budget: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Направление</label>
                        <input
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Сохранение..." : "Сохранить изменения"}
                    </button>
                    <Link
                        href={`/dashboard/projects/${id}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    );
}