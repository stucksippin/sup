"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { PRIORITY_BADGE_COLOR } from "@/types";

const roleLabel: Record<string, string> = {
    ADMIN: "Администратор",
    MANAGER: "Руководитель",
    EXECUTOR: "Исполнитель",
    OBSERVER: "Наблюдатель",
};

const roleColor: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700",
    MANAGER: "bg-blue-100 text-blue-700",
    EXECUTOR: "bg-gray-100 text-gray-700",
    OBSERVER: "bg-yellow-100 text-yellow-700",
};

interface UserWithCount extends User {
    _count: { taskAssignees: number };
}

export default function UsersPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<UserWithCount[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");

    useEffect(() => {
        if (session && session.user.role !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [session]);

    useEffect(() => {
        fetch("/api/users")
            .then((r) => r.json())
            .then((data) => {
                setUsers(data);
                setLoading(false);
            });
    }, []);

    const filtered = users.filter((u) => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter ? u.role === roleFilter : true;
        return matchSearch && matchRole;
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Сотрудники</h1>
                    <p className="text-gray-500 text-sm mt-1">Всего: {users.length}</p>
                </div>
                <Link
                    href="/users/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus size={16} />
                    Добавить сотрудника
                </Link>
            </div>

            {/* Фильтры */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-center gap-3">
                <Search size={18} className="text-gray-400 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Поиск по имени или email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Все роли</option>
                    <option value="ADMIN">Администратор</option>
                    <option value="MANAGER">Руководитель</option>
                    <option value="EXECUTOR">Исполнитель</option>
                    <option value="OBSERVER">Наблюдатель</option>
                </select>
            </div>

            {/* Таблица */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 text-sm">Загрузка...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 text-sm">Сотрудники не найдены</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Сотрудник</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Роль</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Должность</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Активных задач</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Статус</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((user) => (
                                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-medium">
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[user.role]}`}>
                                            {roleLabel[user.role]}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm text-gray-600">{user.position || "—"}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm text-gray-900">{user._count.taskAssignees}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            }`}>
                                            {user.isActive ? "Активен" : "Деактивирован"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <Link
                                            href={`/users/${user.id}/edit`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            Редактировать
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}