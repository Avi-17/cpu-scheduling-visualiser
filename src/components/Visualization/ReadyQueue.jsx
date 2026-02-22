import React from 'react';
import ProcessNode from './ProcessNode';

function ReadyQueue({ queue }) {
    const isCompact = queue.length > 10;

    return (
        <div className="ready-queue">
            <div className="queue-label">Ready Queue</div>
            <div className={`queue-container ${isCompact ? 'compact' : ''}`}>
                {queue.map((process, index) => (
                    <ProcessNode
                        key={process.id}
                        process={process}
                        isCompact={isCompact}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    />
                ))}
            </div>
        </div>
    );
}

export default ReadyQueue;
