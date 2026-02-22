import React from 'react';

function ProcessNode({ process, isCompact = false }) {
    const style = process.getStyle();

    // Adjust size for compact mode
    if (isCompact) {
        style.width = '28px';
        style.height = '28px';
    }

    return (
        <div
            className={`process-node ${process.state === 'running' ? 'running' : ''}`}
            data-id={process.id}
            style={style}
            title={`${process.name}\nBurst: ${process.burstTime}\nRemaining: ${process.remainingTime}\nPriority: ${process.priority}`}
        >
            <span>{process.name}</span>
        </div>
    );
}

export default ProcessNode;
