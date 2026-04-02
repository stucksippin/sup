"use client";

import { useEffect, useState } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    useDroppable,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { TaskListItem } from "@/types";
import { TASK_STATUS_LABEL, TASK_STATUS_COLOR } from "@/types";
import KanbanCard from "./KanbanCard";
import { Plus } from "lucide-react";
import Link from "next/link";

const COLUMNS = ["NEW", "IN_PROGRESS", "ON_REVIEW", "DONE"];

interface KanbanBoardProps {
    projectId: string;
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
    const [tasks, setTasks] = useState<TaskListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTask, setActiveTask] = useState<TaskListItem | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    function loadTasks() {
        fetch(`/api/projects/${projectId}/tasks`)
            .then((r) => r.json())
            .then((data) => {
                setTasks(data);
                setLoading(false);
            });
    }

    useEffect(() => {
        loadTasks();
    }, [projectId]);

    function getTasksByStatus(status: string) {
        return tasks.filter((t) => t.status === status);
    }

    function handleDragStart(event: DragStartEvent) {
        const task = tasks.find((t) => t.id === event.active.id);
        if (task) setActiveTask(task);
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        const activeTask = tasks.find((t) => t.id === activeId);
        if (!activeTask) return;

        // Если перетаскиваем на колонку
        if (COLUMNS.includes(overId)) {
            if (activeTask.status !== overId) {
                setTasks((prev) =>
                    prev.map((t) => (t.id === activeId ? { ...t, status: overId } : t))
                );
            }
            return;
        }

        // Если перетаскиваем на другую карточку
        const overTask = tasks.find((t) => t.id === overId);
        if (!overTask) return;

        if (activeTask.status !== overTask.status) {
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === activeId ? { ...t, status: overTask.status } : t
                )
            );
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const task = tasks.find((t) => t.id === activeId);
        if (!task) return;

        let newStatus = task.status;

        if (COLUMNS.includes(overId)) {
            newStatus = overId;
        } else {
            const overTask = tasks.find((t) => t.id === overId);
            if (overTask) newStatus = overTask.status;
        }

        if (newStatus !== task.status) {
            // Уже обновили в handleDragOver, теперь сохраняем в БД
        }

        // Сохраняем статус в БД
        await fetch(`/api/tasks/${activeId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...task, status: newStatus }),
        });
    }

    if (loading) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((col) => (
                    <div key={col} className="flex-shrink-0 w-72">
                        <div className="h-8 bg-gray-200 rounded mb-3 animate-pulse" />
                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((status) => {
                    const columnTasks = getTasksByStatus(status);
                    return (
                        <KanbanColumn
                            key={status}
                            status={status}
                            tasks={columnTasks}
                            projectId={projectId}
                        />
                    );
                })}
            </div>

            <DragOverlay>
                {activeTask && (
                    <div className="bg-white border border-blue-300 rounded-xl p-3 shadow-xl w-72 opacity-95">
                        <p className="text-sm font-medium text-gray-900">{activeTask.title}</p>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}



function KanbanColumn({
    status,
    tasks,
    projectId,
}: {
    status: string;
    tasks: TaskListItem[];
    projectId: string;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: status });

    const columnColors: Record<string, string> = {
        NEW: "bg-gray-100",
        IN_PROGRESS: "bg-blue-50",
        ON_REVIEW: "bg-yellow-50",
        DONE: "bg-green-50",
    };

    const dotColors: Record<string, string> = {
        NEW: "bg-gray-400",
        IN_PROGRESS: "bg-blue-500",
        ON_REVIEW: "bg-yellow-500",
        DONE: "bg-green-500",
    };

    return (
        <div className="flex-shrink-0 w-72">
            <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-3 ${columnColors[status]}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${dotColors[status]}`} />
                    <span className="text-sm font-medium text-gray-700">
                        {TASK_STATUS_LABEL[status]}
                    </span>
                    <span className="text-xs text-gray-400 bg-white rounded-full px-1.5 py-0.5">
                        {tasks.length}
                    </span>
                </div>
                <Link
                    href={`/projects/${projectId}/tasks/new`}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Добавить задачу"
                >
                    <Plus size={16} />
                </Link>
            </div>

            <SortableContext
                id={status}
                items={tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div
                    ref={setNodeRef}
                    className={`space-y-3 min-h-32 rounded-xl p-1 transition-colors ${isOver ? "bg-blue-50 ring-2 ring-blue-200" : ""
                        }`}
                >
                    {tasks.map((task) => (
                        <KanbanCard key={task.id} task={task} projectId={projectId} />
                    ))}
                    {tasks.length === 0 && (
                        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isOver ? "border-blue-300" : "border-gray-200"
                            }`}>
                            <p className="text-xs text-gray-400">Нет задач</p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}