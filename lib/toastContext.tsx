"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { ToastContainer } from "@/components/ui/Toast";
import type { ToastMessage, ToastType } from "@/components/ui/Toast";

interface ToastContextType {
    success: (message: string) => void;
    error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({
    success: () => { },
    error: () => { },
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const success = useCallback((message: string) => addToast(message, "success"), [addToast]);
    const error = useCallback((message: string) => addToast(message, "error"), [addToast]);

    return (
        <ToastContext.Provider value= {{ success, error }
}>
    { children }
    < ToastContainer toasts = { toasts } onRemove = { removeToast } />
        </ToastContext.Provider>
  );
}

export function useToast() {
    return useContext(ToastContext);
}