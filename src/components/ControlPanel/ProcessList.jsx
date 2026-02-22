import React from 'react';
import { useScheduler } from '../../context/SchedulerContext';

function ProcessList() {
    const { processes, removeProcess } = useScheduler();

    return (
        <div className="process-list">
            {processes.map(process => (
                <div key={process.id} className="process-item">
                    <span
                        className="process-color"
                        style={{ color: process.color, background: process.color }}
                    />
                    <span className="process-name">{process.name}</span>
                    <span className="process-stats">
                        A:{process.arrivalTime} B:{process.burstTime} P:{process.priority}
                    </span>
                    <button
                        className="process-remove"
                        onClick={() => removeProcess(process.id)}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}

export default ProcessList;
