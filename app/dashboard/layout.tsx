"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    LogOut,
    Bell,
    ChevronDown,
} from "lucide-react";
import { useState } from "react";

const navItems = [
    { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
    { href: "/dashboard/projects", label: "Проекты", icon: FolderKanban },
    { href: "/dashboard/users", label: "Сотрудники", icon: Users },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Сайдбар */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
                {/* Лого */}
                <div className="px-6 py-5 border-b border-gray-200">
                    <h1 className="text-lg font-bold text-gray-900">СУП</h1>
                    <p className="text-xs text-gray-500">Система управления проектами</p>
                </div>

                {/* Навигация */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Пользователь */}
                <div className="px-3 py-4 border-t border-gray-200">
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {session?.user?.name?.[0] ?? "U"}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {session?.user?.name ?? "Пользователь"}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {session?.user?.email}
                                </p>
                            </div>
                            <ChevronDown size={16} className="text-gray-400" />
                        </button>

                        {userMenuOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                <button
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={16} />
                                    Выйти
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Основной контент */}
            <div className="flex-1 ml-64 flex flex-col">
                {/* Шапка */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div />
                    <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                </header>

                {/* Контент */}
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}