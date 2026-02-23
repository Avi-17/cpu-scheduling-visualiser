# CPU Scheduling Visualiser

An interactive web-based simulator built with React to visualize and compare various CPU scheduling algorithms. The application provides an intuitive interface to understand how different scheduling policies affect process execution, wait times, and CPU utilization.

## 🌟 Features

- **Multiple Algorithms Supported:**
  - First Come First Serve (FCFS)
  - Shortest Job First (SJF)
  - Shortest Remaining Time First (SRTF / SJF Preemptive)
  - Priority Scheduling (Preemptive & Non-Preemptive)
  - Round Robin (RR)
  - Multi-Level Feedback Queue (MLFQ)
- **Interactive Visualization:** Real-time Gantt chart generation and process state tracking.
- **Comparison Mode:** Run two different algorithms side-by-side with the same set of processes to compare their efficiency.
- **Dynamic Controls:** Adjust time quantum, simulation speed, and process parameters (Arrival Time, Burst Time, Priority) on the fly.
- **Stress Mode:** Generate a large number of processes to test algorithm performance under load.
- **Comprehensive Metrics:** Calculates Average Waiting Time, Turnaround Time, Response Time, CPU Utilization, and Throughput.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite
- **State Management:** React Context API
- **Styling:** Vanilla CSS (`index.css`)
- **Core Engine:** Custom Scheduling Engine with **WASM-first, JS-fallback** architecture
- **WASM Layer:** C implementations compiled to WebAssembly via Emscripten (`src/wasm/`)

## 📁 Project Structure

```text
cpu-scheduling-visualiser/
├── src/
│   ├── components/       # React UI components (Gantt Chart, Controls, Metrics)
│   ├── context/          # SchedulerContext for global state management
│   ├── scheduler/        # Core execution engine
│   │   ├── algorithms/   # WASM-first wrappers with JS fallback for each algorithm
│   │   ├── Scheduler.js  # Main simulation loop and dispatcher
│   │   └── Process.js    # Process data models
│   ├── wasm/             # WebAssembly layer
│   │   ├── algorithms.c  # All scheduling algorithms in C
│   │   ├── wasmBridge.js # JS ↔ WASM marshalling bridge
│   │   ├── algorithms.js # (generated) Emscripten glue code
│   │   └── algorithms.wasm # (generated) Compiled WASM binary
│   ├── App.jsx           # Main application wrapper
│   └── main.jsx          # Entry point
├── build-wasm.sh         # Script to compile C → WASM via Emscripten
├── algorithms/           # Legacy standalone JavaScript implementations
└── package.json          # Project metadata and scripts
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)

### Installation & Running Locally

1. **Clone the repository and navigate to the directory:**
   ```bash
   cd cpu-scheduling-visualiser
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🧠 How the Engine Works

The core of the simulator is the `Scheduler` class (in `src/scheduler/Scheduler.js`), which operates on a simulated clock tick using `requestAnimationFrame`. 

1. **Tick Execution:** At each interval, the scheduler checks for newly arrived processes.
2. **Preemption:** The active algorithm evaluates if the current process should be preempted (e.g., time quantum expired in RR).
3. **Selection:** The most eligible process in the ready queue is selected based on the algorithm's specific rules.
4. **Metrics:** The Context API listens to engine events and updates the UI in real time to reflect running, waiting, and completed processes.

## ⚡ WebAssembly (WASM) Integration

All scheduling algorithms have full C implementations in `src/wasm/algorithms.c`. The app uses a **WASM-first, JS-fallback** architecture — when compiled, the algorithms run at near-native speed via WebAssembly; without a build, the app falls back to equivalent JavaScript implementations seamlessly.

### Building WASM

**Prerequisite:** [Emscripten SDK](https://emscripten.org/) (`brew install emscripten`)

```bash
# Compile C → WASM (generates src/wasm/algorithms.js + algorithms.wasm)
./build-wasm.sh

# Or build everything for production (runs build-wasm.sh automatically)
npm run build
```

When WASM is loaded, the browser console shows `✅ WASM scheduling algorithms loaded successfully`.  
Without WASM, it shows `⚠️ WASM module not available, using JS fallback` — the app works identically either way.

## 🤝 Contributing

Contributions are welcome! If you'd like to add a new algorithm or improve the UI:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/NewAlgorithm`).
3. Commit your changes (`git commit -m 'Add NewAlgorithm'`).
4. Push to the branch (`git push origin feature/NewAlgorithm`).
5. Open a Pull Request.
