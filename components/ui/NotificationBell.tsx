"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";
import Link from "next/link";

interface Notification {
    id: string;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    entityType: string | null;
    entityId: string | null;
}

const typeIcon: Record<string, string> = {
    TASK_ASSIGNED: "👤",
    TASK_STATUS_CHANGED: "🔄",
    TASK_DUE_SOON: "⏰",
    TASK_OVERDUE: "⚠️",
    TASK_COMMENTED: "💬",
    PROJECT_STATUS_CHANGED: "📁",
};

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    function loadNotifications() {
        fetch("/api/notifications")
            .then((r) => r.json())
            .then((data) => {
                if (data.notifications) {
                    setNotifications(data.notifications);
                    setUnreadCount(data.unreadCount);
                }
            })
            .catch(() => { });
    }

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function markAllRead() {
        await fetch("/api/notifications", { method: "PATCH" });
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
    }

    async function markRead(id: string) {
        await fetch(`/api/notifications/${id}`, { method: "PATCH" });
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    function getEntityLink(notification: Notification) {
        if (notification.entityType === "task" && notification.entityId) {
            return null; // нет projectId здесь, поэтому просто null
        }
        return null;
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Уведомления {unreadCount > 0 && `(${unreadCount})`}
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                                <Check size={12} />
                                Прочитать все
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-sm text-gray-400">Уведомлений нет</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => !n.isRead && markRead(n.id)}
                                    className={`flex gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-blue-50" : ""
                                        }`}
                                >
                                    <span className="text-lg flex-shrink-0">{typeIcon[n.type] ?? "🔔"}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!n.isRead ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                            {n.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(n.createdAt).toLocaleString("ru-RU")}
                                        </p>
                                    </div>
                                    {!n.isRead && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}