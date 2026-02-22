import React from 'react';
import { useScheduler } from '../../context/SchedulerContext';
import CPUCore from '../Visualization/CPUCore';
import GanttChart from '../Visualization/GanttChart';
import ComparisonMetrics from './ComparisonMetrics';

const algorithms = [
    { key: 'fcfs', label: 'FCFS' },
    { key: 'sjf', label: 'SJF' },
    { key: 'sjf-preemptive', label: 'SRTF' },
    { key: 'priority-np', label: 'Priority NP' },
    { key: 'priority-p', label: 'Priority P' },
    { key: 'rr', label: 'Round Robin' },
    { key: 'mlfq', label: 'MLFQ' }
];

function ComparisonMode() {
    const {
        currentProcess,
        currentProcess2,
        currentAlgorithm,
        algorithm2,
        selectAlgorithm,
        selectAlgorithm2,
        ganttHistory,
        ganttHistory2,
        isRunning
    } = useScheduler();

    return (
        <div className="comparison-mode">
            <div className="comparison-grid">
                {/* CPU 1 */}
                <div className="comparison-cpu">
                    <div className="comparison-header">
                        <select
                            className="algo-select"
                            value={currentAlgorithm}
                            onChange={(e) => selectAlgorithm(e.target.value)}
                        >
                            {algorithms.map(algo => (
                                <option key={algo.key} value={algo.key}>{algo.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mini-cpu-container">
                        <CPUCore
                            currentProcess={currentProcess}
                            isActive={isRunning && currentProcess !== null}
                            cpuLabel="CPU 1"
                            isMini={true}
                        />
                    </div>
                    <GanttChart history={ganttHistory} isMini={true} />
                </div>

                {/* CPU 2 */}
                <div className="comparison-cpu">
                    <div className="comparison-header">
                        <select
                            className="algo-select"
                            value={algorithm2}
                            onChange={(e) => selectAlgorithm2(e.target.value)}
                        >
                            {algorithms.map(algo => (
                                <option key={algo.key} value={algo.key}>{algo.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mini-cpu-container">
                        <CPUCore
                            currentProcess={currentProcess2}
                            isActive={isRunning && currentProcess2 !== null}
                            cpuLabel="CPU 2"
                            isMini={true}
                        />
                    </div>
                    <GanttChart history={ganttHistory2} isMini={true} />
                </div>
            </div>

            <ComparisonMetrics />
        </div>
    );
}

export default ComparisonMode;
