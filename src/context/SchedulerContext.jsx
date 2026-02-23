import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Scheduler } from '../scheduler/Scheduler';
import { Process, createSampleProcesses, createStressProcesses } from '../scheduler/Process';
import { useToast } from '../hooks/useToast';
import algorithmDrawbacks from '../data/algorithmDrawbacks';

const SchedulerContext = createContext(null);

// Custom hook for using scheduler context
export function useScheduler() {
    const context = useContext(SchedulerContext);
    if (!context) {
        throw new Error('useScheduler must be used within a SchedulerProvider');
    }
    return context;
}

// Provider component
export function SchedulerProvider({ children }) {
    // Scheduler instances
    const schedulerRef = useRef(new Scheduler());
    const scheduler2Ref = useRef(new Scheduler());

    // Toast
    const { toasts, addToast, removeToast } = useToast();

    // State
    const [processes, setProcesses] = useState([]);
    const [readyQueue, setReadyQueue] = useState([]);
    const [completedProcesses, setCompletedProcesses] = useState([]);
    const [currentProcess, setCurrentProcess] = useState(null);
    const [currentProcess2, setCurrentProcess2] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isComparisonMode, setIsComparisonMode] = useState(false);
    const [currentAlgorithm, setCurrentAlgorithm] = useState('fcfs');
    const [algorithm2, setAlgorithm2] = useState('rr');
    const [quantum, setQuantum] = useState(3);
    const [speed, setSpeed] = useState(5);
    const [ganttHistory, setGanttHistory] = useState([]);
    const [ganttHistory2, setGanttHistory2] = useState([]);
    const [metrics, setMetrics] = useState({
        avgWaitTime: '0.00',
        avgTurnaround: '0.00',
        avgResponse: '0.00',
        cpuUtilization: '0.0',
        contextSwitches: 0,
        throughput: '0.00'
    });
    const [metrics2, setMetrics2] = useState({ ...metrics });

    // MLFQ configuration
    const [mlfqQueues, setMlfqQueues] = useState(3);
    const [mlfqQuantums, setMlfqQuantums] = useState([2, 4, 8]);

    const syncMLFQOptions = useCallback(() => {
        const opts = {
            mlfqQueues,
            mlfqQuantums,
            mlfqAging: false
        };
        Object.assign(schedulerRef.current.options, opts);
        Object.assign(scheduler2Ref.current.options, opts);
    }, [mlfqQueues, mlfqQuantums]);

    useEffect(() => {
        syncMLFQOptions();
    }, [syncMLFQOptions]);


    useEffect(() => {
        const initialProcesses = createSampleProcesses(5);
        schedulerRef.current.setProcesses(initialProcesses);
        setProcesses([...initialProcesses]);

        setupSchedulerCallbacks();
    }, []);

    // Setup scheduler callbacks
    const setupSchedulerCallbacks = useCallback(() => {
        const scheduler = schedulerRef.current;
        const scheduler2 = scheduler2Ref.current;

        scheduler.onTick = (time, current) => {
            setCurrentTime(time);
            setCurrentProcess(current);
            setReadyQueue([...scheduler.readyQueue]);
            setCompletedProcesses([...scheduler.completedProcesses]);
        };

        scheduler.onGanttUpdate = (history) => {
            setGanttHistory([...history]);
        };

        scheduler.onMetricsUpdate = (m) => {
            setMetrics({ ...m });
        };

        scheduler.onContextSwitch = () => { };
        scheduler.onProcessComplete = () => { };

        // Scheduler 2 for comparison mode
        scheduler2.onTick = (time, current) => {
            setCurrentProcess2(current);
        };

        scheduler2.onGanttUpdate = (history) => {
            setGanttHistory2([...history]);
        };

        scheduler2.onMetricsUpdate = (m) => {
            setMetrics2({ ...m });
        };
    }, []);

    // Actions
    const selectAlgorithm = useCallback((algo) => {
        schedulerRef.current.setAlgorithm(algo);
        setCurrentAlgorithm(algo);
    }, []);

    const selectAlgorithm2 = useCallback((algo) => {
        scheduler2Ref.current.setAlgorithm(algo);
        setAlgorithm2(algo);
    }, []);

    const setTimeQuantum = useCallback((q) => {
        schedulerRef.current.options.quantum = q;
        scheduler2Ref.current.options.quantum = q;
        setQuantum(q);
    }, []);

    const setSimulationSpeed = useCallback((s) => {
        schedulerRef.current.speed = s;
        scheduler2Ref.current.speed = s;
        setSpeed(s);
    }, []);

    const setMlfqConfig = useCallback((queues, quantums) => {
        setMlfqQueues(queues);
        setMlfqQuantums(quantums);
    }, []);

    const start = useCallback(() => {
        if (schedulerRef.current.processes.length === 0) {
            const newProcesses = createSampleProcesses(5);
            schedulerRef.current.setProcesses(newProcesses);
            setProcesses([...newProcesses]);
        }

        // Show algorithm drawback toast
        const drawback = algorithmDrawbacks[schedulerRef.current.currentAlgorithm];
        if (drawback) {
            addToast(drawback.message, drawback.type);
        }

        setIsRunning(true);
        setIsPaused(false);
        schedulerRef.current.start();

        if (isComparisonMode) {
            const drawback2 = algorithmDrawbacks[scheduler2Ref.current.currentAlgorithm];
            if (drawback2) {
                addToast(drawback2.message, drawback2.type);
            }
            scheduler2Ref.current.start();
        }
    }, [isComparisonMode, addToast]);

    const togglePause = useCallback(() => {
        if (isPaused) {
            schedulerRef.current.resume();
            if (isComparisonMode) scheduler2Ref.current.resume();
            setIsPaused(false);
        } else {
            schedulerRef.current.pause();
            if (isComparisonMode) scheduler2Ref.current.pause();
            setIsPaused(true);
        }
    }, [isPaused, isComparisonMode]);

    const reset = useCallback(() => {
        schedulerRef.current.reset();
        scheduler2Ref.current.reset();

        setIsRunning(false);
        setIsPaused(false);
        setCurrentProcess(null);
        setCurrentProcess2(null);
        setCurrentTime(0);
        setReadyQueue([]);
        setCompletedProcesses([]);
        setGanttHistory([]);
        setGanttHistory2([]);
        setMetrics({
            avgWaitTime: '0.00',
            avgTurnaround: '0.00',
            avgResponse: '0.00',
            cpuUtilization: '0.0',
            contextSwitches: 0,
            throughput: '0.00'
        });
        setMetrics2({
            avgWaitTime: '0.00',
            avgTurnaround: '0.00',
            avgResponse: '0.00',
            cpuUtilization: '0.0',
            contextSwitches: 0,
            throughput: '0.00'
        });

        // Reset processes in state
        setProcesses(schedulerRef.current.processes.map(p => {
            p.reset();
            return p;
        }));
    }, []);

    const addMultipleProcesses = useCallback((newProcesses) => {
        newProcesses.forEach(p => {
            schedulerRef.current.addProcess(p);
            if (isComparisonMode) {
                scheduler2Ref.current.addProcess(p.clone());
            }
        });
        setProcesses([...schedulerRef.current.processes]);
    }, [isComparisonMode]);

    const removeProcess = useCallback((id) => {
        schedulerRef.current.removeProcess(id);
        if (isComparisonMode) scheduler2Ref.current.removeProcess(id);
        setProcesses([...schedulerRef.current.processes]);
    }, [isComparisonMode]);

    const clearProcesses = useCallback(() => {
        Process.idCounter = 0;
        schedulerRef.current.setProcesses([]);
        scheduler2Ref.current.setProcesses([]);
        setProcesses([]);
        reset();
    }, [reset]);

    const enableStressMode = useCallback(() => {
        const stressProcesses = createStressProcesses(100);
        schedulerRef.current.setProcesses(stressProcesses);

        if (isComparisonMode) {
            const cloned = stressProcesses.map(p => p.clone());
            scheduler2Ref.current.setProcesses(cloned);
        }

        setProcesses([...stressProcesses]);
        reset();
    }, [isComparisonMode, reset]);

    const toggleComparisonMode = useCallback(() => {
        const newMode = !isComparisonMode;
        setIsComparisonMode(newMode);

        if (newMode) {
            const cloned = schedulerRef.current.processes.map(p => {
                const clone = p.clone();
                clone.reset();
                return clone;
            });

            schedulerRef.current.processes.forEach(p => p.reset());
            scheduler2Ref.current.setProcesses(cloned);
            scheduler2Ref.current.setAlgorithm(algorithm2);
            schedulerRef.current.setAlgorithm(currentAlgorithm);
        }

        reset();
    }, [isComparisonMode, algorithm2, currentAlgorithm, reset]);

    const value = {
        // State
        processes,
        readyQueue,
        completedProcesses,
        currentProcess,
        currentProcess2,
        currentTime,
        isRunning,
        isPaused,
        isComparisonMode,
        currentAlgorithm,
        algorithm2,
        quantum,
        speed,
        ganttHistory,
        ganttHistory2,
        metrics,
        metrics2,
        mlfqQueues,
        mlfqQuantums,

        // Toast
        toasts,
        addToast,
        removeToast,

        // Actions
        selectAlgorithm,
        selectAlgorithm2,
        setTimeQuantum,
        setSimulationSpeed,
        setMlfqConfig,
        start,
        togglePause,
        reset,
        addMultipleProcesses,
        removeProcess,
        clearProcesses,
        enableStressMode,
        toggleComparisonMode
    };

    return (
        <SchedulerContext.Provider value={value}>
            {children}
        </SchedulerContext.Provider>
    );
}
