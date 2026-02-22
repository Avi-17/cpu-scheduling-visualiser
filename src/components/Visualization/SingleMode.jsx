import React from 'react';
import { useScheduler } from '../../context/SchedulerContext';
import CPUCore from './CPUCore';
import ReadyQueue from './ReadyQueue';
import CompletedArea from './CompletedArea';
import GanttChart from './GanttChart';

function SingleMode() {
    const {
        currentProcess,
        readyQueue,
        completedProcesses,
        ganttHistory,
        isRunning
    } = useScheduler();

    return (
        <div className="single-mode">
            <div className="cpu-section">
                <ReadyQueue queue={readyQueue} />
                <CPUCore
                    currentProcess={currentProcess}
                    isActive={isRunning && currentProcess !== null}
                />
                <CompletedArea completedProcesses={completedProcesses} />
            </div>
            <GanttChart history={ganttHistory} />
        </div>
    );
}

export default SingleMode;
