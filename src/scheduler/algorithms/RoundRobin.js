// Round Robin Scheduling Algorithm
import { wasmBridge } from '../../wasm/wasmBridge.js';

export const RoundRobin = {
    name: 'Round Robin',
    shortName: 'RR',
    preemptive: true,

    // JS fallback state
    timeSliceUsed: new Map(),
    lastProcess: null,

    selectNext(readyQueue, currentTime, options = {}) {
        if (wasmBridge.isLoaded) {
            return wasmBridge.rr.selectNext(readyQueue, currentTime, options);
        }

        const quantum = options.quantum ?? 3;

        if (readyQueue.length === 0) return null;

        const available = readyQueue.filter(p => p.arrivalTime <= currentTime);
        if (available.length === 0) return null;

        // If there's a current process that hasn't used its quantum, continue
        if (this.lastProcess && available.find(p => p.id === this.lastProcess.id)) {
            const used = this.timeSliceUsed.get(this.lastProcess.id) || 0;
            if (used < quantum && this.lastProcess.remainingTime > 0) {
                return this.lastProcess;
            }
        }

        // Round robin: rotate through processes
        if (this.lastProcess) {
            const lastIndex = available.findIndex(p => p.id === this.lastProcess.id);
            if (lastIndex !== -1 && available.length > 1) {
                const nextIndex = (lastIndex + 1) % available.length;
                return available[nextIndex];
            }
        }

        return available[0];
    },

    shouldPreempt(currentProcess, readyQueue, currentTime, options = {}) {
        if (wasmBridge.isLoaded) {
            return wasmBridge.rr.shouldPreempt(currentProcess, readyQueue, currentTime, options);
        }

        if (!currentProcess) return false;

        const quantum = options.quantum ?? 3;
        const used = this.timeSliceUsed.get(currentProcess.id) || 0;

        return used >= quantum;
    },

    onTick(process, options = {}) {
        if (wasmBridge.isLoaded) {
            wasmBridge.rr.onTick(process);
            return;
        }

        if (!process) return;

        const current = this.timeSliceUsed.get(process.id) || 0;
        this.timeSliceUsed.set(process.id, current + 1);
        this.lastProcess = process;
    },

    onContextSwitch(newProcess, options = {}) {
        if (wasmBridge.isLoaded) {
            wasmBridge.rr.onContextSwitch(newProcess);
            return;
        }

        if (newProcess) {
            this.timeSliceUsed.set(newProcess.id, 0);
        }
        this.lastProcess = newProcess;
    },

    reset() {
        if (wasmBridge.isLoaded) {
            wasmBridge.rr.reset();
        }
        this.timeSliceUsed.clear();
        this.lastProcess = null;
    }
};
