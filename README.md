# CPU Scheduling Visualiser

This project implements various CPU scheduling algorithms to visualize and understand their behavior. It includes implementations in both JavaScript (for web-based visualization) and C (for core logic verification).

## Project Structure

```
cpu-scheduling-visualiser/
├── algorithms/       # JavaScript implementations of scheduling algorithms
│   ├── FCFS.js       # First Come First Serve
│   ├── Priority.js   # Priority Scheduling
│   ├── RoundRobin.js # Round Robin
│   └── SJF.js        # Shortest Job First
└── logic/            # C implementations and drivers
    ├── driver.c      # Driver program to run the scheduler
    ├── process.c     # Process and Gantt chart data structure implementations
    ├── process.h     # Header file for process structures
    ├── scheduler.c   # Core scheduler logic (FCFS implementation)
    └── scheduler.h   # Header file for scheduler functions
```

## Algorithms Implemented

### 1. First Come First Serve (FCFS)
- **Description**: Processes are executed in the order they arrive in the ready queue.
- **Characteristics**: Non-preemptive, simple to implement, but can lead to the convoy effect.

### 2. Shortest Job First (SJF)
- **Description**: Selects the process with the smallest execution time (burst time).
- **Characteristics**: Minimizes average waiting time but requires knowing the burst time in advance.

### 3. Priority Scheduling
- **Description**: Processes are assigned priorities, and the CPU is allocated to the process with the highest priority.
- **Characteristics**: Can be preemptive or non-preemptive. Risk of starvation for low-priority processes.

### 4. Round Robin (RR)
- **Description**: Eeach process is assigned a fixed time unit (quantum). The scheduler cycles through the ready queue.
- **Characteristics**: Preemptive, fair allocation of CPU, designed for time-sharing systems.

## Getting Started

### Prerequisites

- **C Compiler**: GCC or Clang for running the C logic.
- **Node.js** (Optional): If you wish to run the JavaScript algorithms in a backend environment, though they are designed as ES6 modules.

### Running the C Implementation

The `logic` directory contains a C implementation of the scheduling logic, specifically FCFS.

1. Navigate to the `logic` directory:
   ```bash
   cd logic
   ```

2. Compile the source files:
   ```bash
   gcc driver.c scheduler.c process.c -o scheduler_runner
   ```

3. Run the executable:
   ```bash
   ./scheduler_runner
   ```

   **Output Example:**
   ```
   --- Scheduler Logic Driver ---
   Processes initialized:
   PID     AT      BT
   1       0       10
   2       0       5
   3       0       8

   Running FCFS...

   --- Results ---
   PID     AT      BT      CT      TAT     WT
   1       0       10      10      10      0
   2       0       5       15      15      10
   3       0       8       23      23      15
   ...
   ```

### Using the JavaScript Algorithms

The algorithms in the `algorithms` directory are exported as ES6 objects. You can import them into your JavaScript project:

```javascript
import { FCFS } from './algorithms/FCFS.js';

// Use the algorithm
const nextProcess = FCFS.selectNext(readyQueue, currentTime);
```

Each algorithm object provides:
- `name`: Human-readable name.
- `shortName`: Abbreviated name.
- `preemptive`: Boolean indicating if the algorithm is preemptive.
- `selectNext(readyQueue, currentTime, options)`: Function to determine the next process to run.
- `shouldPreempt(currentProcess, readyQueue, currentTime)`: Function to check if the current process should be preempted.

## Contributing

Feel free to add more scheduling algorithms or improve the existing implementations.
