/**
 * Priority.js — Priority Scheduling Algorithm
 *
 * Supports both non-preemptive and preemptive modes.
 *
 * Convention: LOWER priority number = HIGHER importance (like Unix nice values).
 * You can invert this by sorting descending if needed.
 *
 * Expected process object shape:
 *   { id, name, arrival_time, burst_time, remaining_time, priority }
 *
 * Exports:
 *   Priority     — non-preemptive
 *   PriorityPre  — preemptive
 */

// ─── Non-Preemptive Priority ──────────────────────────────────────────────────

export const Priority = {
  name: "Priority Scheduling (Non-Preemptive)",
  shortName: "Priority",
  preemptive: false,

  /**
   * Select the process with the highest priority (lowest number) that has arrived.
   *
   * @param {Array}  readyQueue  - Waiting processes.
   * @param {number} currentTime - Current simulation time.
   * @returns {Object|null}
   */
  selectNext(readyQueue, currentTime, options = {}) {
    if (!readyQueue || readyQueue.length === 0) return null;

    const available = readyQueue.filter(p => p.arrival_time <= currentTime);
    if (available.length === 0) return null;

    return available.reduce((best, p) => {
      if (p.priority < best.priority) return p;
      if (p.priority === best.priority && p.arrival_time < best.arrival_time) return p;
      if (p.priority === best.priority && p.arrival_time === best.arrival_time && p.id < best.id) return p;
      return best;
    });
  },

  /** Non-preemptive — never interrupts a running process. */
  shouldPreempt(currentProcess, readyQueue, currentTime) {
    return false;
  },

  /**
   * Run the full non-preemptive Priority simulation.
   *
   * @param {Array} processes
   * @returns {{ results: Array, gantt: Array }}
   */
  run(processes) {
    if (!processes || processes.length === 0) return { results: [], gantt: [] };

    const remaining = processes.map(p => ({ ...p }));
    const completed = [];
    const gantt = [];
    let currentTime = 0;

    while (completed.length < processes.length) {
      const available = remaining.filter(p => p.arrival_time <= currentTime);

      if (available.length === 0) {
        const nextArrival = Math.min(...remaining.map(p => p.arrival_time));
        currentTime = nextArrival;
        continue;
      }

      // Pick highest priority (lowest number)
      const chosen = available.reduce((best, p) => {
        if (p.priority < best.priority) return p;
        if (p.priority === best.priority && p.arrival_time < best.arrival_time) return p;
        if (p.priority === best.priority && p.arrival_time === best.arrival_time && p.id < best.id) return p;
        return best;
      });

      const start_time = currentTime;
      const completion_time = currentTime + chosen.burst_time;
      const turnaround_time = completion_time - chosen.arrival_time;
      const waiting_time = turnaround_time - chosen.burst_time;

      gantt.push({ pid: chosen.id, name: chosen.name || `P${chosen.id}`, priority: chosen.priority, start: start_time, end: completion_time });

      completed.push({ ...chosen, start_time, completion_time, turnaround_time, waiting_time });
      remaining.splice(remaining.findIndex(p => p.id === chosen.id), 1);
      currentTime = completion_time;
    }

    const results = processes.map(p => completed.find(c => c.id === p.id));
    return { results, gantt };
  },
};

// ─── Preemptive Priority ──────────────────────────────────────────────────────

export const PriorityPre = {
  name: "Priority Scheduling (Preemptive)",
  shortName: "PriorityPre",
  preemptive: true,

  /**
   * Select the process with the highest priority (lowest number) that has arrived.
   */
  selectNext(readyQueue, currentTime, options = {}) {
    if (!readyQueue || readyQueue.length === 0) return null;

    const available = readyQueue.filter(p => p.arrival_time <= currentTime);
    if (available.length === 0) return null;

    return available.reduce((best, p) => {
      if (p.priority < best.priority) return p;
      if (p.priority === best.priority && p.id < best.id) return p;
      return best;
    });
  },

  /**
   * Preempt the current process if a higher-priority process is now available.
   */
  shouldPreempt(currentProcess, readyQueue, currentTime) {
    if (!currentProcess || !readyQueue || readyQueue.length === 0) return false;

    const available = readyQueue.filter(p => p.arrival_time <= currentTime && p.id !== currentProcess.id);
    return available.some(p => p.priority < currentProcess.priority);
  },

  /**
   * Run the full preemptive Priority simulation (unit-step).
   *
   * @param {Array} processes
   * @returns {{ results: Array, gantt: Array }}
   */
  run(processes) {
    if (!processes || processes.length === 0) return { results: [], gantt: [] };

    const procs = processes.map(p => ({
      ...p,
      remaining_time: p.remaining_time ?? p.burst_time,
      completion_time: 0,
    }));

    const gantt = [];
    let currentTime = 0;
    let completed = 0;
    const n = procs.length;

    while (completed < n) {
      const available = procs.filter(p => p.arrival_time <= currentTime && p.remaining_time > 0);

      if (available.length === 0) {
        currentTime++;
        continue;
      }

      // Highest priority (lowest number); tie-break by id
      const chosen = available.reduce((best, p) =>
        p.priority < best.priority ? p :
        p.priority === best.priority && p.id < best.id ? p : best
      );

      const last = gantt[gantt.length - 1];
      if (last && last.pid === chosen.id && last.end === currentTime) {
        last.end++;
      } else {
        gantt.push({ pid: chosen.id, name: chosen.name || `P${chosen.id}`, priority: chosen.priority, start: currentTime, end: currentTime + 1 });
      }

      chosen.remaining_time--;
      currentTime++;

      if (chosen.remaining_time === 0) {
        chosen.completion_time = currentTime;
        completed++;
      }
    }

    const results = processes.map(p => {
      const proc = procs.find(pr => pr.id === p.id);
      const turnaround_time = proc.completion_time - proc.arrival_time;
      const waiting_time = turnaround_time - proc.burst_time;
      return { ...p, completion_time: proc.completion_time, turnaround_time, waiting_time };
    });

    return { results, gantt };
  },
};
