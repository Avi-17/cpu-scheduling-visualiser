// First Come First Serve Scheduling Algorithm
export const FCFS = {
    name: 'First Come First Serve',
    shortName: 'FCFS',
    preemptive: false,

    selectNext(readyQueue, currentTime, options = {}) {
        if (readyQueue.length === 0) return null;

        // Select the process that arrived earliest (already sorted by arrival)
        const available = readyQueue.filter(p => p.arrivalTime <= currentTime);
        if (available.length === 0) return null;

        // Return the first available process
        return available[0];
    },

    shouldPreempt(currentProcess, readyQueue, currentTime) {
        // FCFS is non-preemptive
        return false;
    }
};
