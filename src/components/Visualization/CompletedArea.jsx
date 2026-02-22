import React from 'react';
import ProcessNode from './ProcessNode';

function CompletedArea({ completedProcesses }) {
    const isCompact = completedProcesses.length > 10;

    return (
        <div className="completed-area">
            <div className="queue-label">Completed</div>
            <div className={`completed-container ${isCompact ? 'compact' : ''}`}>
                {completedProcesses.map(process => (
                    <ProcessNode
                        key={process.id}
                        process={process}
                        isCompact={isCompact}
                    />
                ))}
            </div>
        </div>
    );
}

export default CompletedArea;
