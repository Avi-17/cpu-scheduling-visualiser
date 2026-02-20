// Shortest Job First Scheduling Algorithm (Preemptive and Non-Preemptive)
export const SJF = {
    name: 'Shortest Job First',
    shortName: 'SJF',
    preemptive: false,

    selectNext(readyQueue, currentTime, options = {}) {
        if (readyQueue.length === 0) return null;

        const available = readyQueue.filter(p => p.arrivalTime <= currentTime);
        if (available.length === 0) return null;

        // Select process with shortest remaining burst time
        return available.reduce((shortest, p) =>
            p.remainingTime < shortest.remainingTime ? p : shortest
            , available[0]);
    },

    shouldPreempt(currentProcess, readyQueue, currentTime) {
        // Non-preemptive SJF
        return false;
    }
};

export const SJFPreemptive = {
    name: 'Shortest Job First (Preemptive)',
    shortName: 'SJF-P',
    preemptive: true,

    selectNext(readyQueue, currentTime, options = {}) {
        if (readyQueue.length === 0) return null;

        const available = readyQueue.filter(p => p.arrivalTime <= currentTime);
        if (available.length === 0) return null;

        // Select process with shortest remaining time
        return available.reduce((shortest, p) =>
            p.remainingTime < shortest.remainingTime ? p : shortest
            , available[0]);
    },

    shouldPreempt(currentProcess, readyQueue, currentTime) {
        if (!currentProcess) return false;

        const available = readyQueue.filter(p =>
            p.arrivalTime <= currentTime && p.id !== currentProcess.id
        );

        if (available.length === 0) return false;

        // Check if any process has shorter remaining time
        const shortest = available.reduce((s, p) =>
            p.remainingTime < s.remainingTime ? p : s
            , available[0]);

        return shortest.remainingTime < currentProcess.remainingTime;
    }
};
