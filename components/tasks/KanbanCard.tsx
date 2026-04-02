"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import type { TaskListItem } from "@/types";
import { PRIORITY_DOT_COLOR, PRIORITY_LABEL } from "@/types";

interface KanbanCardProps {
    task: TaskListItem;
    projectId: string;
}

export default function KanbanCard({ task, projectId }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const isOverdue =
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        task.status !== "DONE";

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white border border-gray-200 rounded-xl p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <Link
                    href={`/projects/${projectId}/tasks/${task.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 leading-snug"
                    onClick={(e) => e.stopPropagation()}
                >
                    {task.title}
                </Link>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${PRIORITY_DOT_COLOR[task.priority]}`} />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex -space-x-1">
                    {task.assignees.slice(0, 3).map(({ user }) => (
                        <div
                            key={user.id}
                            title={user.name}
                            className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white"
                        >
                            {user.name[0]}
                        </div>
                    ))}
                </div>

                {task.dueDate && (
                    <span className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-gray-400"}`}>
                        {new Date(task.dueDate).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                    </span>
                )}
            </div>

            {task.plannedHours && (
                <div className="mt-2 text-xs text-gray-400">
                    {PRIORITY_LABEL[task.priority]} · {task.plannedHours} ч
                </div>
            )}
        </div>
    );
}