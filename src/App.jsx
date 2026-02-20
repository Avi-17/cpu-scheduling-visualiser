import React from 'react';
import { SchedulerProvider, useScheduler } from './context/SchedulerContext';
import Header from './components/Header/Header';
import ControlPanel from './components/ControlPanel/ControlPanel';
import SingleMode from './components/Visualization/SingleMode';
import ComparisonMode from './components/Comparison/ComparisonMode';
import MetricsPanel from './components/Metrics/MetricsPanel';
import StarsBackground from './components/StarsBackground';
import ToastContainer from './components/Toast/ToastContainer';

function AppContent() {
    const { isComparisonMode, toasts, removeToast } = useScheduler();

    return (
        <div id="app">
            <StarsBackground />
            <Header />
            <main className="main-container">
                <ControlPanel />
                <section className="visualization-area">
                    {isComparisonMode ? <ComparisonMode /> : <SingleMode />}
                </section>
                <MetricsPanel />
            </main>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}

function App() {
    return (
        <SchedulerProvider>
            <AppContent />
        </SchedulerProvider>
    );
}

export default App;
