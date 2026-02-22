import React from 'react';
import { useScheduler } from '../../context/SchedulerContext';

function ComparisonMetrics() {
    const { metrics, metrics2 } = useScheduler();

    const maxWait = Math.max(parseFloat(metrics.avgWaitTime), parseFloat(metrics2.avgWaitTime), 1);
    const maxTurn = Math.max(parseFloat(metrics.avgTurnaround), parseFloat(metrics2.avgTurnaround), 1);
    const maxCS = Math.max(metrics.contextSwitches, metrics2.contextSwitches, 1);

    const getBarHeight = (value, max) => {
        return (parseFloat(value) / max) * 80;
    };

    return (
        <div className="comparison-metrics glass-panel">
            <h3>Real-Time Comparison</h3>
            <div className="metrics-charts">
                {/* Wait Time Comparison */}
                <div className="comparison-bar">
                    <div className="comparison-bar-track">
                        <div
                            className="comparison-bar-fill"
                            style={{ height: `${getBarHeight(metrics.avgWaitTime, maxWait)}px` }}
                            data-value={metrics.avgWaitTime}
                        />
                        <div
                            className="comparison-bar-fill algo-2"
                            style={{ height: `${getBarHeight(metrics2.avgWaitTime, maxWait)}px` }}
                            data-value={metrics2.avgWaitTime}
                        />
                    </div>
                    <div className="comparison-bar-label">Avg Wait Time</div>
                </div>

                {/* Turnaround Comparison */}
                <div className="comparison-bar">
                    <div className="comparison-bar-track">
                        <div
                            className="comparison-bar-fill"
                            style={{ height: `${getBarHeight(metrics.avgTurnaround, maxTurn)}px` }}
                            data-value={metrics.avgTurnaround}
                        />
                        <div
                            className="comparison-bar-fill algo-2"
                            style={{ height: `${getBarHeight(metrics2.avgTurnaround, maxTurn)}px` }}
                            data-value={metrics2.avgTurnaround}
                        />
                    </div>
                    <div className="comparison-bar-label">Avg Turnaround</div>
                </div>

                {/* Context Switches Comparison */}
                <div className="comparison-bar">
                    <div className="comparison-bar-track">
                        <div
                            className="comparison-bar-fill"
                            style={{ height: `${getBarHeight(metrics.contextSwitches, maxCS)}px` }}
                            data-value={metrics.contextSwitches}
                        />
                        <div
                            className="comparison-bar-fill algo-2"
                            style={{ height: `${getBarHeight(metrics2.contextSwitches, maxCS)}px` }}
                            data-value={metrics2.contextSwitches}
                        />
                    </div>
                    <div className="comparison-bar-label">Context Switches</div>
                </div>
            </div>
        </div>
    );
}

export default ComparisonMetrics;
