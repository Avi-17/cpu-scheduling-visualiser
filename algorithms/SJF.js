/**
 * SJF.js — Shortest Job First (Non-Preemptive) & SRTF (Preemptive)
 *
 * SJF  — Non-preemptive. Among available processes, pick the one with
 *         the shortest burst_time; once started it runs to completion.
 *
 * SRTF — Preemptive (Shortest Remaining Time First). At every time unit,
 *         the process with the smallest remaining_time is chosen; it can
 *         be preempted if a shorter process arrives.
 *
 * Expected process object shape:
 *   { id, name, arrival_time, burst_time, remaining_time, priority? }
 */

// ─── Non-Preemptive SJF ──────────────────────────────────────────────────────

export const SJF = {
  name: "Shortest Job First",
  shortName: "SJF",
  preemptive: false,

  /**
   * Select the next process to run (non-preemptive).
   * Picks the process with the shortest burst_time among those that have arrived.
   *
   * @param {Array}  readyQueue  - Waiting processes.
   * @param {number} currentTime - Current simulation time.
   * @returns {Object|null}
   */
  selectNext(readyQueue, currentTime, options = {}) {
    if (!readyQueue || readyQueue.length === 0) return null;

    const available = readyQueue.filter(p => p.arrival_time <= currentTime);
    if (available.length === 0) return null;

    return available.reduce((shortest, p) => {
      if (p.burst_time < shortest.burst_time) return p;
      if (p.burst_time === shortest.burst_time && p.arrival_time < shortest.arrival_time) return p;
      if (p.burst_time === shortest.burst_time && p.arrival_time === shortest.arrival_time && p.id < shortest.id) return p;
      return shortest;
    });
  },

  /**
   * SJF is non-preemptive — never preempts a running process.
   */
  shouldPreempt(currentProcess, readyQueue, currentTime) {
    return false;
  },

  /**
   * Run the full SJF simulation.
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
        // CPU idle — jump to next arrival
        const nextArrival = Math.min(...remaining.map(p => p.arrival_time));
        currentTime = nextArrival;
        continue;
      }

      // Pick shortest burst; tie-break on arrival time, then id
      const chosen = available.reduce((s, p) => {
        if (p.burst_time < s.burst_time) return p;
        if (p.burst_time === s.burst_time && p.arrival_time < s.arrival_time) return p;
        if (p.burst_time === s.burst_time && p.arrival_time === s.arrival_time && p.id < s.id) return p;
        return s;
      });

      const start_time = currentTime;
      const completion_time = currentTime + chosen.burst_time;
      const turnaround_time = completion_time - chosen.arrival_time;
      const waiting_time = turnaround_time - chosen.burst_time;

      gantt.push({ pid: chosen.id, name: chosen.name || `P${chosen.id}`, start: start_time, end: completion_time });

      completed.push({ ...chosen, start_time, completion_time, turnaround_time, waiting_time });
      remaining.splice(remaining.findIndex(p => p.id === chosen.id), 1);
      currentTime = completion_time;
    }

    // Return results in original process order
    const results = processes.map(p => completed.find(c => c.id === p.id));
    return { results, gantt };
  },
};

// ─── Preemptive SRTF ─────────────────────────────────────────────────────────

export const SRTF = {
  name: "Shortest Remaining Time First",
  shortName: "SRTF",
  preemptive: true,

  /**
   * Select the process with the smallest remaining_time from the ready queue.
   *
   * @param {Array}  readyQueue  - Waiting processes.
   * @param {number} currentTime - Current simulation time.
   * @returns {Object|null}
   */
  selectNext(readyQueue, currentTime, options = {}) {
    if (!readyQueue || readyQueue.length === 0) return null;

    const available = readyQueue.filter(p => p.arrival_time <= currentTime);
    if (available.length === 0) return null;

    return available.reduce((shortest, p) => {
      const remA = p.remaining_time ?? p.burst_time;
      const remS = shortest.remaining_time ?? shortest.burst_time;
      if (remA < remS) return p;
      if (remA === remS && p.arrival_time < shortest.arrival_time) return p;
      if (remA === remS && p.arrival_time === shortest.arrival_time && p.id < shortest.id) return p;
      return shortest;
    });
  },

  /**
   * Preempt the current process if a newly arrived process has a shorter
   * remaining time.
   *
   * @param {Object} currentProcess - The process currently running.
   * @param {Array}  readyQueue     - Other waiting processes.
   * @param {number} currentTime    - Current simulation time.
   * @returns {boolean}
   */
  shouldPreempt(currentProcess, readyQueue, currentTime) {
    if (!currentProcess || !readyQueue || readyQueue.length === 0) return false;

    const currentRemaining = currentProcess.remaining_time ?? currentProcess.burst_time;
    const available = readyQueue.filter(p => p.arrival_time <= currentTime && p.id !== currentProcess.id);

    return available.some(p => {
      const rem = p.remaining_time ?? p.burst_time;
      return rem < currentRemaining;
    });
  },

  /**
   * Run the full SRTF simulation (unit-step simulation).
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
      // Get all arrived and not-yet-finished processes
      const available = procs.filter(p => p.arrival_time <= currentTime && p.remaining_time > 0);

      if (available.length === 0) {
        currentTime++;
        continue;
      }

      // Shortest remaining time; tie-break by id
      const chosen = available.reduce((s, p) =>
        p.remaining_time < s.remaining_time ? p :
        p.remaining_time === s.remaining_time && p.id < s.id ? p : s
      );

      // Extend last gantt segment or push a new one
      const last = gantt[gantt.length - 1];
      if (last && last.pid === chosen.id && last.end === currentTime) {
        last.end++;
      } else {
        gantt.push({ pid: chosen.id, name: chosen.name || `P${chosen.id}`, start: currentTime, end: currentTime + 1 });
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
