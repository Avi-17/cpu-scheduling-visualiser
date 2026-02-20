import { useState, useCallback, useRef } from 'react';

let toastId = 0;

export function useToast() {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef(new Map());

    const removeToast = useCallback((id) => {
        // Start exit animation
        setToasts(prev => prev.map(t =>
            t.id === id ? { ...t, exiting: true } : t
        ));
        // Remove after animation completes
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
            if (timersRef.current.has(id)) {
                clearTimeout(timersRef.current.get(id));
                timersRef.current.delete(id);
            }
        }, 300);
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = ++toastId;
        const toast = { id, message, type, exiting: false, createdAt: Date.now(), duration };

        setToasts(prev => [...prev, toast]);

        const timer = setTimeout(() => removeToast(id), duration);
        timersRef.current.set(id, timer);

        return id;
    }, [removeToast]);

    return { toasts, addToast, removeToast };
}
