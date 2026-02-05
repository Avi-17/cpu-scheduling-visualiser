#include <stdio.h>
#include "scheduler.h"
#include <string.h>

int main() {
    char choice[10];

    printf("--- Scheduler Logic Driver ---\n");

    // Initialize scheduler
    reset_scheduler();

    // Create sample processes
    // Pid, Arrival Time, Burst Time, Priority
    init_process(&processes[0], 1, 0, 10, 1);
    init_process(&processes[1], 2, 1, 5, 2);
    init_process(&processes[2], 3, 4, 2, 3);
    n = 3;

    printf("Processes initialized:\n");
    printf("PID\tAT\tBT\n");
    for(int i=0; i<n; i++) {
        printf("%d\t%d\t%d\n", processes[i].pid, processes[i].at, processes[i].bt);
    }

    printf("Enter algorithm (FCFS, SJF): ");
    scanf("%s", choice);

    if (strcmp(choice, "FCFS") == 0 || strcmp(choice, "fcfs") == 0) {
        printf("\nRunning FCFS...\n");
        fcfs();
    } 
    else if (strcmp(choice, "SJF") == 0 || strcmp(choice, "sjf") == 0) {
        printf("\nRunning SJF...\n");
        sjf();
    } 
    else {
        printf("\nInvalid choice! Defaulting to FCFS...\n");
        fcfs();
    }

    printf("\n--- Results ---\n");
    printf("PID\tAT\tBT\tCT\tTAT\tWT\n");
    for(int i=0; i<n; i++) {
        printf("%d\t%d\t%d\t%d\t%d\t%d\n", 
            processes[i].pid, 
            processes[i].at, 
            processes[i].bt, 
            processes[i].ct, 
            processes[i].tat, 
            processes[i].wt);
    }

    printf("\nGantt Chart:\n");
    for(int i=0; i<gantt_count; i++) {
        printf("| P%d (%d-%d) ", gantt[i].pid, gantt[i].start_time, gantt[i].end_time);
    }
    printf("|\n");

    return 0;
}
