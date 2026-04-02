"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { TaskListItem } from "@/types";
import { TASK_STATUS_LABEL, TASK_STATUS_COLOR, PRIORITY_LABEL } from "@/types";
import PriorityDot from "@/components/ui/PriorityDot";
import StatusBadge from "@/components/ui/StatusBadge";
import Avatar from "@/components/ui/Avatar";

interface TaskRowProps {
    task: TaskListItem;
    projectId: string;
    depth?: number;
}

export default function TaskRow({ task, projectId, depth = 0 }: TaskRowProps) {
    const [expanded, setExpanded] = useState(false);
    const hasSubtasks = (task.subTasks?.length ?? 0) > 0;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

    return (
        <>
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                    <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
                        {hasSubtasks ? (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                        ) : (
                            <span className="w-4" />
                        )}
                        <PriorityDot priority={task.priority} />
                        <Link
                            href={`/projects/${projectId}/tasks/${task.id}`}
                            className="text-sm text-gray-900 hover:text-blue-600 font-medium"
                        >
                            {task.title}
                        </Link>
                        {hasSubtasks && (
                            <span className="text-xs text-gray-400">
                                ({task.subTasks?.filter((s) => s.status === "DONE").length ?? 0}/{task.subTasks?.length ?? 0})
                            </span>
                        )}
                    </div>
                </td>
                <td className="py-3 px-4">
                    <StatusBadge
                        label={TASK_STATUS_LABEL[task.status]}
                        color={TASK_STATUS_COLOR[task.status]}
                    />
                </td>
                <td className="py-3 px-4">
                    <span className="text-xs text-gray-600">{PRIORITY_LABEL[task.priority]}</span>
                </td>
                <td className="py-3 px-4">
                    <div className="flex -space-x-1">
                        {task.assignees.slice(0, 3).map(({ user }) => (
                            <Avatar key={user.id} name={user.name} size="sm" />
                        ))}
                    </div>
                </td>
                <td className="py-3 px-4">
                    <span className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString("ru-RU") : "—"}
                    </span>
                </td>
                <td className="py-3 px-4">
                    <span className="text-xs text-gray-500">
                        {task.plannedHours ? `${task.plannedHours} ч` : "—"}
                    </span>
                </td>
            </tr>
            {expanded &&
                task.subTasks?.map((sub) => (
                    <TaskRow
                        key={sub.id}
                        task={sub as TaskListItem}
                        projectId={projectId}
                        depth={depth + 1}
                    />
                ))}
        </>
    );
}