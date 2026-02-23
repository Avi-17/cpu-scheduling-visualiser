// Multi-Level Feedback Queue Scheduling Algorithm
import { wasmBridge } from '../../wasm/wasmBridge.js';

export const MLFQ = {
    name: 'Multi-Level Feedback Queue',
    shortName: 'MLFQ',
    preemptive: true,

    // JS fallback state
    processQueueLevel: new Map(),
    timeSliceUsed: new Map(),
    waitingSince: new Map(),

    getQueueQuantum(level, options = {}) {
        const quantums = options.mlfqQuantums ?? [2, 4, 8];
        return quantums[Math.min(level, quantums.length - 1)];
    },

    getNumQueues(options = {}) {
        return options.mlfqQueues ?? 3;
    },

    getProcessLevel(processId) {
        if (wasmBridge.isLoaded) {
            return wasmBridge.mlfq.getProcessLevel(processId);
        }
        return this.processQueueLevel.get(processId) ?? 0;
    },

    selectNext(readyQueue, currentTime, options = {}) {
        if (wasmBridge.isLoaded) {
            return wasmBridge.mlfq.selectNext(readyQueue, currentTime, options);
        }

        if (readyQueue.length === 0) return null;

        const available = readyQueue.filter(p => p.arrivalTime <= currentTime);
        if (available.length === 0) return null;

        const numQueues = this.getNumQueues(options);

        // Assign queue level to new processes (level 0 = highest priority)
        available.forEach(p => {
            if (!this.processQueueLevel.has(p.id)) {
                this.processQueueLevel.set(p.id, 0);
            }
        });

        // Apply aging: promote processes that have waited too long
        if (options.mlfqAging) {
            const agingThreshold = options.mlfqAgingThreshold ?? 10;
            available.forEach(p => {
                const waitStart = this.waitingSince.get(p.id);
                if (waitStart !== undefined && currentTime - waitStart >= agingThreshold) {
                    const currentLevel = this.getProcessLevel(p.id);
                    if (currentLevel > 0) {
                        this.processQueueLevel.set(p.id, currentLevel - 1);
                        this.waitingSince.set(p.id, currentTime);
                    }
                }
            });
        }

        // Select from highest priority queue (lowest number) first
        for (let level = 0; level < numQueues; level++) {
            const levelProcesses = available.filter(p =>
                (this.processQueueLevel.get(p.id) ?? 0) === level
            );

            if (levelProcesses.length > 0) {
                levelProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime);
                return levelProcesses[0];
            }
        }

        return available[0];
    },

    shouldPreempt(currentProcess, readyQueue, currentTime, options = {}) {
        if (wasmBridge.isLoaded) {
            return wasmBridge.mlfq.shouldPreempt(currentProcess, readyQueue, currentTime, options);
        }

        if (!currentProcess) return false;

        const currentLevel = this.processQueueLevel.get(currentProcess.id) ?? 0;
        const quantum = this.getQueueQuantum(currentLevel, options);
        const used = this.timeSliceUsed.get(currentProcess.id) || 0;

        if (used >= quantum) {
            return true;
        }

        const available = readyQueue.filter(p =>
            p.arrivalTime <= currentTime && p.id !== currentProcess.id
        );

        for (const p of available) {
            const pLevel = this.processQueueLevel.get(p.id) ?? 0;
            if (pLevel < currentLevel) {
                return true;
            }
        }

        return false;
    },

    onTick(process, options = {}) {
        if (wasmBridge.isLoaded) {
            wasmBridge.mlfq.onTick(process);
            return;
        }

        if (!process) return;

        const current = this.timeSliceUsed.get(process.id) || 0;
        this.timeSliceUsed.set(process.id, current + 1);

        if (!this.processQueueLevel.has(process.id)) {
            this.processQueueLevel.set(process.id, 0);
        }
    },

    onContextSwitch(newProcess, options = {}) {
        if (wasmBridge.isLoaded) {
            wasmBridge.mlfq.onContextSwitch(newProcess, options);
            return;
        }

        if (!newProcess) return;

        const prevUsed = this.timeSliceUsed.get(newProcess.id) || 0;
        const currentLevel = this.processQueueLevel.get(newProcess.id) ?? 0;
        const quantum = this.getQueueQuantum(currentLevel, options);
        const numQueues = this.getNumQueues(options);

        if (prevUsed >= quantum && currentLevel < numQueues - 1) {
            this.processQueueLevel.set(newProcess.id, currentLevel + 1);
        }

        this.timeSliceUsed.set(newProcess.id, 0);
        this.waitingSince.set(newProcess.id, undefined);
    },

    reset() {
        if (wasmBridge.isLoaded) {
            wasmBridge.mlfq.reset();
        }
        this.processQueueLevel.clear();
        this.timeSliceUsed.clear();
        this.waitingSince.clear();
    }
};
