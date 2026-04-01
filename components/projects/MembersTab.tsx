"use client";

import { useEffect, useState } from "react";
import type { ProjectMember, User } from "@/types";

export default function MembersTab({
    projectId,
    members,
    onUpdate,
}: {
    projectId: string;
    members: ProjectMember[];
    onUpdate: () => void;
}) {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetch("/api/users").then((r) => r.json()).then(setAllUsers);
    }, []);

    const memberIds = members.map((m) => m.user.id);
    const available = allUsers.filter((u) => !memberIds.includes(u.id));

    async function handleAdd() {
        if (!selectedUser) return;
        setAdding(true);
        await fetch(`/api/projects/${projectId}/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: selectedUser, role: "EXECUTOR" }),
        });
        setSelectedUser("");
        setAdding(false);
        onUpdate();
    }

    async function handleRemove(userId: string) {
        await fetch(`/api/projects/${projectId}/members?userId=${userId}`, {
            method: "DELETE",
        });
        onUpdate();
    }

    return (
        <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Добавить участника</h2>
                <div className="flex gap-2">
                    <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Выберите сотрудника...</option>
                        {available.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleAdd}
                        disabled={!selectedUser || adding}
                        className="px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        Добавить
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                    Команда ({members.length})
                </h2>
                {members.length === 0 ? (
                    <p className="text-sm text-gray-400">Участники не добавлены</p>
                ) : (
                    <div className="space-y-2">
                        {members.map((m) => (
                            <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-medium">
                                        {m.user.name[0]}
                                    </div>
                                    <span className="text-sm text-gray-900">{m.user.name}</span>
                                </div>
                                <button
                                    onClick={() => handleRemove(m.user.id)}
                                    className="text-xs text-red-400 hover:text-red-600"
                                >
                                    Удалить
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}