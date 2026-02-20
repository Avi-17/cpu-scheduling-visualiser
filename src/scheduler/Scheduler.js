// Core Scheduler Engine
import { FCFS } from './algorithms/FCFS.js';
import { SJF, SJFPreemptive } from './algorithms/SJF.js';
import { PriorityNonPreemptive } from './algorithms/PriorityNonPreemptive.js';
import { PriorityPreemptive } from './algorithms/PriorityPreemptive.js';
import { RoundRobin } from './algorithms/RoundRobin.js';
import { MLFQ } from './algorithms/MLFQ.js';

export class Scheduler {
    constructor() {
        this.algorithms = {
            'fcfs': FCFS,
            'sjf': SJF,
            'sjf-preemptive': SJFPreemptive,
            'priority': PriorityPreemptive, // backward compat
            'priority-np': PriorityNonPreemptive,
            'priority-p': PriorityPreemptive,
            'rr': RoundRobin,
            'mlfq': MLFQ
        };

        this.currentAlgorithm = 'fcfs';
        this.processes = [];
        this.readyQueue = [];
        this.completedProcesses = [];
        this.currentProcess = null;
        this.currentTime = 0;

        // Metrics
        this.contextSwitches = 0;
        this.cpuBusyTime = 0;
        this.ganttHistory = [];

        // Options
        this.options = {
            quantum: 3,
            highPriorityFirst: false
        };

        // Event callbacks
        this.onTick = null;
        this.onContextSwitch = null;
        this.onProcessComplete = null;
        this.onGanttUpdate = null;
        this.onMetricsUpdate = null;

        // State
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 5;
        this.animationFrameId = null;
        this.lastTickTime = 0;
    }

    setAlgorithm(algoKey) {
        if (this.algorithms[algoKey]) {
            this.currentAlgorithm = algoKey;

            // Reset algorithm-specific state
            if (this.algorithms[algoKey].reset) {
                this.algorithms[algoKey].reset();
            }
        }
    }

    setProcesses(processes) {
        this.processes = processes;
        this.reset();
    }

    addProcess(process) {
        this.processes.push(process);
        if (process.arrivalTime <= this.currentTime && process.state === 'waiting') {
            process.state = 'ready';
            this.readyQueue.push(process);
            this.sortReadyQueue();
        }
    }

    removeProcess(processId) {
        this.processes = this.processes.filter(p => p.id !== processId);
        this.readyQueue = this.readyQueue.filter(p => p.id !== processId);
        if (this.currentProcess && this.currentProcess.id === processId) {
            this.currentProcess = null;
        }
    }

    reset() {
        this.readyQueue = [];
        this.completedProcesses = [];
        this.currentProcess = null;
        this.currentTime = 0;
        this.contextSwitches = 0;
        this.cpuBusyTime = 0;
        this.ganttHistory = [];
        this.isRunning = false;
        this.isPaused = false;

        // Reset all processes
        this.processes.forEach(p => p.reset());

        // Reset algorithm state
        Object.values(this.algorithms).forEach(algo => {
            if (algo.reset) algo.reset();
        });

        if (this.onMetricsUpdate) {
            this.onMetricsUpdate(this.getMetrics());
        }
    }

    sortReadyQueue() {
        // Sort by arrival time as base
        this.readyQueue.sort((a, b) => a.arrivalTime - b.arrivalTime);
    }

    start() {
        if (this.isRunning && !this.isPaused) return;

        this.isRunning = true;
        this.isPaused = false;
        this.lastTickTime = performance.now();
        this.tick();
    }

    pause() {
        this.isPaused = true;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    resume() {
        if (!this.isRunning) return;
        this.isPaused = false;
        this.lastTickTime = performance.now();
        this.tick();
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    tick() {
        if (!this.isRunning || this.isPaused) return;

        const now = performance.now();
        const tickInterval = 1000 / this.speed; // Faster speed = shorter interval

        if (now - this.lastTickTime >= tickInterval) {
            this.executeTick();
            this.lastTickTime = now;
        }

        this.animationFrameId = requestAnimationFrame(() => this.tick());
    }

    executeTick() {
        const algorithm = this.algorithms[this.currentAlgorithm];

        // Check for newly arrived processes
        this.processes.forEach(p => {
            if (p.arrivalTime === this.currentTime && p.state === 'waiting') {
                p.state = 'ready';
                this.readyQueue.push(p);
            }
        });

        this.sortReadyQueue();

        // Check for preemption
        if (this.currentProcess && algorithm.shouldPreempt) {
            if (algorithm.shouldPreempt(this.currentProcess, this.readyQueue, this.currentTime, this.options)) {
                // Preempt current process
                this.currentProcess.state = 'ready';
                this.readyQueue.push(this.currentProcess);

                // Record preemption in Gantt
                if (this.ganttHistory.length > 0) {
                    const lastEntry = this.ganttHistory[this.ganttHistory.length - 1];
                    lastEntry.preempted = true;
                }

                this.currentProcess = null;
                // Preemption context switch handled in selection logic
            }
        }

        // Select next process if CPU is idle
        if (!this.currentProcess) {
            const selected = algorithm.selectNext(this.readyQueue, this.currentTime, this.options);

            if (selected) {
                // Remove from ready queue
                this.readyQueue = this.readyQueue.filter(p => p.id !== selected.id);

                this.currentProcess = selected;
                this.currentProcess.state = 'running';

                // Context switch increment
                if (this.ganttHistory.length > 0) {
                    this.contextSwitches++;
                }

                // Record response time
                if (this.currentProcess.responseTime === null) {
                    this.currentProcess.responseTime = this.currentTime - this.currentProcess.arrivalTime;
                }

                // Context switch
                if (algorithm.onContextSwitch) {
                    algorithm.onContextSwitch(this.currentProcess, this.options);
                }

                if (this.onContextSwitch) {
                    this.onContextSwitch(this.currentProcess, this.currentTime);
                }

                // Add to Gantt history
                this.ganttHistory.push({
                    processId: this.currentProcess.id,
                    processName: this.currentProcess.name,
                    color: this.currentProcess.color,
                    startTime: this.currentTime,
                    endTime: this.currentTime + 1,
                    preempted: false,
                    contextSwitch: this.ganttHistory.length > 0
                });
            } else {
                // CPU is idle — record idle block in Gantt
                const lastEntry = this.ganttHistory.length > 0
                    ? this.ganttHistory[this.ganttHistory.length - 1]
                    : null;

                if (lastEntry && lastEntry.idle) {
                    // Extend the existing idle block
                    lastEntry.endTime = this.currentTime + 1;
                } else {
                    this.ganttHistory.push({
                        processId: null,
                        processName: 'Idle',
                        color: 'transparent',
                        startTime: this.currentTime,
                        endTime: this.currentTime + 1,
                        preempted: false,
                        contextSwitch: false,
                        idle: true
                    });
                }
            }
        } else {
            // Continue current process - extend Gantt block
            if (this.ganttHistory.length > 0) {
                const lastEntry = this.ganttHistory[this.ganttHistory.length - 1];
                if (lastEntry.processId === this.currentProcess.id) {
                    lastEntry.endTime = this.currentTime + 1;
                } else {
                    // New entry for same process after coming back
                    this.ganttHistory.push({
                        processId: this.currentProcess.id,
                        processName: this.currentProcess.name,
                        color: this.currentProcess.color,
                        startTime: this.currentTime,
                        endTime: this.currentTime + 1,
                        preempted: false,
                        contextSwitch: true
                    });
                    this.contextSwitches++;
                }
            }
        }

        // Execute current process
        if (this.currentProcess) {
            this.currentProcess.remainingTime--;
            this.cpuBusyTime++;

            // Algorithm tick (for Round Robin)
            if (algorithm.onTick) {
                algorithm.onTick(this.currentProcess, this.options);
            }

            // Check if process completed
            if (this.currentProcess.remainingTime <= 0) {
                this.currentProcess.state = 'completed';
                this.currentProcess.completionTime = this.currentTime + 1;
                this.completedProcesses.push(this.currentProcess);

                if (this.onProcessComplete) {
                    this.onProcessComplete(this.currentProcess);
                }

                this.currentProcess = null;
            }
        }

        // Emit events
        if (this.onTick) {
            this.onTick(this.currentTime, this.currentProcess);
        }

        if (this.onGanttUpdate) {
            this.onGanttUpdate(this.ganttHistory);
        }

        if (this.onMetricsUpdate) {
            this.onMetricsUpdate(this.getMetrics());
        }

        // Increment time
        this.currentTime++;

        // Check if simulation is complete
        if (this.completedProcesses.length === this.processes.length) {
            this.stop();
        }
    }

    getMetrics() {
        const completed = this.completedProcesses;
        const total = this.processes.length;

        let avgWaitTime = 0;
        let avgTurnaround = 0;
        let avgResponse = 0;

        if (completed.length > 0) {
            const waitTimes = completed.map(p => p.getWaitingTime()).filter(t => t !== null);
            const turnarounds = completed.map(p => p.getTurnaroundTime()).filter(t => t !== null);
            const responses = completed.map(p => p.getResponseTime()).filter(t => t !== null);

            avgWaitTime = waitTimes.length > 0 ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length : 0;
            avgTurnaround = turnarounds.length > 0 ? turnarounds.reduce((a, b) => a + b, 0) / turnarounds.length : 0;
            avgResponse = responses.length > 0 ? responses.reduce((a, b) => a + b, 0) / responses.length : 0;
        }

        // Use currentTime + 1 because metrics are calculated before currentTime is incremented
        const elapsed = this.currentTime + 1;
        const cpuUtilization = elapsed > 0 ? Math.min((this.cpuBusyTime / elapsed) * 100, 100) : 0;
        const throughput = elapsed > 0 ? completed.length / elapsed : 0;

        return {
            avgWaitTime: avgWaitTime.toFixed(2),
            avgTurnaround: avgTurnaround.toFixed(2),
            avgResponse: avgResponse.toFixed(2),
            cpuUtilization: cpuUtilization.toFixed(1),
            contextSwitches: this.contextSwitches,
            throughput: throughput.toFixed(2),
            completed: completed.length,
            total: total
        };
    }
}
