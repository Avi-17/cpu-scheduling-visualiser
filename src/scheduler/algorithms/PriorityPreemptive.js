// Priority Scheduling Algorithm (Preemptive)
export const PriorityPreemptive = {
    name: 'Priority (Preemptive)',
    shortName: 'Priority-P',
    preemptive: true,

    selectNext(readyQueue, currentTime, options = {}) {
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

    shouldPreempt(currentProcess, readyQueue, currentTime, options = {}) {
        if (!currentProcess) return false;

        const available = readyQueue.filter(p =>
            p.arrivalTime <= currentTime && p.id !== currentProcess.id
        );

        if (available.length === 0) return false;

        const highPriorityFirst = options.highPriorityFirst ?? false;

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
