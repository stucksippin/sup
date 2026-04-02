"use client";

import { useState, useEffect, useRef } from "react";
import { Search, FolderKanban, CheckSquare, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { TASK_STATUS_COLOR, TASK_STATUS_LABEL, PROJECT_STATUS_COLOR, STATUS_LABEL } from "@/types";

interface SearchResult {
    projects: {
        id: string;
        title: string;
        status: string;
        priority: string;
    }[];
    tasks: {
        id: string;
        title: string;
        status: string;
        priority: string;
        projectId: string;
        project: { title: string };
    }[];
}

export default function GlobalSearch() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        // Ctrl+K / Cmd+K открывает поиск
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
                setOpen(true);
            }
            if (e.key === "Escape") {
                setOpen(false);
                setQuery("");
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (!query || query.length < 2) {
            setResults(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(data);
            setLoading(false);
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    function handleSelectProject(id: string) {
        router.push(`/projects/${id}`);
        setOpen(false);
        setQuery("");
        setResults(null);
    }

    function handleSelectTask(projectId: string, taskId: string) {
        router.push(`/projects/${projectId}/tasks/${taskId}`);
        setOpen(false);
        setQuery("");
        setResults(null);
    }

    const hasResults = results && (results.projects.length > 0 || results.tasks.length > 0);
    const noResults = results && results.projects.length === 0 && results.tasks.length === 0;

    return (
        <div className="relative" ref={containerRef}>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-64">
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder="Поиск... (⌘K)"
                    className="bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none flex-1 min-w-0"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(""); setResults(null); }}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {open && query.length >= 2 && (
                <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-gray-500">Поиск...</div>
                    ) : noResults ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                            Ничего не найдено по запросу «{query}»
                        </div>
                    ) : hasResults ? (
                        <div>
                            {results.projects.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                        <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                                            <FolderKanban size={12} />
                                            Проекты
                                        </p>
                                    </div>
                                    {results.projects.map((project) => (
                                        <button
                                            key={project.id}
                                            onClick={() => handleSelectProject(project.id)}
                                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            <span className="text-sm text-gray-900 text-left">{project.title}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PROJECT_STATUS_COLOR[project.status]}`}>
                                                {STATUS_LABEL[project.status]}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {results.tasks.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                        <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                                            <CheckSquare size={12} />
                                            Задачи
                                        </p>
                                    </div>
                                    {results.tasks.map((task) => (
                                        <button
                                            key={task.id}
                                            onClick={() => handleSelectTask(task.projectId, task.id)}
                                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            <div className="text-left">
                                                <p className="text-sm text-gray-900">{task.title}</p>
                                                <p className="text-xs text-gray-400">{task.project.title}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TASK_STATUS_COLOR[task.status]}`}>
                                                {TASK_STATUS_LABEL[task.status]}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}