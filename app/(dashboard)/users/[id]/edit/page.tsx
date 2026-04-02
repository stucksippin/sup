"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditUserPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "",
        email: "",
        role: "EXECUTOR",
        position: "",
        skills: [] as string[],
        isActive: true,
    });
    const [skillInput, setSkillInput] = useState("");

    useEffect(() => {
        fetch(`/api/users/${id}`)
            .then((r) => r.json())
            .then((data) => {
                setForm({
                    name: data.name || "",
                    email: data.email || "",
                    role: data.role || "EXECUTOR",
                    position: data.position || "",
                    skills: data.skills || [],
                    isActive: data.isActive ?? true,
                });
                setFetching(false);
            });
    }, [id]);

    function addSkill() {
        if (!skillInput.trim()) return;
        setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
        setSkillInput("");
    }

    function removeSkill(skill: string) {
        setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch(`/api/users/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        setLoading(false);

        if (!res.ok) {
            setError("Ошибка при сохранении");
        } else {
            router.push("/users");
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
                <Link href="/users" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Редактирование сотрудника</h1>
                    <p className="text-gray-500 text-sm">Измените данные и сохраните</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
                    <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="EXECUTOR">Исполнитель</option>
                            <option value="MANAGER">Руководитель</option>
                            <option value="OBSERVER">Наблюдатель</option>
                            <option value="ADMIN">Администратор</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Должность</label>
                        <input
                            value={form.position}
                            onChange={(e) => setForm({ ...form, position: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Frontend разработчик"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Компетенции</label>
                    <div className="flex gap-2 mb-2">
                        <input
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Например: React, Python..."
                        />
                        <button
                            type="button"
                            onClick={addSkill}
                            className="px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Добавить
                        </button>
                    </div>
                    {form.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {form.skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                                >
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(skill)}
                                        className="hover:text-blue-900 ml-1"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                        Учётная запись активна
                    </label>
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
                        href="/users"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    );
}