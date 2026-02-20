/**
 * FCFS.js — First Come First Serve Scheduling Algorithm
 *
 * Non-preemptive. Processes are selected in the order they arrive
 * (sorted by arrival_time, then by id as a tie-breaker).
 *
 * Expected process object shape:
 *   { id, name, arrival_time, burst_time, remaining_time, priority? }
 */

export const FCFS = {
  name: "First Come First Serve",
  shortName: "FCFS",
  preemptive: false,

  /**
   * Select the next process to run from the ready queue.
   *
   * @param {Array}  readyQueue   - Processes that have arrived and are waiting.
   * @param {number} currentTime  - Current simulation time (unused for pure FCFS
   *                                once the ready queue is already filtered by arrival).
   * @param {Object} [options]    - Reserved for future use.
   * @returns {Object|null} The selected process, or null if no process available.
   */
  selectNext(readyQueue, currentTime, options = {}) {
    if (!readyQueue || readyQueue.length === 0) return null;

    // Filter processes that have arrived
    const available = readyQueue.filter(p => p.arrival_time <= currentTime);
    if (available.length === 0) return null;

    // Pick the one that arrived earliest; break ties by process id
    return available.reduce((earliest, p) => {
      if (p.arrival_time < earliest.arrival_time) return p;
      if (p.arrival_time === earliest.arrival_time && p.id < earliest.id) return p;
      return earliest;
    });
  },

  /**
   * FCFS is non-preemptive — the running process is never preempted.
   *
   * @returns {boolean} Always false.
   */
  shouldPreempt(currentProcess, readyQueue, currentTime) {
    return false;
  },

  /**
   * Compute full scheduling results for a list of processes.
   * Returns each process augmented with: completion_time, turnaround_time,
   * waiting_time and a gantt chart array.
   *
   * @param {Array} processes  - List of process objects.
   * @returns {{ results: Array, gantt: Array }}
   */
  run(processes) {
    if (!processes || processes.length === 0) return { results: [], gantt: [] };

    // Sort by arrival time, then id
    const sorted = [...processes].sort((a, b) =>
      a.arrival_time !== b.arrival_time
        ? a.arrival_time - b.arrival_time
        : a.id - b.id
    );

    let currentTime = 0;
    const gantt = [];

    const results = sorted.map(p => {
      // CPU idles if the next process hasn't arrived yet
      if (currentTime < p.arrival_time) {
        currentTime = p.arrival_time;
      }

      const start_time = currentTime;
      const completion_time = currentTime + p.burst_time;
      const turnaround_time = completion_time - p.arrival_time;
      const waiting_time = turnaround_time - p.burst_time;

      gantt.push({ pid: p.id, name: p.name || `P${p.id}`, start: start_time, end: completion_time });

      currentTime = completion_time;

      return {
        ...p,
        start_time,
        completion_time,
        turnaround_time,
        waiting_time,
      };
    });

    return { results, gantt };
  },
};
