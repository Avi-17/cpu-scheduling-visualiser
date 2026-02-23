# CPU Scheduling Visualiser

This project is a web-based interactive tool developed using React and Vite, designed to visualize and understand the behavior of various CPU scheduling algorithms. It includes implementations JavaScript (for web-based visualization).

## Project Structure

```
cpu-scheduling-visualiser/
├── algorithms/       # JavaScript implementations of scheduling algorithms
│   ├── FCFS.js       # First Come First Serve
│   ├── Priority.js   # Priority Scheduling
│   ├── RoundRobin.js # Round Robin
│   ├── SJF.js        # Shortest Job First
│   ├── SRTF.js       # Shortest Remaining Time First
│   └── MLFQ.js       # Multi-Level Feedback Queue
└── src/              # React frontend source code
    ├── components/   # UI components
    ├── hooks/        # Custom React hooks
    ├── context/      # Global state management
    ├── data/         # Default data models
    ├── scheduler/    # Frontend algorithm integrations
    ├── index.css     # Global styles
    ├── App.jsx       # Main application component
    └── main.jsx      # Entry point
```

## Algorithms Implemented

### 1. First Come First Serve (FCFS)
- **Description**: Processes are executed in the order they arrive in the ready queue.
- **Characteristics**: Non-preemptive, simple to implement, but can lead to the convoy effect.

### 2. Shortest Job First (SJF)
- **Description**: Selects the process with the smallest execution time (burst time).
- **Characteristics**: Non-preemptive. Minimizes average waiting time but requires knowing the burst time in advance.

### 3. Shortest Remaining Time First (SRTF)
- **Description**: Preemptive version of SJF. Selects the process with the smallest remaining execution time.
- **Characteristics**: Preemptive, optimal for average waiting time, but requires tracking remaining time and can lead to starvation.

### 4. Priority Scheduling
- **Description**: Processes are assigned priorities, and the CPU is allocated to the process with the highest priority.
- **Characteristics**: Can be preemptive or non-preemptive. Risk of starvation for low-priority processes.

### 5. Round Robin (RR)
- **Description**: Each process is assigned a fixed time unit (quantum). The scheduler cycles through the ready queue.
- **Characteristics**: Preemptive, fair allocation of CPU, designed for time-sharing systems.

### 6. Multi-Level Feedback Queue (MLFQ)
- **Description**: A complex scheduling structure where processes are dynamically moved between queues of varying priorities based on their CPU usage behavior.
- **Characteristics**: Preemptive, balances response time and throughput by penalizing long-running CPU-bound processes and prioritizing short, interactive ones.

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher recommended)

### Running the Web Visualiser

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the local URL provided by Vite.


## Evaluation Metrics Tracking

The visualiser tracks and displays the following core metrics for every process:
- **Completion Time (CT):** The exact time the process finishes execution.
- **Turnaround Time (TAT):** The total time taken from arrival to completion.
- **Waiting Time (WT):** The time a process spends waiting in the ready queue.

## Contributing

Feel free to fork the repository and submit pull requests to add more scheduling algorithms, improve the existing implementations, or enhance the React frontend visualization features.
