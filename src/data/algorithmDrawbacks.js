// Algorithm drawbacks data map — used by toast notifications
const algorithmDrawbacks = {
    'fcfs': {
        message: 'Convoy Effect: Short processes stuck waiting behind long ones, increasing average wait time.',
        type: 'warning'
    },
    'sjf': {
        message: 'Starvation Risk: Long burst-time processes may never execute if short processes keep arriving.',
        type: 'warning'
    },
    'sjf-preemptive': {
        message: 'High Context Switching: Frequent preemption by shorter jobs increases CPU overhead.',
        type: 'warning'
    },
    'priority-np': {
        message: 'Starvation Possible: Low priority processes may wait indefinitely.',
        type: 'warning'
    },
    'priority-p': {
        message: 'Low priority processes may suffer starvation under continuous high-priority arrivals.',
        type: 'warning'
    },
    'priority': {
        message: 'Priority scheduling can cause starvation of low-priority processes.',
        type: 'warning'
    },
    'rr': {
        message: 'Frequent Context Switching: Overhead increases with small time quantum values.',
        type: 'info'
    },
    'mlfq': {
        message: 'Complex Tuning Required: Incorrect queue/quantum configuration can degrade performance.',
        type: 'info'
    }
};

export default algorithmDrawbacks;
