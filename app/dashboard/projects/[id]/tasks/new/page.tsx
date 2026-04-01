"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface User {
    id: string;
    name: string;
}

interface Milestone {
    id: string;
    title: string;
}

export default function NewTaskPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [members, setMembers] = useState<User[]>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

    useEffect(() => {
        fetch(`/api/projects/${id}`)
            .then((r) => r.json())
            .then((project) => {
                setMembers(project.members.map((m: any) => m.user));
                setMilestones(project.milestones || []);
            });
    }, [id]);

    function toggleAssignee(userId: string) {
        setSelectedAssignees((prev) =>
            prev.includes(userId) ? prev.filter((i) => i !== userId) : [...prev, userId]
        );
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        const res = await fetch(`/api/projects/${id}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: formData.get("title"),
                description: formData.get("description"),
                status: formData.get("status"),
                priority: formData.get("priority"),
                startDate: formData.get("startDate"),
                dueDate: formData.get("dueDate"),
                plannedHours: formData.get("plannedHours"),
                milestoneId: formData.get("milestoneId"),
                assigneeIds: selectedAssignees,
            }),
        });

        setLoading(false);

        if (!res.ok) {
            setError("Ошибка при создании задачи");
        } else {
            router.push(`/dashboard/projects/${id}/tasks`);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href={`/dashboard/projects/${id}/tasks`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Новая задача</h1>
                    <p className="text-gray-500 text-sm">Заполните информацию о задаче</p>
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
                        maxLength={300}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Название задачи"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                    <textarea
                        name="description"
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Описание задачи"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                        <select
                            name="status"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="NEW">Новая</option>
                            <option value="IN_PROGRESS">В работе</option>
                            <option value="ON_REVIEW">На проверке</option>
                            <option value="DONE">Выполнена</option>
                            <option value="CANCELLED">Отменена</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Приоритет</label>
                        <select
                            name="priority"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="LOW">Низкий</option>
                            <option value="MEDIUM">Средний</option>
                            <option value="HIGH">Высокий</option>
                            <option value="CRITICAL">Критический</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
                        <input
                            name="startDate"
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Срок выполнения</label>
                        <input
                            name="dueDate"
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Плановые часы
                        </label>
                        <input
                            name="plannedHours"
                            type="number"
                            min="0"
                            step="0.5"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Веха</label>
                        <select
                            name="milestoneId"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Без вехи</option>
                            {milestones.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {members.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Исполнители
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {members.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => toggleAssignee(user.id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${selectedAssignees.includes(user.id)
                                            ? "bg-blue-50 border-blue-400 text-blue-700"
                                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                        {user.name[0]}
                                    </div>
                                    {user.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Создание..." : "Создать задачу"}
                    </button>
                    <Link
                        href={`/dashboard/projects/${id}/tasks`}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    );
}