import React, { useState } from 'react';
import { useScheduler } from '../../context/SchedulerContext';
import AlgorithmButtons from './AlgorithmButtons';
import ProcessList from './ProcessList';
import AddProcessModal from './AddProcessModal';

function ControlPanel() {
    const {
        quantum,
        speed,
        currentAlgorithm,
        isRunning,
        isPaused,
        mlfqQueues,
        mlfqQuantums,
        setTimeQuantum,
        setSimulationSpeed,
        setMlfqConfig,
        start,
        togglePause,
        reset,
        addMultipleProcesses,
        clearProcesses,
        enableStressMode
    } = useScheduler();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const showRRControls = currentAlgorithm === 'rr';
    const showMLFQControls = currentAlgorithm === 'mlfq';

    const handleMlfqQuantumChange = (level, value) => {
        const updated = [...mlfqQuantums];
        updated[level] = parseInt(value);
        setMlfqConfig(mlfqQueues, updated);
    };

    return (
        <aside className="control-panel glass-panel">
            <div className="panel-header">
                <h2>Controls</h2>
            </div>

            <div className="control-section">
                <h3>Algorithm</h3>
                <AlgorithmButtons />
            </div>

            {showRRControls && (
                <div className="control-section">
                    <h3>Time Quantum</h3>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={quantum}
                            onChange={(e) => setTimeQuantum(parseInt(e.target.value))}
                            className="neon-slider"
                        />
                        <span className="slider-value">{quantum}</span>
                    </div>
                </div>
            )}

            {showMLFQControls && (
                <div className="control-section">
                    <h3>MLFQ Configuration</h3>
                    <div className="mlfq-config">
                        {mlfqQuantums.map((q, level) => (
                            <div key={level} className="mlfq-queue-config">
                                <span className="mlfq-queue-label">Q{level} Quantum</span>
                                <div className="slider-container">
                                    <input
                                        type="range"
                                        min="1"
                                        max="12"
                                        value={q}
                                        onChange={(e) => handleMlfqQuantumChange(level, e.target.value)}
                                        className="neon-slider"
                                    />
                                    <span className="slider-value">{q}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="control-section">
                <h3>Simulation Speed</h3>
                <div className="slider-container">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={speed}
                        onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
                        className="neon-slider"
                    />
                    <span className="slider-value">{speed}x</span>
                </div>
            </div>

            <div className="control-section">
                <h3>Processes</h3>
                <div className="process-controls">
                    <button className="action-btn" onClick={() => setIsModalOpen(true)}>
                        <span>+</span> Add Process
                    </button>
                    <button className="action-btn secondary" onClick={clearProcesses}>
                        Clear All
                    </button>
                </div>
                <ProcessList />
            </div>

            <div className="control-section">
                <h3>Actions</h3>
                <div className="action-buttons">
                    <button
                        className="primary-btn"
                        onClick={start}
                        disabled={isRunning && !isPaused}
                    >
                        <span className="btn-icon">▶</span>
                        <span>Start</span>
                    </button>
                    <button
                        className="primary-btn pause"
                        onClick={togglePause}
                        disabled={!isRunning}
                    >
                        <span className="btn-icon">{isPaused ? '▶' : '⏸'}</span>
                        <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>
                    <button className="primary-btn reset" onClick={reset}>
                        <span className="btn-icon">↻</span>
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            <div className="control-section">
                <button className="stress-btn" onClick={enableStressMode}>
                    🔥 Stress Mode (100+ Processes)
                </button>
            </div>

            <AddProcessModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={addMultipleProcesses}
                currentAlgorithm={currentAlgorithm}
            />
        </aside>
    );
}

export default ControlPanel;
