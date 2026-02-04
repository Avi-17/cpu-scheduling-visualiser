// Priority Scheduling Algorithm
export const Priority = {
    name: 'Priority Scheduling',
    shortName: 'Priority',
    preemptive: true,

    selectNext(readyQueue, currentTime, options = {}) {
        if (readyQueue.length === 0) return null;

        const available = readyQueue.filter(p => p.arrivalTime <= currentTime);
        if (available.length === 0) return null;

        // Higher priority number = higher priority (configurable)
        const highPriorityFirst = options.highPriorityFirst ?? true;

        return available.reduce((best, p) => {
            if (highPriorityFirst) {
                return p.priority > best.priority ? p : best;
            } else {
                return p.priority < best.priority ? p : best;
            }
        }, available[0]);
    },

    shouldPreempt(currentProcess, readyQueue, currentTime, options = {}) {
        if (!currentProcess) return false;

        const available = readyQueue.filter(p =>
            p.arrivalTime <= currentTime && p.id !== currentProcess.id
        );

        if (available.length === 0) return false;

        const highPriorityFirst = options.highPriorityFirst ?? true;

        // Check if any process has higher priority
        const highest = available.reduce((h, p) => {
            if (highPriorityFirst) {
                return p.priority > h.priority ? p : h;
            } else {
                return p.priority < h.priority ? p : h;
            }
        }, available[0]);

        if (highPriorityFirst) {
            return highest.priority > currentProcess.priority;
        } else {
            return highest.priority < currentProcess.priority;
        }
    }
};
