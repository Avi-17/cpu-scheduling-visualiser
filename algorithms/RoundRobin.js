/**
 * RoundRobin.js — Round Robin Scheduling Algorithm
 *
 * Preemptive. Each process is given a fixed time quantum. If it doesn't
 * finish within the quantum, it is added back to the end of the ready queue.
 *
 * Expected process object shape:
 *   { id, name, arrival_time, burst_time, remaining_time, priority? }
 */

export const RoundRobin = {
  name: "Round Robin",
  shortName: "RR",
  preemptive: true,

  /**
   * Select the next process in FIFO order from those that have arrived.
   * In a Round Robin simulation, the caller maintains the FIFO queue;
   * this function simply returns the first available process.
   *
   * @param {Array}  readyQueue  - Waiting processes in FIFO order.
   * @param {number} currentTime - Current simulation time.
   * @param {Object} [options]   - { quantum: number } (default: 2)
   * @returns {Object|null}
   */
  selectNext(readyQueue, currentTime, options = {}) {
    if (!readyQueue || readyQueue.length === 0) return null;

    const available = readyQueue.filter(p => p.arrival_time <= currentTime);
    if (available.length === 0) return null;

    // FIFO among arrived processes (order preserved from the queue)
    return available[0];
  },

  /**
   * A running process should be preempted once it has used its full quantum.
   * The caller tracks elapsed CPU time; this function always returns false
   * (the simulation loop controls preemption via quantum).
   */
  shouldPreempt(currentProcess, readyQueue, currentTime) {
    // Preemption is handled entirely by the quantum logic in run()
    return false;
  },

  /**
   * Run the full Round Robin simulation.
   *
   * @param {Array}  processes
   * @param {number} [quantum=2] Time quantum for each process slice.
   * @returns {{ results: Array, gantt: Array }}
   */
  run(processes, quantum = 2) {
    if (!processes || processes.length === 0) return { results: [], gantt: [] };

    // Work with copies that track remaining time
    const procs = processes.map(p => ({
      ...p,
      remaining_time: p.remaining_time ?? p.burst_time,
      completion_time: 0,
    }));

    const gantt = [];
    const queue = [];            // Ready queue (FIFO)
    const enqueued = new Set();  // Track which pids have been added
    let currentTime = 0;
    let completed = 0;
    const n = procs.length;

    // Sort processes by arrival time to determine initial queue order
    const byArrival = [...procs].sort((a, b) =>
      a.arrival_time !== b.arrival_time ? a.arrival_time - b.arrival_time : a.id - b.id
    );

    // Enqueue processes that arrive at time 0
    byArrival.forEach(p => {
      if (p.arrival_time <= currentTime && !enqueued.has(p.id)) {
        queue.push(p);
        enqueued.add(p.id);
      }
    });

    while (completed < n) {
      if (queue.length === 0) {
        // CPU idle — jump to next process arrival
        const nextArrival = byArrival.find(p => p.arrival_time > currentTime && !enqueued.has(p.id));
        if (!nextArrival) break;
        currentTime = nextArrival.arrival_time;

        byArrival.forEach(p => {
          if (p.arrival_time <= currentTime && !enqueued.has(p.id)) {
            queue.push(p);
            enqueued.add(p.id);
          }
        });
        continue;
      }

      const current = queue.shift();
      const slice = Math.min(quantum, current.remaining_time);
      const start = currentTime;
      const end = currentTime + slice;

      // Extend previous gantt bar or push new one
      const last = gantt[gantt.length - 1];
      if (last && last.pid === current.id && last.end === start) {
        last.end = end;
      } else {
        gantt.push({ pid: current.id, name: current.name || `P${current.id}`, start, end });
      }

      current.remaining_time -= slice;
      currentTime = end;

      // Enqueue any newly arrived processes BEFORE requeueing the current one
      byArrival.forEach(p => {
        if (p.arrival_time <= currentTime && !enqueued.has(p.id)) {
          queue.push(p);
          enqueued.add(p.id);
        }
      });

      if (current.remaining_time === 0) {
        current.completion_time = currentTime;
        completed++;
      } else {
        // Requeue at back
        queue.push(current);
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
