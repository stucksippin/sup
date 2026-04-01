"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Task } from "@/types";

interface User {
    id: string;
    name: string;
}

interface Milestone {
    id: string;
    title: string;
}

export default function EditTaskPage() {
    const { id, taskId } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [members, setMembers] = useState<User[]>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
    const [form, setForm] = useState({
        title: "",
        description: "",
        status: "NEW",
        priority: "MEDIUM",
        startDate: "",
        dueDate: "",
        plannedHours: "",
        milestoneId: "",
    });

    useEffect(() => {
        Promise.all([
            fetch(`/api/tasks/${taskId}`).then((r) => r.json()),
            fetch(`/api/projects/${id}`).then((r) => r.json()),
        ]).then(([task, project]) => {
            setForm({
                title: task.title || "",
                description: task.description || "",
                status: task.status || "NEW",
                priority: task.priority || "MEDIUM",
                startDate: task.startDate ? task.startDate.split("T")[0] : "",
                dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
                plannedHours: task.plannedHours ? String(task.plannedHours) : "",
                milestoneId: task.milestone?.id || "",
            });
            setSelectedAssignees(task.assignees.map((a: any) => a.user.id));
            setMembers(project.members.map((m: any) => m.user));
            setMilestones(project.milestones || []);
            setFetching(false);
        });
    }, [id, taskId]);

    function toggleAssignee(userId: string) {
        setSelectedAssignees((prev) =>
            prev.includes(userId) ? prev.filter((i) => i !== userId) : [...prev, userId]
        );
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch(`/api/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                plannedHours: form.plannedHours ? parseFloat(form.plannedHours) : null,
                milestoneId: form.milestoneId || null,
                assigneeIds: selectedAssignees,
            }),
        });

        setLoading(false);

        if (!res.ok) {
            setError("Ошибка при сохранении");
        } else {
            router.push(`/dashboard/projects/${id}/tasks/${taskId}`);
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
                    href={`/dashboard/projects/${id}/tasks/${taskId}`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Редактирование задачи</h1>
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
                        maxLength={300}
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                    <textarea
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
                            value={form.priority}
                            onChange={(e) => setForm({ ...form, priority: e.target.value })}
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
                            type="date"
                            value={form.startDate}
                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Срок выполнения</label>
                        <input
                            type="date"
                            value={form.dueDate}
                            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Плановые часы</label>
                        <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={form.plannedHours}
                            onChange={(e) => setForm({ ...form, plannedHours: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Веха</label>
                        <select
                            value={form.milestoneId}
                            onChange={(e) => setForm({ ...form, milestoneId: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Без вехи</option>
                            {milestones.map((m) => (
                                <option key={m.id} value={m.id}>{m.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {members.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Исполнители</label>
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
                        {loading ? "Сохранение..." : "Сохранить изменения"}
                    </button>
                    <Link
                        href={`/dashboard/projects/${id}/tasks/${taskId}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    );
}