#!/bin/bash
# Build script for compiling C algorithms to WebAssembly
# Requires Emscripten SDK to be installed and activated

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_DIR="$SCRIPT_DIR/src/wasm"
OUTPUT_DIR="$SCRIPT_DIR/src/wasm"

echo "🔧 Compiling C algorithms to WebAssembly..."

# Check if emcc is available
if ! command -v emcc &> /dev/null; then
    echo "❌ Error: Emscripten (emcc) not found!"
    echo ""
    echo "Please install Emscripten SDK:"
    echo "  brew install emscripten"
    echo ""
    echo "Or manually:"
    echo "  git clone https://github.com/emscripten-core/emsdk.git"
    echo "  cd emsdk && ./emsdk install latest && ./emsdk activate latest"
    echo "  source ./emsdk_env.sh"
    exit 1
fi

# Compile with Emscripten
emcc "$SRC_DIR/algorithms.c" \
    -o "$OUTPUT_DIR/algorithms.js" \
    -s WASM=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME="AlgorithmsModule" \
    -s EXPORTED_FUNCTIONS='[
        "_create_process_array",
        "_free_process_array",
        "_set_process",
        "_fcfs_select_next",
        "_fcfs_should_preempt",
        "_sjf_select_next",
        "_sjf_should_preempt",
        "_srtf_select_next",
        "_srtf_should_preempt",
        "_priority_select_next",
        "_priority_should_preempt",
        "_priority_np_select_next",
        "_priority_np_should_preempt",
        "_rr_reset",
        "_rr_select_next",
        "_rr_should_preempt",
        "_rr_on_tick",
        "_rr_on_context_switch",
        "_mlfq_reset",
        "_mlfq_get_process_level",
        "_mlfq_select_next",
        "_mlfq_should_preempt",
        "_mlfq_on_tick",
        "_mlfq_on_context_switch",
        "_calculate_metrics",
        "_get_avg_wait_time",
        "_get_avg_turnaround_time",
        "_get_cpu_utilization",
        "_get_throughput"
    ]' \
    -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap", "getValue", "setValue"]' \
    -s ALLOW_MEMORY_GROWTH=1 \
    -O2

echo "✅ WebAssembly compilation successful!"
echo "   Output: $OUTPUT_DIR/algorithms.js"
echo "   Output: $OUTPUT_DIR/algorithms.wasm"
