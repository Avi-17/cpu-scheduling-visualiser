// Process class with visual properties
export class Process {
  static idCounter = 0;
  static colors = [
    '#00f0ff', // cyan
    '#a855f7', // purple
    '#22c55e', // green
    '#f97316', // orange
    '#ec4899', // pink
    '#3b82f6', // blue
    '#eab308', // yellow
    '#ef4444', // red
  ];

  constructor(options = {}) {
    this.id = options.id ?? Process.idCounter++;
    this.name = options.name ?? `P${this.id}`;
    this.arrivalTime = options.arrivalTime ?? 0;
    this.burstTime = options.burstTime ?? Math.floor(Math.random() * 8) + 2;
    this.priority = options.priority ?? Math.floor(Math.random() * 10) + 1;
    
    // Runtime state
    this.remainingTime = this.burstTime;
    this.startTime = null;
    this.completionTime = null;
    this.waitingTime = 0;
    this.responseTime = null;
    
    // State
    this.state = 'waiting'; // waiting, ready, running, completed
    
    // Visual properties
    this.color = options.color ?? Process.colors[this.id % Process.colors.length];
    this.size = this.calculateSize();
    this.auraIntensity = this.calculateAuraIntensity();
    
    // Animation state
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.element = null;
  }

  calculateSize() {
    // Size proportional to burst time (30-70px range)
    const minSize = 35;
    const maxSize = 60;
    const normalized = Math.min(this.burstTime / 10, 1);
    return minSize + normalized * (maxSize - minSize);
  }

  calculateAuraIntensity() {
    // Aura intensity based on priority (0.2 - 1.0)
    return 0.2 + (this.priority / 10) * 0.8;
  }

  reset() {
    this.remainingTime = this.burstTime;
    this.startTime = null;
    this.completionTime = null;
    this.waitingTime = 0;
    this.responseTime = null;
    this.state = 'waiting';
  }

  clone() {
    const cloned = new Process({
      id: this.id,
      name: this.name,
      arrivalTime: this.arrivalTime,
      burstTime: this.burstTime,
      priority: this.priority,
      color: this.color
    });
    return cloned;
  }

  // Calculate metrics
  getTurnaroundTime() {
    if (this.completionTime === null) return null;
    return this.completionTime - this.arrivalTime;
  }

  getWaitingTime() {
    const tat = this.getTurnaroundTime();
    if (tat === null) return null;
    return tat - this.burstTime;
  }

  getResponseTime() {
    return this.responseTime;
  }

  // Visual style generation
  getStyle() {
    return {
      width: `${this.size}px`,
      height: `${this.size}px`,
      background: `radial-gradient(circle at 30% 30%, ${this.color}, ${this.adjustColor(this.color, -40)})`,
      boxShadow: `0 0 ${20 * this.auraIntensity}px ${this.color}, 
                  0 0 ${40 * this.auraIntensity}px ${this.color}40,
                  inset 0 0 20px ${this.color}40`,
      border: `2px solid ${this.color}`,
      animationDelay: `${Math.random() * 2}s`
    };
  }

  adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  }
}

// Process factory for creating sample processes
export function createSampleProcesses(count = 5) {
  Process.idCounter = 0;
  const processes = [];
  
  for (let i = 0; i < count; i++) {
    processes.push(new Process({
      arrivalTime: Math.floor(Math.random() * 5),
      burstTime: Math.floor(Math.random() * 8) + 2,
      priority: Math.floor(Math.random() * 10) + 1
    }));
  }
  
  // Sort by arrival time
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  
  return processes;
}

// Create stress test processes
export function createStressProcesses(count = 100) {
  Process.idCounter = 0;
  const processes = [];
  
  for (let i = 0; i < count; i++) {
    processes.push(new Process({
      arrivalTime: Math.floor(Math.random() * 20),
      burstTime: Math.floor(Math.random() * 5) + 1,
      priority: Math.floor(Math.random() * 10) + 1
    }));
  }
  
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  
  return processes;
}
