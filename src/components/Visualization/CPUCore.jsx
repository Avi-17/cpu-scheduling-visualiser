import React from 'react';

function CPUCore({ currentProcess, isActive, cpuLabel = 'CPU', isMini = false }) {
    const getCenterStyle = () => {
        if (!currentProcess) return {};
        return {
            borderColor: currentProcess.color,
            boxShadow: `0 0 30px ${currentProcess.color}60, inset 0 0 30px ${currentProcess.color}20`
        };
    };

    return (
        <div className="cpu-core-container">
            <div className={`cpu-core ${isMini ? 'mini' : ''} ${isActive ? 'active' : ''}`}>
                <div className="cpu-ring ring-1" />
                <div className="cpu-ring ring-2" />
                {!isMini && <div className="cpu-ring ring-3" />}
                <div className="cpu-center" style={getCenterStyle()}>
                    <span className="cpu-label">{cpuLabel}</span>
                    <div
                        className="current-process"
                        style={{ color: currentProcess?.color || 'var(--text-muted)' }}
                    >
                        {currentProcess?.name || 'IDLE'}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CPUCore;
