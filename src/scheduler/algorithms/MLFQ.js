// Multi-Level Feedback Queue Scheduling Algorithm
export const MLFQ = {
    name: 'Multi-Level Feedback Queue',
    shortName: 'MLFQ',
    preemptive: true,

    // Internal state: track which queue level each process is in
    processQueueLevel: new Map(),
    timeSliceUsed: new Map(),
    waitingSince: new Map(), // For aging: track when a process started waiting

    getQueueQuantum(level, options = {}) {
        const quantums = options.mlfqQuantums ?? [2, 4, 8];
        return quantums[Math.min(level, quantums.length - 1)];
    },

    getNumQueues(options = {}) {
        return options.mlfqQueues ?? 3;
    },

    getProcessLevel(processId) {
        return this.processQueueLevel.get(processId) ?? 0;
    },

    selectNext(readyQueue, currentTime, options = {}) {
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
                this.getProcessLevel(p.id) === level
            );

            if (levelProcesses.length > 0) {
                // Within same level, use FCFS (arrival time order)
                levelProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime);
                return levelProcesses[0];
            }
        }

        // Fallback: any remaining process (shouldn't reach here)
        return available[0];
    },

    shouldPreempt(currentProcess, readyQueue, currentTime, options = {}) {
        if (!currentProcess) return false;

        const currentLevel = this.getProcessLevel(currentProcess.id);
        const quantum = this.getQueueQuantum(currentLevel, options);
        const used = this.timeSliceUsed.get(currentProcess.id) || 0;

        // Preempt if time quantum for current queue is exhausted
        if (used >= quantum) {
            return true;
        }

        // Preempt if a higher-priority queue has a process ready
        const available = readyQueue.filter(p =>
            p.arrivalTime <= currentTime && p.id !== currentProcess.id
        );

        for (const p of available) {
            const pLevel = this.getProcessLevel(p.id);
            if (pLevel < currentLevel) {
                return true; // Higher priority queue process arrived
            }
        }

        return false;
    },

    onTick(process, options = {}) {
        if (!process) return;

        const current = this.timeSliceUsed.get(process.id) || 0;
        this.timeSliceUsed.set(process.id, current + 1);

        // Track queue level for Gantt metadata
        if (!this.processQueueLevel.has(process.id)) {
            this.processQueueLevel.set(process.id, 0);
        }
    },

    onContextSwitch(newProcess, options = {}) {
        if (!newProcess) return;

        const prevUsed = this.timeSliceUsed.get(newProcess.id) || 0;
        const currentLevel = this.getProcessLevel(newProcess.id);
        const quantum = this.getQueueQuantum(currentLevel, options);
        const numQueues = this.getNumQueues(options);

        // If previous quantum was exhausted, demote to lower priority queue
        if (prevUsed >= quantum && currentLevel < numQueues - 1) {
            this.processQueueLevel.set(newProcess.id, currentLevel + 1);
        }

        // Reset time slice for the new context
        this.timeSliceUsed.set(newProcess.id, 0);

        // Update waiting timestamps for aging
        this.waitingSince.set(newProcess.id, undefined);
    },

    reset() {
        this.processQueueLevel.clear();
        this.timeSliceUsed.clear();
        this.waitingSince.clear();
    }
};
