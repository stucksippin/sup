"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, Download, Trash2, FileText, Filter } from "lucide-react";
import type { ProjectDocument } from "@/types";
import { DOCUMENT_CATEGORY_LABEL } from "@/types";
import ConfirmModal from "@/components/ui/ConfirmModal";

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function getFileIcon(filename: string) {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["pdf"].includes(ext ?? "")) return "📄";
    if (["doc", "docx"].includes(ext ?? "")) return "📝";
    if (["xls", "xlsx"].includes(ext ?? "")) return "📊";
    if (["ppt", "pptx"].includes(ext ?? "")) return "📑";
    if (["png", "jpg", "jpeg"].includes(ext ?? "")) return "🖼️";
    if (["zip", "rar"].includes(ext ?? "")) return "🗜️";
    return "📁";
}

export default function DocumentsTab({ projectId }: { projectId: string }) {
    const [documents, setDocuments] = useState<ProjectDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("OTHER");
    const fileInputRef = useRef<HTMLInputElement>(null);

    function loadDocuments() {
        const params = categoryFilter ? `?category=${categoryFilter}` : "";
        fetch(`/api/projects/${projectId}/documents${params}`)
            .then((r) => r.json())
            .then((data) => {
                setDocuments(data);
                setLoading(false);
            });
    }

    useEffect(() => {
        loadDocuments();
    }, [projectId, categoryFilter]);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", selectedCategory);

        const res = await fetch(`/api/projects/${projectId}/documents`, {
            method: "POST",
            body: formData,
        });

        setUploading(false);

        if (res.ok) {
            loadDocuments();
        } else {
            const data = await res.json();
            alert(data.error || "Ошибка загрузки");
        }

        // Сбрасываем input
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    async function handleDelete() {
        if (!deleteId) return;
        await fetch(`/api/projects/${projectId}/documents/${deleteId}`, {
            method: "DELETE",
        });
        setDeleteId(null);
        loadDocuments();
    }

    return (
        <div className="space-y-4">
            {/* Загрузка */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Загрузить документ</h2>
                <div className="flex gap-3 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {Object.entries(DOCUMENT_CATEGORY_LABEL).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleUpload}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            <Upload size={16} />
                            {uploading ? "Загрузка..." : "Выбрать файл"}
                        </button>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    Допустимые форматы: pdf, doc, docx, xls, xlsx, ppt, pptx, png, jpg, zip. Максимум 50 МБ.
                </p>
            </div>

            {/* Фильтр по категории */}
            <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <div className="flex gap-2">
                    <button
                        onClick={() => setCategoryFilter("")}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${categoryFilter === "" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        Все
                    </button>
                    {Object.entries(DOCUMENT_CATEGORY_LABEL).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setCategoryFilter(key)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${categoryFilter === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Список документов */}
            {loading ? (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
                    Загрузка...
                </div>
            ) : documents.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <FileText size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Документы не загружены</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Файл</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Категория</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Размер</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Загрузил</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Дата</th>
                                <th className="py-3 px-4" />
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc) => (
                                <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{getFileIcon(doc.filename)}</span>
                                            <span className="text-sm text-gray-900">{doc.filename}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                            {DOCUMENT_CATEGORY_LABEL[doc.category] ?? doc.category}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm text-gray-500">{formatSize(doc.size)}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm text-gray-600">{doc.uploader.name}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm text-gray-500">
                                            {new Date(doc.createdAt).toLocaleDateString("ru-RU")}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2 justify-end">
                                            <a
                                                href={doc.filepath}
                                                download={doc.filename}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Скачать"
                                            >
                                                <Download size={15} />
                                            </a>
                                            <button
                                                onClick={() => setDeleteId(doc.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Удалить"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
            }

            {
                deleteId && (
                    <ConfirmModal
                        title="Удалить документ?"
                        description="Файл будет удалён без возможности восстановления."
                        onConfirm={handleDelete}
                        onCancel={() => setDeleteId(null)}
                    />
                )
            }
        </div >
    );
}