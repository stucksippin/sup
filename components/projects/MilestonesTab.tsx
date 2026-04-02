"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Milestone } from "@/types";
import { MILESTONE_STATUS_LABEL, MILESTONE_STATUS_COLOR } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface MilestoneWithCount extends Milestone {
    _count: { tasks: number };
}

interface MilestoneFormData {
    title: string;
    description: string;
    plannedDate: string;
    actualDate: string;
    status: string;
}

const emptyForm: MilestoneFormData = {
    title: "",
    description: "",
    plannedDate: "",
    actualDate: "",
    status: "PLANNED",
};

export default function MilestonesTab({
    projectId,
}: {
    projectId: string;
}) {
    const [milestones, setMilestones] = useState<MilestoneWithCount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<MilestoneFormData>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    function loadMilestones() {
        fetch(`/api/projects/${projectId}/milestones`)
            .then((r) => r.json())
            .then((data) => {
                setMilestones(data);
                setLoading(false);
            });
    }

    useEffect(() => {
        loadMilestones();
    }, [projectId]);

    function handleEdit(m: MilestoneWithCount) {
        setEditingId(m.id);
        setForm({
            title: m.title,
            description: m.description || "",
            plannedDate: m.plannedDate.split("T")[0],
            actualDate: m.actualDate ? m.actualDate.split("T")[0] : "",
            status: m.status,
        });
        setShowForm(true);
    }

    function handleNew() {
        setEditingId(null);
        setForm(emptyForm);
        setShowForm(true);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        if (editingId) {
            await fetch(`/api/milestones/${editingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
        } else {
            await fetch(`/api/projects/${projectId}/milestones`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
        }

        setSaving(false);
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        loadMilestones();
    }

    async function handleDelete() {
        if (!deleteId) return;
        await fetch(`/api/milestones/${deleteId}`, { method: "DELETE" });
        setDeleteId(null);
        loadMilestones();
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Вех: {milestones.length}</p>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus size={15} />
                    Добавить веху
                </button>
            </div>

            {/* Форма создания/редактирования */}
            {showForm && (
                <form
                    onSubmit={handleSave}
                    className="bg-white border border-blue-200 rounded-xl p-5 space-y-4"
                >
                    <h3 className="text-sm font-semibold text-gray-900">
                        {editingId ? "Редактирование вехи" : "Новая веха"}
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Название <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Название вехи"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                        <textarea
                            rows={2}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Плановая дата <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="date"
                                value={form.plannedDate}
                                onChange={(e) => setForm({ ...form, plannedDate: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Фактическая дата</label>
                            <input
                                type="date"
                                value={form.actualDate}
                                onChange={(e) => setForm({ ...form, actualDate: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="PLANNED">Запланирована</option>
                                <option value="ACHIEVED">Достигнута</option>
                                <option value="OVERDUE">Просрочена</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {saving ? "Сохранение..." : editingId ? "Сохранить" : "Создать"}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
                            className="px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            )}

            {/* Список вех */}
            {loading ? (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
                    Загрузка...
                </div>
            ) : milestones.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <p className="text-gray-500 text-sm">Вехи не добавлены</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {milestones.map((m) => {
                        const isOverdue = m.status === "PLANNED" && new Date(m.plannedDate) < new Date();
                        return (
                            <div
                                key={m.id}
                                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${m.status === "ACHIEVED" ? "bg-green-500" :
                                            isOverdue ? "bg-red-500" : "bg-gray-300"
                                        }`} />
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-sm font-medium text-gray-900">{m.title}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isOverdue && m.status === "PLANNED"
                                                    ? "bg-red-100 text-red-700"
                                                    : MILESTONE_STATUS_COLOR[m.status]
                                                }`}>
                                                {isOverdue && m.status === "PLANNED" ? "Просрочена" : MILESTONE_STATUS_LABEL[m.status]}
                                            </span>
                                        </div>
                                        {m.description && (
                                            <p className="text-xs text-gray-500 mb-1">{m.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span>План: {new Date(m.plannedDate).toLocaleDateString("ru-RU")}</span>
                                            {m.actualDate && (
                                                <span>Факт: {new Date(m.actualDate).toLocaleDateString("ru-RU")}</span>
                                            )}
                                            <span>Задач: {m._count.tasks}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(m)}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(m.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {deleteId && (
                <ConfirmModal
                    title="Удалить веху?"
                    description="Задачи привязанные к вехе не удалятся, но потеряют привязку."
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}
        </div>
    );
}