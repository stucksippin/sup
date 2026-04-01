"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, Clock } from "lucide-react";
import { useSession } from "next-auth/react";

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    startDate: string | null;
    dueDate: string | null;
    plannedHours: number | null;
    assignees: { user: { id: string; name: string } }[];
    milestone: { id: string; title: string } | null;
    subTasks: {
        id: string;
        title: string;
        status: string;
        assignees: { user: { id: string; name: string } }[];
    }[];
    comments: {
        id: string;
        text: string;
        createdAt: string;
        author: { id: string; name: string };
    }[];
    timeLogs: {
        id: string;
        date: string;
        hours: number;
        comment: string | null;
        user: { id: string; name: string };
    }[];
}

const statusLabel: Record<string, string> = {
    NEW: "Новая",
    IN_PROGRESS: "В работе",
    ON_REVIEW: "На проверке",
    DONE: "Выполнена",
    CANCELLED: "Отменена",
};

const statusColor: Record<string, string> = {
    NEW: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    ON_REVIEW: "bg-yellow-100 text-yellow-700",
    DONE: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
};

const priorityLabel: Record<string, string> = {
    LOW: "Низкий",
    MEDIUM: "Средний",
    HIGH: "Высокий",
    CRITICAL: "Критический",
};

export default function TaskPage() {
    const { id, taskId } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [timeLogForm, setTimeLogForm] = useState({
        show: false,
        date: new Date().toISOString().split("T")[0],
        hours: "",
        comment: "",
    });

    function loadTask() {
        fetch(`/api/tasks/${taskId}`)
            .then((r) => r.json())
            .then((data) => {
                setTask(data);
                setLoading(false);
            });
    }

    useEffect(() => {
        loadTask();
    }, [taskId]);

    async function handleStatusChange(status: string) {
        await fetch(`/api/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...task, status }),
        });
        loadTask();
    }

    async function handleAddComment() {
        if (!commentText.trim()) return;
        setCommentLoading(true);
        await fetch(`/api/tasks/${taskId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: commentText }),
        });
        setCommentText("");
        setCommentLoading(false);
        loadTask();
    }

    async function handleDeleteComment(commentId: string) {
        await fetch(`/api/tasks/${taskId}/comments/${commentId}`, {
            method: "DELETE",
        });
        loadTask();
    }

    async function handleAddTimeLog() {
        if (!timeLogForm.hours) return;
        await fetch(`/api/tasks/${taskId}/timelogs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                date: timeLogForm.date,
                hours: parseFloat(timeLogForm.hours),
                comment: timeLogForm.comment,
            }),
        });
        setTimeLogForm({ show: false, date: new Date().toISOString().split("T")[0], hours: "", comment: "" });
        loadTask();
    }

    async function handleDeleteTimeLog(logId: string) {
        await fetch(`/api/tasks/${taskId}/timelogs/${logId}`, { method: "DELETE" });
        loadTask();
    }

    async function handleDeleteTask() {
        await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
        router.push(`/dashboard/projects/${id}/tasks`);
    }

    async function handleSubtaskStatusChange(subTaskId: string, status: string) {
        await fetch(`/api/tasks/${subTaskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        loadTask();
    }

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-32 bg-gray-100 rounded-xl" />
            </div>
        );
    }

    if (!task) return <p className="text-gray-500">Задача не найдена</p>;

    const totalLoggedHours = task.timeLogs.reduce((sum, l) => sum + l.hours, 0);
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
    const completedSubtasks = task.subTasks.filter((s) => s.status === "DONE").length;

    return (
        <div>
            {/* Шапка */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3">
                    <Link
                        href={`/dashboard/projects/${id}/tasks`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[task.status]}`}>
                                {statusLabel[task.status]}
                            </span>
                        </div>
                        {task.milestone && (
                            <p className="text-xs text-gray-500">Веха: {task.milestone.title}</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setDeleteConfirm(true)}
                    className="flex items-center gap-2 px-3 py-2 border border-red-300 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                    <Trash2 size={15} />
                    Удалить
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {/* Левая колонка */}
                <div className="col-span-2 space-y-4">
                    {/* Описание */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-2">Описание</h2>
                        <p className="text-sm text-gray-600">{task.description || "Описание не указано"}</p>
                    </div>

                    {/* Подзадачи */}
                    {task.subTasks.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-semibold text-gray-700">
                                    Подзадачи ({completedSubtasks}/{task.subTasks.length})
                                </h2>
                                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                                        style={{
                                            width: task.subTasks.length
                                                ? `${(completedSubtasks / task.subTasks.length) * 100}%`
                                                : "0%",
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                {task.subTasks.map((sub) => (
                                    <div key={sub.id} className="flex items-center gap-3 py-1">
                                        <input
                                            type="checkbox"
                                            checked={sub.status === "DONE"}
                                            onChange={(e) =>
                                                handleSubtaskStatusChange(sub.id, e.target.checked ? "DONE" : "NEW")
                                            }
                                            className="rounded border-gray-300 text-blue-600"
                                        />
                                        <Link
                                            href={`/dashboard/projects/${id}/tasks/${sub.id}`}
                                            className={`text-sm flex-1 hover:text-blue-600 ${sub.status === "DONE" ? "line-through text-gray-400" : "text-gray-800"
                                                }`}
                                        >
                                            {sub.title}
                                        </Link>
                                        {sub.assignees[0] && (
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                                {sub.assignees[0].user.name[0]}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Link
                                href={`/dashboard/projects/${id}/tasks/new?parentTaskId=${task.id}`}
                                className="text-xs text-blue-600 hover:underline mt-3 inline-block"
                            >
                                + Добавить подзадачу
                            </Link>
                        </div>
                    )}

                    {task.subTasks.length === 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-gray-700">Подзадачи</h2>
                                <Link
                                    href={`/dashboard/projects/${id}/tasks/new?parentTaskId=${task.id}`}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    + Добавить подзадачу
                                </Link>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">Подзадач нет</p>
                        </div>
                    )}

                    {/* Журнал времени */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-gray-700">
                                Трудозатраты
                            </h2>
                            <button
                                onClick={() => setTimeLogForm({ ...timeLogForm, show: !timeLogForm.show })}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                                <Plus size={14} />
                                Добавить запись
                            </button>
                        </div>

                        {/* Прогресс план/факт */}
                        {task.plannedHours && (
                            <div className="mb-3">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Факт: {totalLoggedHours} ч</span>
                                    <span>План: {task.plannedHours} ч</span>
                                </div>
                                <div className="bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${totalLoggedHours > task.plannedHours ? "bg-red-500" : "bg-blue-500"
                                            }`}
                                        style={{
                                            width: `${Math.min((totalLoggedHours / task.plannedHours) * 100, 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {timeLogForm.show && (
                            <div className="border border-gray-200 rounded-lg p-3 mb-3 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Дата</label>
                                        <input
                                            type="date"
                                            value={timeLogForm.date}
                                            onChange={(e) => setTimeLogForm({ ...timeLogForm, date: e.target.value })}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Часов</label>
                                        <input
                                            type="number"
                                            min="0.5"
                                            step="0.5"
                                            value={timeLogForm.hours}
                                            onChange={(e) => setTimeLogForm({ ...timeLogForm, hours: e.target.value })}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={timeLogForm.comment}
                                    onChange={(e) => setTimeLogForm({ ...timeLogForm, comment: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Комментарий (необязательно)"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddTimeLog}
                                        className="flex-1 bg-blue-600 text-white rounded py-1 text-sm hover:bg-blue-700 transition-colors"
                                    >
                                        Сохранить
                                    </button>
                                    <button
                                        onClick={() => setTimeLogForm({ ...timeLogForm, show: false })}
                                        className="px-3 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        )}

                        {task.timeLogs.length === 0 ? (
                            <p className="text-sm text-gray-400">Записей нет</p>
                        ) : (
                            <div className="space-y-2">
                                {task.timeLogs.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-gray-400" />
                                            <span className="text-sm text-gray-700 font-medium">{log.hours} ч</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(log.date).toLocaleDateString("ru-RU")} · {log.user.name}
                                            </span>
                                            {log.comment && (
                                                <span className="text-xs text-gray-400">— {log.comment}</span>
                                            )}
                                        </div>
                                        {session?.user?.id === log.user.id && (
                                            <button
                                                onClick={() => handleDeleteTimeLog(log.id)}
                                                className="text-xs text-red-400 hover:text-red-600"
                                            >
                                                Удалить
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Комментарии */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">
                            Комментарии ({task.comments.length})
                        </h2>

                        <div className="space-y-3 mb-4">
                            {task.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-medium flex-shrink-0">
                                        {comment.author.name[0]}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-900">{comment.author.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400">
                                                    {new Date(comment.createdAt).toLocaleString("ru-RU")}
                                                </span>
                                                {session?.user?.id === comment.author.id && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="text-xs text-red-400 hover:text-red-600"
                                                    >
                                                        Удалить
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                rows={2}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Напишите комментарий..."
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={commentLoading || !commentText.trim()}
                                className="px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                Отправить
                            </button>
                        </div>
                    </div>
                </div>

                {/* Правая колонка */}
                <div className="space-y-4">
                    {/* Смена статуса */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">Статус</h2>
                        <div className="space-y-1">
                            {Object.entries(statusLabel).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => handleStatusChange(key)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${task.status === key
                                            ? statusColor[key] + " font-medium"
                                            : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Детали */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">Детали</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Приоритет</span>
                                <span className="text-gray-900">{priorityLabel[task.priority]}</span>
                            </div>
                            {task.startDate && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Начало</span>
                                    <span className="text-gray-900">
                                        {new Date(task.startDate).toLocaleDateString("ru-RU")}
                                    </span>
                                </div>
                            )}
                            {task.dueDate && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Срок</span>
                                    <span className={isOverdue ? "text-red-600 font-medium" : "text-gray-900"}>
                                        {new Date(task.dueDate).toLocaleDateString("ru-RU")}
                                        {isOverdue && " ⚠️"}
                                    </span>
                                </div>
                            )}
                            {task.plannedHours && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">План</span>
                                    <span className="text-gray-900">{task.plannedHours} ч</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Факт</span>
                                <span className={totalLoggedHours > (task.plannedHours || Infinity) ? "text-red-600 font-medium" : "text-gray-900"}>
                                    {totalLoggedHours} ч
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Исполнители */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">Исполнители</h2>
                        {task.assignees.length === 0 ? (
                            <p className="text-sm text-gray-400">Не назначены</p>
                        ) : (
                            <div className="space-y-2">
                                {task.assignees.map(({ user }) => (
                                    <div key={user.id} className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-medium">
                                            {user.name[0]}
                                        </div>
                                        <span className="text-sm text-gray-700">{user.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Модал удаления */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Удалить задачу?</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Это действие удалит задачу со всеми комментариями и записями времени.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteTask}
                                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                                Удалить
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}