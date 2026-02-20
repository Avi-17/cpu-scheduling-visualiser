// Priority Scheduling — re-exports from split files
export { PriorityNonPreemptive } from './PriorityNonPreemptive.js';
export { PriorityPreemptive } from './PriorityPreemptive.js';

// Backward compatibility alias
import { PriorityPreemptive as _PP } from './PriorityPreemptive.js';
export const Priority = _PP;
