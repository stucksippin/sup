"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { User } from "@/types";

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [managers, setManagers] = useState<User[]>([]);

    useEffect(() => {
        fetch("/api/users?role=MANAGER,ADMIN")
            .then((r) => r.json())
            .then(setManagers);
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        const res = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: formData.get("title"),
                description: formData.get("description"),
                customer: formData.get("customer"),
                managerId: formData.get("managerId"),
                status: formData.get("status"),
                priority: formData.get("priority"),
                startDate: formData.get("startDate"),
                endDate: formData.get("endDate"),
                budget: formData.get("budget"),
                category: formData.get("category"),
            }),
        });

        setLoading(false);

        if (!res.ok) {
            setError("Ошибка при создании проекта");
        } else {
            router.push("/dashboard/projects");
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/dashboard/projects"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Новый проект</h1>
                    <p className="text-gray-500 text-sm">Заполните информацию о проекте</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Название <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="title"
                        required
                        maxLength={200}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Название проекта"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Описание
                    </label>
                    <textarea
                        name="description"
                        maxLength={2000}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Описание проекта"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Статус
                        </label>
                        <select
                            name="status"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Приоритет
                        </label>
                        <select
                            name="priority"
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
                        name="managerId"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Заказчик
                    </label>
                    <input
                        name="customer"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Название компании или ФИО"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Дата начала
                        </label>
                        <input
                            name="startDate"
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Дата завершения
                        </label>
                        <input
                            name="endDate"
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Бюджет
                        </label>
                        <input
                            name="budget"
                            type="number"
                            min="0"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Направление
                        </label>
                        <input
                            name="category"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Например: IT, Строительство"
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
                        {loading ? "Создание..." : "Создать проект"}
                    </button>
                    <Link
                        href="/dashboard/projects"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    );
}