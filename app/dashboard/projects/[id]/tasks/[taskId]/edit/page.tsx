"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import TaskForm from "@/components/tasks/TaskForm";

export default function EditTaskPage() {
    const { id, taskId } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [members, setMembers] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
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
        Promise.all([
            fetch(`/api/tasks/${taskId}`).then((r) => r.json()),
            fetch(`/api/projects/${id}`).then((r) => r.json()),
        ]).then(([task, project]) => {
            setForm({
                title: task.title || "",
                description: task.description || "",
                status: task.status || "NEW",
                priority: task.priority || "MEDIUM",
                startDate: task.startDate ? task.startDate.split("T")[0] : "",
                dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
                plannedHours: task.plannedHours ? String(task.plannedHours) : "",
                milestoneId: task.milestone?.id || "",
            });
            setSelectedAssignees(task.assignees.map((a: any) => a.user.id));
            setMembers(project.members.map((m: any) => m.user));
            setMilestones(project.milestones || []);
            setFetching(false);
        });
    }, [id, taskId]);

    function toggleAssignee(userId: string) {
        setSelectedAssignees((prev) =>
            prev.includes(userId) ? prev.filter((i) => i !== userId) : [...prev, userId]
        );
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch(`/api/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                plannedHours: form.plannedHours ? parseFloat(form.plannedHours) : null,
                milestoneId: form.milestoneId || null,
                assigneeIds: selectedAssignees,
            }),
        });

        setLoading(false);

        if (!res.ok) {
            setError("Ошибка при сохранении");
        } else {
            router.push(`/dashboard/projects/${id}/tasks/${taskId}`);
        }
    }

    if (fetching) {
        return (
            <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-64 bg-gray-100 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href={`/dashboard/projects/${id}/tasks/${taskId}`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Редактирование задачи</h1>
                    <p className="text-gray-500 text-sm">Измените нужные поля и сохраните</p>
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
                error={error}
                submitLabel="Сохранить изменения"
                cancelHref={`/dashboard/projects/${id}/tasks/${taskId}`}
            />
        </div>
    );
}