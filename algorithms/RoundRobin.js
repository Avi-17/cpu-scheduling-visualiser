// Round Robin Scheduling Algorithm
export const RoundRobin = {
    name: 'Round Robin',
    shortName: 'RR',
    preemptive: true,

    // Track time slice usage per process
    timeSliceUsed: new Map(),
    lastProcess: null,

    selectNext(readyQueue, currentTime, options = {}) {
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
        // Find the next process after the last one
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
        if (!currentProcess) return false;

        const quantum = options.quantum ?? 3;
        const used = this.timeSliceUsed.get(currentProcess.id) || 0;

        // Preempt if time quantum is exhausted
        return used >= quantum;
    },

    onTick(process, options = {}) {
        if (!process) return;

        const current = this.timeSliceUsed.get(process.id) || 0;
        this.timeSliceUsed.set(process.id, current + 1);
        this.lastProcess = process;
    },

    onContextSwitch(newProcess, options = {}) {
        // Reset time slice for new process
        if (newProcess) {
            this.timeSliceUsed.set(newProcess.id, 0);
        }
        this.lastProcess = newProcess;
    },

    reset() {
        this.timeSliceUsed.clear();
        this.lastProcess = null;
    }
};
