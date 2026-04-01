"use client";

import Link from "next/link";

interface User {
    id: string;
    name: string;
}

interface Milestone {
    id: string;
    title: string;
}

interface TaskFormData {
    title: string;
    description: string;
    status: string;
    priority: string;
    startDate: string;
    dueDate: string;
    plannedHours: string;
    milestoneId: string;
}

interface TaskFormProps {
    form: TaskFormData;
    onChange: (form: TaskFormData) => void;
    members: User[];
    milestones: Milestone[];
    selectedAssignees: string[];
    onToggleAssignee: (userId: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    loading: boolean;
    error: string;
    submitLabel: string;
    cancelHref: string;
    showParentTask?: boolean;
}

export default function TaskForm({
    form,
    onChange,
    members,
    milestones,
    selectedAssignees,
    onToggleAssignee,
    onSubmit,
    loading,
    error,
    submitLabel,
    cancelHref,
    showParentTask = true,
}: TaskFormProps) {
    return (
        <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название <span className="text-red-500">*</span>
                </label>
                <input
                    required
                    maxLength={300}
                    value={form.title}
                    onChange={(e) => onChange({ ...form, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Название задачи"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => onChange({ ...form, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Описание задачи"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                    <select
                        value={form.status}
                        onChange={(e) => onChange({ ...form, status: e.target.value })}
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
                        onChange={(e) => onChange({ ...form, priority: e.target.value })}
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
                        onChange={(e) => onChange({ ...form, startDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Срок выполнения</label>
                    <input
                        type="date"
                        value={form.dueDate}
                        onChange={(e) => onChange({ ...form, dueDate: e.target.value })}
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
                        onChange={(e) => onChange({ ...form, plannedHours: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                    />
                </div>
                {showParentTask && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Веха</label>
                        <select
                            value={form.milestoneId}
                            onChange={(e) => onChange({ ...form, milestoneId: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Без вехи</option>
                            {milestones.map((m) => (
                                <option key={m.id} value={m.id}>{m.title}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {members.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Исполнители</label>
                    <div className="flex flex-wrap gap-2">
                        {members.map((user) => (
                            <button
                                key={user.id}
                                type="button"
                                onClick={() => onToggleAssignee(user.id)}
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
                    {loading ? "Сохранение..." : submitLabel}
                </button>
                <Link
                    href={cancelHref}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Отмена
                </Link>
            </div>
        </form>
    );
}