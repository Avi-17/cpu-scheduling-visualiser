# C/WebAssembly Setup Guide for CPU Scheduler Simulator

## Why C and WebAssembly?

### The Problem with JavaScript Algorithms
Your current scheduling algorithms (FCFS, SJF, Priority, Round Robin) are written in JavaScript. While this works, JavaScript has limitations:
- **No true multithreading** for compute-heavy operations
- **Garbage collection pauses** can cause UI stutters during stress tests
- **Slower execution** compared to compiled languages

### The WebAssembly Solution
WebAssembly (WASM) allows us to:
1. **Write algorithms in C** - a compiled, systems-level language
2. **Compile to binary** - runs at near-native speed in browsers
3. **Keep the UI in React** - best of both worlds

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
├─────────────────────────────────────────────────────┤
│  React UI (JavaScript)                              │
│     ↓ calls                                         │
│  WebAssembly Module (compiled from C)               │
│     - fcfs_select_next()                            │
│     - sjf_select_next()                             │
│     - priority_select_next()                        │
│     - round_robin_select_next()                     │
│     ↓ returns                                       │
│  React receives result, updates state               │
└─────────────────────────────────────────────────────┘
```

---

## Requirements

### 1. Emscripten SDK (Required for Development)

Emscripten is the compiler that converts C code to WebAssembly.

**Installation on macOS:**
```bash
# Install via Homebrew
brew install emscripten

# Or manual installation:
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

**Verify installation:**
```bash
emcc --version
# Should show: emcc (Emscripten gcc/clang-like replacement) X.X.X
```

### 2. Node.js (Already installed)
You already have this for running Vite.

### 3. No Additional Runtime Requirements
Once compiled, the `.wasm` file runs in any modern browser—no extra installation needed for end users.

---

## How It Works

### Build Process
```
algorithms.c  ──→  emcc compiler  ──→  algorithms.wasm + algorithms.js
   (source)                              (binary)        (JS glue code)
```

### Runtime Flow
1. React app loads `algorithms.js` (auto-generated glue code)
2. Glue code loads `algorithms.wasm` binary
3. JavaScript calls exported C functions like regular JS functions
4. WebAssembly executes at near-native speed
5. Results return to JavaScript/React

### Example: Calling C from React
```jsx
// In React component
import { useEffect, useState } from 'react';

function Scheduler() {
  const [wasm, setWasm] = useState(null);
  
  useEffect(() => {
    // Load WASM module
    import('../wasm/algorithms.js').then(module => {
      module.default().then(setWasm);
    });
  }, []);
  
  const selectNextProcess = (queue, time) => {
    if (!wasm) return null;
    
    // Call C function directly!
    const selectedId = wasm._fcfs_select_next(
      queuePtr, queue.length, time
    );
    return selectedId;
  };
}
```

---

## File Structure After Setup

```
src/
├── wasm/
│   ├── algorithms.c          # Your C source code
│   ├── algorithms.js         # Generated JS glue (gitignored)
│   └── algorithms.wasm       # Generated binary (gitignored)
├── scheduler/
│   ├── Scheduler.js          # Uses WASM for algorithm selection
│   └── Process.js            # Process model (stays JS)
└── components/               # React UI components
```

---

## Build Commands

These will be added to `package.json`:

| Command | Description |
|---------|-------------|
| `npm run build:wasm` | Compile C to WebAssembly |
| `npm run dev` | Start dev server (auto-recompiles WASM) |
| `npm run build` | Production build with WASM |

---

## Why Not Just Keep JavaScript?

| Aspect | JavaScript | C/WebAssembly |
|--------|------------|---------------|
| **Speed** | ~10x slower for math | Near-native performance |
| **Memory** | GC pauses | Manual, predictable |
| **Stress test (100+ processes)** | May stutter | Smooth |
| **Learning value** | Already know it | Learn systems programming |

For this simulator, the performance difference is minor with 5-10 processes. But with 100+ processes in stress mode, WebAssembly provides noticeably smoother animation.

---

## Next Steps

1. **Install Emscripten** (see commands above)
2. I'll create `src/wasm/algorithms.c` with the scheduling algorithms
3. I'll set up the build scripts in `package.json`
4. I'll create React components that call the WASM functions

Ready to proceed?
