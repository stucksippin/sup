"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import TaskForm from "@/components/tasks/TaskForm";
import { useToast } from "@/lib/toastContext";

export default function NewTaskPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const parentTaskId = searchParams.get("parentTaskId");
    const { success, error: showError } = useToast();

    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
    const [parentTask, setParentTask] = useState<{ title: string } | null>(null);
    const [form, setForm] = useState({
        title: "",
        description: "",
        status: "NEW",
        priority: "MEDIUM",
        startDate: "",
        dueDate: "",
        plannedHours: "",
        milestoneId: "",
    });

    useEffect(() => {
        fetch(`/api/projects/${id}`)
            .then((r) => r.json())
            .then((project) => {
                setMembers(project.members.map((m: any) => m.user));
                setMilestones(project.milestones || []);
            });

        if (parentTaskId) {
            fetch(`/api/tasks/${parentTaskId}`)
                .then((r) => r.json())
                .then((task) => setParentTask({ title: task.title }));
        }
    }, [id, parentTaskId]);

    function toggleAssignee(userId: string) {
        setSelectedAssignees((prev) =>
            prev.includes(userId) ? prev.filter((i) => i !== userId) : [...prev, userId]
        );
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const res = await fetch(`/api/projects/${id}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                plannedHours: form.plannedHours ? parseFloat(form.plannedHours) : null,
                milestoneId: form.milestoneId || null,
                assigneeIds: selectedAssignees,
                parentTaskId: parentTaskId || null,
            }),
        });

        setLoading(false);

        if (!res.ok) {
            showError("Ошибка при создании задачи");
        } else {
            success("Задача создана");
            setTimeout(() => {
                router.push(
                    parentTaskId
                        ? `/projects/${id}/tasks/${parentTaskId}`
                        : `/projects/${id}?tab=tasks`
                );
            }, 1500);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href={parentTaskId ? `/projects/${id}/tasks/${parentTaskId}` : `/projects/${id}?tab=tasks`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {parentTaskId ? "Новая подзадача" : "Новая задача"}
                    </h1>
                    {parentTask && (
                        <p className="text-gray-500 text-sm">К задаче: {parentTask.title}</p>
                    )}
                </div>
            </div>

            <TaskForm
                form={form}
                onChange={setForm}
                members={members}
                milestones={milestones}
                selectedAssignees={selectedAssignees}
                onToggleAssignee={toggleAssignee}
                onSubmit={handleSubmit}
                loading={loading}
                error=""
                submitLabel="Создать задачу"
                cancelHref={
                    parentTaskId
                        ? `/projects/${id}/tasks/${parentTaskId}`
                        : `/projects/${id}?tab=tasks`
                }
                showParentTask={!parentTaskId}
            />
        </div>
    );
}