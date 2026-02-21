import React from 'react';
import { useScheduler } from '../../context/SchedulerContext';

function Header() {
    const { isComparisonMode, toggleComparisonMode } = useScheduler();

    return (
        <header className="header">
            <div className="logo">
                <span className="logo-icon">⚡</span>
                <span className="logo-text">CPU<span className="highlight">Scheduler</span></span>
            </div>
            <div className="header-controls">
                <button
                    className={`mode-toggle ${isComparisonMode ? 'active' : ''}`}
                    onClick={toggleComparisonMode}
                >
                    <span className="toggle-icon">◧</span>
                    <span>Comparison Mode</span>
                </button>
            </div>
        </header>
    );
}

export default Header;
