// First Come First Serve Scheduling Algorithm
import { wasmBridge } from '../../wasm/wasmBridge.js';

export const FCFS = {
    name: 'First Come First Serve',
    shortName: 'FCFS',
    preemptive: false,

    selectNext(readyQueue, currentTime, options = {}) {
        // WASM path
        if (wasmBridge.isLoaded) {
            return wasmBridge.fcfs.selectNext(readyQueue, currentTime);
        }

        // JS fallback
        if (readyQueue.length === 0) return null;

        const available = readyQueue.filter(p => p.arrivalTime <= currentTime);
        if (available.length === 0) return null;

        return available[0];
    },

    shouldPreempt(currentProcess, readyQueue, currentTime) {
        // FCFS is non-preemptive
        return false;
    }
};
