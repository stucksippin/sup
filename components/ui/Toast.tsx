"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastProps {
    toast: ToastMessage;
    onRemove: (id: string) => void;
}

function Toast({ toast, onRemove }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm w-full animate-in slide-in-from-right-full duration-300 ${toast.type === "success"
                    ? "bg-white border-green-200"
                    : "bg-white border-red-200"
                }`}
        >
            {toast.type === "success" ? (
                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
            ) : (
                <XCircle size={18} className="text-red-500 flex-shrink-0" />
            )}
            <p className="text-sm text-gray-800 flex-1">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
                <X size={14} />
            </button>
        </div>
    );
}

interface ToastContainerProps {
    toasts: ToastMessage[];
    onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}