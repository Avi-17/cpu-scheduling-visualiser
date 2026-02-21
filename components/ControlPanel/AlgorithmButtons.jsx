import React, { useState } from 'react';
import { useScheduler } from '../../context/SchedulerContext';

const algorithms = [
    { key: 'fcfs', label: 'FCFS', tooltip: 'First Come First Serve' },
    { key: 'sjf', label: 'SJF', tooltip: 'Shortest Job First' },
    { key: 'sjf-preemptive', label: 'SRTF', tooltip: 'Shortest Remaining Time First' },
    { key: 'priority-np', label: 'Priority NP', tooltip: 'Priority (Non-Preemptive)' },
    { key: 'priority-p', label: 'Priority P', tooltip: 'Priority (Preemptive)' },
    { key: 'rr', label: 'Round Robin', tooltip: 'Round Robin' },
    { key: 'mlfq', label: 'MLFQ', tooltip: 'Multi-Level Feedback Queue' }
];

function AlgorithmButtons() {
    const { currentAlgorithm, selectAlgorithm } = useScheduler();
    const [hoveredAlgo, setHoveredAlgo] = useState(null);

    return (
        <div className="algorithm-buttons">
            {algorithms.map(algo => (
                <div
                    key={algo.key}
                    className="algo-btn-wrapper"
                    onMouseEnter={() => setHoveredAlgo(algo.key)}
                    onMouseLeave={() => setHoveredAlgo(null)}
                >
                    <button
                        className={`algo-btn ${currentAlgorithm === algo.key ? 'active' : ''}`}
                        onClick={() => selectAlgorithm(algo.key)}
                    >
                        {algo.label}
                    </button>
                    {hoveredAlgo === algo.key && (
                        <div className="algo-tooltip">{algo.tooltip}</div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default AlgorithmButtons;
