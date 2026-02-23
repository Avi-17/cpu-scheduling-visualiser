/**
 * CPU Scheduling Algorithms - WebAssembly Module
 * 
 * This C file implements the core scheduling algorithms that get compiled to
 * WebAssembly for near-native performance in the browser.
 * 
 * Compile with: emcc algorithms.c -o algorithms.js -s EXPORTED_FUNCTIONS='[...]' -s MODULARIZE=1
 */

#include <emscripten.h>
#include <stdlib.h>
#include <stdbool.h>
#include <limits.h>
#include <string.h>

/**
 * Process structure matching the JavaScript Process model
 * Memory layout must be consistent for JS interop
 */
typedef struct {
    int id;
    int arrivalTime;
    int burstTime;
    int remainingTime;
    int priority;
    int state; // 0=waiting, 1=ready, 2=running, 3=completed
} Process;

// Process states enum
#define STATE_WAITING 0
#define STATE_READY 1
#define STATE_RUNNING 2
#define STATE_COMPLETED 3

#define MAX_PROCESSES 256

/**
 * Allocate memory for process array (called from JS)
 */
EMSCRIPTEN_KEEPALIVE
Process* create_process_array(int size) {
    return (Process*)malloc(size * sizeof(Process));
}

/**
 * Free process array memory
 */
EMSCRIPTEN_KEEPALIVE
void free_process_array(Process* arr) {
    free(arr);
}

/**
 * Set process data at index (called from JS to populate array)
 */
EMSCRIPTEN_KEEPALIVE
void set_process(Process* arr, int index, int id, int arrivalTime, 
                 int burstTime, int remainingTime, int priority, int state) {
    arr[index].id = id;
    arr[index].arrivalTime = arrivalTime;
    arr[index].burstTime = burstTime;
    arr[index].remainingTime = remainingTime;
    arr[index].priority = priority;
    arr[index].state = state;
}

/* ============================================================
 * FCFS - First Come First Serve
 * ============================================================
 * Non-preemptive algorithm that selects the process that arrived first.
 * Simple FIFO ordering based on arrival time.
 */
EMSCRIPTEN_KEEPALIVE
int fcfs_select_next(Process* queue, int size, int currentTime) {
    int earliestArrival = INT_MAX;
    int selectedId = -1;
    
    for (int i = 0; i < size; i++) {
        if (queue[i].arrivalTime <= currentTime && 
            queue[i].state == STATE_READY) {
            if (queue[i].arrivalTime < earliestArrival) {
                earliestArrival = queue[i].arrivalTime;
                selectedId = queue[i].id;
            }
        }
    }
    return selectedId;
}

EMSCRIPTEN_KEEPALIVE
bool fcfs_should_preempt(int currentProcessId, Process* queue, int size, int currentTime) {
    // FCFS is non-preemptive
    return false;
}

/* ============================================================
 * SJF - Shortest Job First (Non-Preemptive)
 * ============================================================
 * Selects the process with the shortest burst time.
 * Once a process starts, it runs to completion.
 */
EMSCRIPTEN_KEEPALIVE
int sjf_select_next(Process* queue, int size, int currentTime) {
    int shortestTime = INT_MAX;
    int selectedId = -1;
    
    for (int i = 0; i < size; i++) {
        if (queue[i].arrivalTime <= currentTime && 
            queue[i].state == STATE_READY) {
            if (queue[i].remainingTime < shortestTime) {
                shortestTime = queue[i].remainingTime;
                selectedId = queue[i].id;
            }
        }
    }
    return selectedId;
}

EMSCRIPTEN_KEEPALIVE
bool sjf_should_preempt(int currentProcessId, Process* queue, int size, int currentTime) {
    // Non-preemptive SJF
    return false;
}

/* ============================================================
 * SRTF - Shortest Remaining Time First (Preemptive SJF)
 * ============================================================
 * Preemptive version of SJF. If a new process arrives with shorter
 * remaining time than the currently running process, preempt.
 */
EMSCRIPTEN_KEEPALIVE
int srtf_select_next(Process* queue, int size, int currentTime) {
    // Same as SJF for selection
    return sjf_select_next(queue, size, currentTime);
}

EMSCRIPTEN_KEEPALIVE
bool srtf_should_preempt(int currentProcessId, int currentRemainingTime,
                          Process* queue, int size, int currentTime) {
    if (currentProcessId < 0) return false;
    
    for (int i = 0; i < size; i++) {
        if (queue[i].arrivalTime <= currentTime && 
            queue[i].state == STATE_READY &&
            queue[i].id != currentProcessId) {
            if (queue[i].remainingTime < currentRemainingTime) {
                return true;
            }
        }
    }
    return false;
}

/* ============================================================
 * Priority Scheduling (Preemptive)
 * ============================================================
 * Selects the process with highest priority.
 * Higher number = higher priority (configurable via highFirst).
 */
EMSCRIPTEN_KEEPALIVE
int priority_select_next(Process* queue, int size, int currentTime, bool highFirst) {
    int bestPriority = highFirst ? -1 : INT_MAX;
    int selectedId = -1;
    
    for (int i = 0; i < size; i++) {
        if (queue[i].arrivalTime <= currentTime && 
            queue[i].state == STATE_READY) {
            bool isBetter = highFirst 
                ? (queue[i].priority > bestPriority)
                : (queue[i].priority < bestPriority);
            
            if (isBetter) {
                bestPriority = queue[i].priority;
                selectedId = queue[i].id;
            }
        }
    }
    return selectedId;
}

EMSCRIPTEN_KEEPALIVE
bool priority_should_preempt(int currentProcessId, int currentPriority,
                              Process* queue, int size, int currentTime, bool highFirst) {
    if (currentProcessId < 0) return false;
    
    for (int i = 0; i < size; i++) {
        if (queue[i].arrivalTime <= currentTime && 
            queue[i].state == STATE_READY &&
            queue[i].id != currentProcessId) {
            
            bool hasHigherPriority = highFirst
                ? (queue[i].priority > currentPriority)
                : (queue[i].priority < currentPriority);
            
            if (hasHigherPriority) {
                return true;
            }
        }
    }
    return false;
}

/* ============================================================
 * Priority Scheduling (Non-Preemptive)
 * ============================================================
 * Same selection as preemptive priority but never preempts.
 */
EMSCRIPTEN_KEEPALIVE
int priority_np_select_next(Process* queue, int size, int currentTime, bool highFirst) {
    return priority_select_next(queue, size, currentTime, highFirst);
}

EMSCRIPTEN_KEEPALIVE
bool priority_np_should_preempt(int currentProcessId, int currentPriority,
                                 Process* queue, int size, int currentTime, bool highFirst) {
    // Non-preemptive: never preempt
    return false;
}

/* ============================================================
 * Round Robin
 * ============================================================
 * Time-sliced scheduling with a fixed quantum.
 * Each process gets at most 'quantum' time units before being preempted.
 */

static int rr_time_slice_used[MAX_PROCESSES];
static int rr_last_process_id = -1;

EMSCRIPTEN_KEEPALIVE
void rr_reset() {
    memset(rr_time_slice_used, 0, sizeof(rr_time_slice_used));
    rr_last_process_id = -1;
}

EMSCRIPTEN_KEEPALIVE
int rr_select_next(Process* queue, int size, int currentTime, int quantum) {
    if (size == 0) return -1;
    
    int availableCount = 0;
    int availableIds[MAX_PROCESSES];
    
    for (int i = 0; i < size && availableCount < MAX_PROCESSES; i++) {
        if (queue[i].arrivalTime <= currentTime && queue[i].state == STATE_READY) {
            availableIds[availableCount++] = i;
        }
    }
    
    if (availableCount == 0) return -1;
    
    // If current process still has quantum left, continue with it
    if (rr_last_process_id >= 0) {
        for (int i = 0; i < availableCount; i++) {
            int idx = availableIds[i];
            if (queue[idx].id == rr_last_process_id) {
                int used = rr_time_slice_used[rr_last_process_id % MAX_PROCESSES];
                if (used < quantum && queue[idx].remainingTime > 0) {
                    return queue[idx].id;
                }
                break;
            }
        }
    }
    
    // Find next process in round-robin order
    if (rr_last_process_id >= 0 && availableCount > 1) {
        int lastIndex = -1;
        for (int i = 0; i < availableCount; i++) {
            if (queue[availableIds[i]].id == rr_last_process_id) {
                lastIndex = i;
                break;
            }
        }
        
        if (lastIndex >= 0) {
            int nextIndex = (lastIndex + 1) % availableCount;
            return queue[availableIds[nextIndex]].id;
        }
    }
    
    // Default: return first available
    return queue[availableIds[0]].id;
}

EMSCRIPTEN_KEEPALIVE
bool rr_should_preempt(int currentProcessId, int currentTime, int quantum) {
    if (currentProcessId < 0) return false;
    
    int used = rr_time_slice_used[currentProcessId % MAX_PROCESSES];
    return used >= quantum;
}

EMSCRIPTEN_KEEPALIVE
void rr_on_tick(int processId) {
    if (processId >= 0) {
        rr_time_slice_used[processId % MAX_PROCESSES]++;
        rr_last_process_id = processId;
    }
}

EMSCRIPTEN_KEEPALIVE
void rr_on_context_switch(int newProcessId) {
    if (newProcessId >= 0) {
        rr_time_slice_used[newProcessId % MAX_PROCESSES] = 0;
    }
    rr_last_process_id = newProcessId;
}

/* ============================================================
 * MLFQ - Multi-Level Feedback Queue
 * ============================================================
 * Multiple queues with different priority levels and time quantums.
 * Processes start at the highest priority queue (level 0) and get
 * demoted to lower-priority queues if they exhaust their quantum.
 * Within each level, processes are scheduled FCFS.
 */

static int mlfq_process_level[MAX_PROCESSES];     // Queue level per process ID
static int mlfq_time_slice_used[MAX_PROCESSES];    // Time slice used per process ID
static bool mlfq_level_assigned[MAX_PROCESSES];    // Whether a level has been assigned

EMSCRIPTEN_KEEPALIVE
void mlfq_reset() {
    memset(mlfq_process_level, 0, sizeof(mlfq_process_level));
    memset(mlfq_time_slice_used, 0, sizeof(mlfq_time_slice_used));
    memset(mlfq_level_assigned, 0, sizeof(mlfq_level_assigned));
}

EMSCRIPTEN_KEEPALIVE
int mlfq_get_process_level(int processId) {
    if (processId < 0) return 0;
    return mlfq_process_level[processId % MAX_PROCESSES];
}

EMSCRIPTEN_KEEPALIVE
int mlfq_select_next(Process* queue, int size, int currentTime, int numQueues) {
    if (size == 0) return -1;

    // Assign level 0 to any new process that hasn't been seen
    for (int i = 0; i < size; i++) {
        int idx = queue[i].id % MAX_PROCESSES;
        if (queue[i].arrivalTime <= currentTime &&
            queue[i].state == STATE_READY &&
            !mlfq_level_assigned[idx]) {
            mlfq_process_level[idx] = 0;
            mlfq_level_assigned[idx] = true;
        }
    }

    // Select from highest priority queue (level 0) first
    for (int level = 0; level < numQueues; level++) {
        int bestArrival = INT_MAX;
        int selectedId = -1;

        for (int i = 0; i < size; i++) {
            if (queue[i].arrivalTime <= currentTime &&
                queue[i].state == STATE_READY) {
                int pLevel = mlfq_process_level[queue[i].id % MAX_PROCESSES];
                if (pLevel == level && queue[i].arrivalTime < bestArrival) {
                    bestArrival = queue[i].arrivalTime;
                    selectedId = queue[i].id;
                }
            }
        }

        if (selectedId >= 0) {
            return selectedId;
        }
    }

    return -1;
}

EMSCRIPTEN_KEEPALIVE
bool mlfq_should_preempt(int currentProcessId, Process* queue, int size,
                          int currentTime, int numQueues, int* quantums) {
    if (currentProcessId < 0) return false;

    int currentLevel = mlfq_process_level[currentProcessId % MAX_PROCESSES];
    int quantum = quantums[currentLevel < numQueues ? currentLevel : numQueues - 1];
    int used = mlfq_time_slice_used[currentProcessId % MAX_PROCESSES];

    // Preempt if quantum exhausted
    if (used >= quantum) {
        return true;
    }

    // Preempt if a higher-priority (lower level number) process is ready
    for (int i = 0; i < size; i++) {
        if (queue[i].arrivalTime <= currentTime &&
            queue[i].state == STATE_READY &&
            queue[i].id != currentProcessId) {
            int pLevel = mlfq_process_level[queue[i].id % MAX_PROCESSES];
            if (pLevel < currentLevel) {
                return true;
            }
        }
    }

    return false;
}

EMSCRIPTEN_KEEPALIVE
void mlfq_on_tick(int processId) {
    if (processId >= 0) {
        mlfq_time_slice_used[processId % MAX_PROCESSES]++;
    }
}

EMSCRIPTEN_KEEPALIVE
void mlfq_on_context_switch(int processId, int prevUsed, int currentLevel,
                              int quantum, int numQueues) {
    if (processId < 0) return;

    int idx = processId % MAX_PROCESSES;

    // Demote if the previous quantum was exhausted
    if (prevUsed >= quantum && currentLevel < numQueues - 1) {
        mlfq_process_level[idx] = currentLevel + 1;
    }

    // Reset time slice for the new context
    mlfq_time_slice_used[idx] = 0;
}

/* ============================================================
 * Metrics Calculation
 * ============================================================
 * Calculate scheduling metrics from completed processes.
 */

typedef struct {
    float avgWaitTime;
    float avgTurnaroundTime;
    float avgResponseTime;
    float cpuUtilization;
    int contextSwitches;
    float throughput;
} Metrics;

static Metrics cachedMetrics;

EMSCRIPTEN_KEEPALIVE
void calculate_metrics(Process* completed, int completedCount,
                       int totalTime, int cpuBusyTime, int contextSwitches) {
    if (completedCount == 0) {
        cachedMetrics.avgWaitTime = 0;
        cachedMetrics.avgTurnaroundTime = 0;
        cachedMetrics.avgResponseTime = 0;
        cachedMetrics.cpuUtilization = 0;
        cachedMetrics.contextSwitches = 0;
        cachedMetrics.throughput = 0;
        return;
    }
    
    float totalWait = 0;
    float totalTurnaround = 0;
    
    for (int i = 0; i < completedCount; i++) {
        totalTurnaround += completed[i].burstTime;
    }
    
    cachedMetrics.avgWaitTime = totalWait / completedCount;
    cachedMetrics.avgTurnaroundTime = totalTurnaround / completedCount;
    cachedMetrics.avgResponseTime = 0;
    cachedMetrics.cpuUtilization = totalTime > 0 
        ? ((float)cpuBusyTime / totalTime) * 100 
        : 0;
    cachedMetrics.contextSwitches = contextSwitches;
    cachedMetrics.throughput = totalTime > 0 
        ? (float)completedCount / totalTime 
        : 0;
}

EMSCRIPTEN_KEEPALIVE
float get_avg_wait_time() { return cachedMetrics.avgWaitTime; }

EMSCRIPTEN_KEEPALIVE
float get_avg_turnaround_time() { return cachedMetrics.avgTurnaroundTime; }

EMSCRIPTEN_KEEPALIVE
float get_cpu_utilization() { return cachedMetrics.cpuUtilization; }

EMSCRIPTEN_KEEPALIVE
float get_throughput() { return cachedMetrics.throughput; }
