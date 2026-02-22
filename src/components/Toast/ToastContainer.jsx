import React, { useEffect, useRef } from 'react';

function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    toast={toast}
                    onDismiss={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

function Toast({ toast, onDismiss }) {
    const progressRef = useRef(null);

    useEffect(() => {
        if (progressRef.current) {
            // Trigger the progress bar animation
            requestAnimationFrame(() => {
                if (progressRef.current) {
                    progressRef.current.style.transition = `width ${toast.duration}ms linear`;
                    progressRef.current.style.width = '0%';
                }
            });
        }
    }, [toast.duration]);

    const icon = toast.type === 'warning' ? '⚠️' : 'ℹ️';

    return (
        <div className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : 'toast-enter'}`}>
            <div className="toast-content">
                <span className="toast-icon">{icon}</span>
                <span className="toast-message">{toast.message}</span>
                <button className="toast-close" onClick={onDismiss}>×</button>
            </div>
            <div className="toast-progress">
                <div
                    ref={progressRef}
                    className={`toast-progress-bar toast-progress-${toast.type}`}
                    style={{ width: '100%' }}
                />
            </div>
        </div>
    );
}

export default ToastContainer;
