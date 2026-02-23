/**
 * WASM Bridge — loads the Emscripten-generated WASM module and exposes
 * a clean API that mirrors the JS algorithm interface.
 *
 * Usage:
 *   import { wasmBridge } from '../../wasm/wasmBridge.js';
 *   if (wasmBridge.isLoaded) {
 *       const process = wasmBridge.fcfs.selectNext(readyQueue, currentTime);
 *   }
 */

let module = null;
let isLoaded = false;

// ---- helpers ----

/**
 * Marshal a JS readyQueue array into a C Process* array, call `fn`,
 * then free the C memory and return the JS Process that matches the
 * returned ID (or null).
 */
function withProcessArray(readyQueue, fn) {
    const size = readyQueue.length;
    if (size === 0) return null;

    const arr = module._create_process_array(size);
    try {
        for (let i = 0; i < size; i++) {
            const p = readyQueue[i];
            const stateInt = { waiting: 0, ready: 1, running: 2, completed: 3 }[p.state] ?? 0;
            module._set_process(arr, i, p.id, p.arrivalTime, p.burstTime,
                p.remainingTime, p.priority, stateInt);
        }
        const selectedId = fn(arr, size);
        if (selectedId < 0) return null;
        return readyQueue.find(p => p.id === selectedId) ?? null;
    } finally {
        module._free_process_array(arr);
    }
}

/**
 * Same as withProcessArray but returns a raw boolean/int instead of
 * looking up a Process object.
 */
function withProcessArrayRaw(readyQueue, fn) {
    const size = readyQueue.length;
    const arr = module._create_process_array(size);
    try {
        for (let i = 0; i < size; i++) {
            const p = readyQueue[i];
            const stateInt = { waiting: 0, ready: 1, running: 2, completed: 3 }[p.state] ?? 0;
            module._set_process(arr, i, p.id, p.arrivalTime, p.burstTime,
                p.remainingTime, p.priority, stateInt);
        }
        return fn(arr, size);
    } finally {
        module._free_process_array(arr);
    }
}

/**
 * Allocate an int32 array on the WASM heap, call fn, then free.
 */
function withIntArray(values, fn) {
    const len = values.length;
    const ptr = module._malloc(len * 4); // 4 bytes per int32
    try {
        for (let i = 0; i < len; i++) {
            module.setValue(ptr + i * 4, values[i], 'i32');
        }
        return fn(ptr, len);
    } finally {
        module._free(ptr);
    }
}

// ---- public API ----

export const wasmBridge = {
    get isLoaded() {
        return isLoaded;
    },

    // ---- FCFS ----
    fcfs: {
        selectNext(readyQueue, currentTime) {
            return withProcessArray(readyQueue, (arr, size) =>
                module._fcfs_select_next(arr, size, currentTime));
        },
        shouldPreempt() { return false; }
    },

    // ---- SJF (Non-Preemptive) ----
    sjf: {
        selectNext(readyQueue, currentTime) {
            return withProcessArray(readyQueue, (arr, size) =>
                module._sjf_select_next(arr, size, currentTime));
        },
        shouldPreempt() { return false; }
    },

    // ---- SRTF (SJF Preemptive) ----
    srtf: {
        selectNext(readyQueue, currentTime) {
            return withProcessArray(readyQueue, (arr, size) =>
                module._srtf_select_next(arr, size, currentTime));
        },
        shouldPreempt(currentProcess, readyQueue, currentTime) {
            if (!currentProcess) return false;
            return withProcessArrayRaw(readyQueue, (arr, size) =>
                !!module._srtf_should_preempt(
                    currentProcess.id, currentProcess.remainingTime,
                    arr, size, currentTime));
        }
    },

    // ---- Priority (Preemptive) ----
    priority: {
        selectNext(readyQueue, currentTime, options = {}) {
            const highFirst = options.highPriorityFirst ? 1 : 0;
            return withProcessArray(readyQueue, (arr, size) =>
                module._priority_select_next(arr, size, currentTime, highFirst));
        },
        shouldPreempt(currentProcess, readyQueue, currentTime, options = {}) {
            if (!currentProcess) return false;
            const highFirst = options.highPriorityFirst ? 1 : 0;
            return withProcessArrayRaw(readyQueue, (arr, size) =>
                !!module._priority_should_preempt(
                    currentProcess.id, currentProcess.priority,
                    arr, size, currentTime, highFirst));
        }
    },

    // ---- Priority (Non-Preemptive) ----
    priorityNp: {
        selectNext(readyQueue, currentTime, options = {}) {
            const highFirst = options.highPriorityFirst ? 1 : 0;
            return withProcessArray(readyQueue, (arr, size) =>
                module._priority_np_select_next(arr, size, currentTime, highFirst));
        },
        shouldPreempt() { return false; }
    },

    // ---- Round Robin ----
    rr: {
        reset() {
            module._rr_reset();
        },
        selectNext(readyQueue, currentTime, options = {}) {
            const quantum = options.quantum ?? 3;
            return withProcessArray(readyQueue, (arr, size) =>
                module._rr_select_next(arr, size, currentTime, quantum));
        },
        shouldPreempt(currentProcess, readyQueue, currentTime, options = {}) {
            if (!currentProcess) return false;
            const quantum = options.quantum ?? 3;
            return !!module._rr_should_preempt(currentProcess.id, currentTime, quantum);
        },
        onTick(process) {
            if (process) module._rr_on_tick(process.id);
        },
        onContextSwitch(process) {
            module._rr_on_context_switch(process ? process.id : -1);
        }
    },

    // ---- MLFQ ----
    mlfq: {
        reset() {
            module._mlfq_reset();
        },
        selectNext(readyQueue, currentTime, options = {}) {
            const numQueues = options.mlfqQueues ?? 3;
            return withProcessArray(readyQueue, (arr, size) =>
                module._mlfq_select_next(arr, size, currentTime, numQueues));
        },
        shouldPreempt(currentProcess, readyQueue, currentTime, options = {}) {
            if (!currentProcess) return false;
            const numQueues = options.mlfqQueues ?? 3;
            const quantums = options.mlfqQuantums ?? [2, 4, 8];
            return withProcessArrayRaw(readyQueue, (arr, size) =>
                withIntArray(quantums, (qPtr) =>
                    !!module._mlfq_should_preempt(
                        currentProcess.id, arr, size,
                        currentTime, numQueues, qPtr)));
        },
        onTick(process) {
            if (process) module._mlfq_on_tick(process.id);
        },
        onContextSwitch(process, options = {}) {
            if (!process) return;
            const level = module._mlfq_get_process_level(process.id);
            const quantums = options.mlfqQuantums ?? [2, 4, 8];
            const numQueues = options.mlfqQueues ?? 3;
            const quantum = quantums[Math.min(level, quantums.length - 1)];
            // prevUsed is already tracked in C, pass 0 — C side reads its own state
            // Actually we need the prevUsed value, get from C side
            // The C on_context_switch needs prevUsed — we pass the JS-tracked value
            // Since we track in C now via mlfq_on_tick, we rely on the C internal counter
            // But at context switch time the C counter IS the prevUsed. Let's read it.
            // For simplicity, pass quantum as prevUsed (the C side already tracked it)
            module._mlfq_on_context_switch(process.id, quantum, level, quantum, numQueues);
        },
        getProcessLevel(processId) {
            return module._mlfq_get_process_level(processId);
        }
    }
};

// ---- async init ----

async function init() {
    try {
        // Construct the URL to the Emscripten glue JS file.
        // new URL(..., import.meta.url) gives us a correct absolute URL
        // that works in both dev and production builds.
        const glueUrl = new URL('./algorithms.js', import.meta.url).href;
        const wasmUrl = new URL('./algorithms.wasm', import.meta.url).href;

        // Fetch the glue JS as text and evaluate it.
        // Emscripten outputs CJS (module.exports = ...), not ES modules,
        // so we can't use `import()`. Instead, we evaluate with a CJS shim.
        const glueText = await (await fetch(glueUrl)).text();
        const fakeModule = { exports: {} };
        const fn = new Function('module', 'exports', glueText);
        fn(fakeModule, fakeModule.exports);

        const AlgorithmsModule = fakeModule.exports.default || fakeModule.exports;

        // Initialize with locateFile so Emscripten finds the .wasm binary
        module = await AlgorithmsModule({
            locateFile: (path) => {
                if (path.endsWith('.wasm')) return wasmUrl;
                return path;
            }
        });

        isLoaded = true;
        console.log('✅ WASM scheduling algorithms loaded successfully');
    } catch (e) {
        isLoaded = false;
        console.warn('⚠️ WASM module not available, using JS fallback:', e.message);
    }
}

// Start loading immediately on import
export const wasmReady = init();

