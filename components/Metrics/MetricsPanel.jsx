import React from 'react';
import { useScheduler } from '../../context/SchedulerContext';

function MetricsPanel() {
    const { metrics, isComparisonMode } = useScheduler();

    // Calculate gauge offset
    const utilization = parseFloat(metrics.cpuUtilization);
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (utilization / 100) * circumference;

    // Get utilization color
    const getUtilizationColor = (util) => {
        if (util < 30) return '#ef4444';
        if (util < 60) return '#f97316';
        if (util < 80) return '#eab308';
        return '#22c55e';
    };

    const maxTime = 20;

    if (isComparisonMode) {
        return null; // Comparison mode has its own metrics
    }

    return (
        <aside className="metrics-panel glass-panel">
            <div className="panel-header">
                <h2>Metrics</h2>
            </div>

            <div className="metric-card">
                <div className="metric-label">CPU Utilization</div>
                <div className="radial-gauge">
                    <svg viewBox="0 0 100 100">
                        <circle className="gauge-bg" cx="50" cy="50" r="40" />
                        <circle
                            className="gauge-fill"
                            cx="50"
                            cy="50"
                            r="40"
                            style={{
                                strokeDashoffset: offset,
                                stroke: getUtilizationColor(utilization)
                            }}
                        />
                    </svg>
                    <div className="gauge-value">{metrics.cpuUtilization}%</div>
                </div>
            </div>

            <div className="metric-card">
                <div className="metric-label">Avg Waiting Time</div>
                <div className="metric-value">{metrics.avgWaitTime}</div>
                <div className="metric-bar">
                    <div
                        className="bar-fill wait-bar"
                        style={{ width: `${Math.min(parseFloat(metrics.avgWaitTime) / maxTime * 100, 100)}%` }}
                    />
                </div>
            </div>

            <div className="metric-card">
                <div className="metric-label">Avg Turnaround Time</div>
                <div className="metric-value">{metrics.avgTurnaround}</div>
                <div className="metric-bar">
                    <div
                        className="bar-fill turnaround-bar"
                        style={{ width: `${Math.min(parseFloat(metrics.avgTurnaround) / maxTime * 100, 100)}%` }}
                    />
                </div>
            </div>

            <div className="metric-card">
                <div className="metric-label">Avg Response Time</div>
                <div className="metric-value">{metrics.avgResponse}</div>
                <div className="metric-bar">
                    <div
                        className="bar-fill response-bar"
                        style={{ width: `${Math.min(parseFloat(metrics.avgResponse) / maxTime * 100, 100)}%` }}
                    />
                </div>
            </div>

            <div className="metric-card">
                <div className="metric-label">Context Switches</div>
                <div className="metric-value large">{metrics.contextSwitches}</div>
            </div>

            <div className="metric-card">
                <div className="metric-label">Throughput</div>
                <div className="metric-value">{metrics.throughput}</div>
                <div className="metric-unit">processes/unit</div>
            </div>
        </aside>
    );
}

export default MetricsPanel;
