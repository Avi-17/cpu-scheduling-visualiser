// Priority Scheduling Algorithm (Non-Preemptive)
import { wasmBridge } from '../../wasm/wasmBridge.js';

export const PriorityNonPreemptive = {
    name: 'Priority (Non-Preemptive)',
    shortName: 'Priority-NP',
    preemptive: false,

    selectNext(readyQueue, currentTime, options = {}) {
        if (wasmBridge.isLoaded) {
            return wasmBridge.priorityNp.selectNext(readyQueue, currentTime, options);
        }

        if (readyQueue.length === 0) return null;

        const available = readyQueue.filter(p => p.arrivalTime <= currentTime);
        if (available.length === 0) return null;

        const highPriorityFirst = options.highPriorityFirst ?? false;

        return available.reduce((best, p) => {
            if (highPriorityFirst) {
                return p.priority > best.priority ? p : best;
            } else {
                return p.priority < best.priority ? p : best;
            }
        }, available[0]);
    },

    shouldPreempt() {
        // Non-preemptive: never preempt
        return false;
    }
};
