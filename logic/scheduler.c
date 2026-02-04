#include <stdio.h>
#include <limits.h>

#include "scheduler.h"

int n = 0;
Process processes[MAX_P];
Gantt gantt[MAX_G];
int gantt_count = 0;

void reset_scheduler(){
    gantt_count = 0;
    for(int i = 0; i < n; i++){
        processes[i].completed = 0;
        processes[i].start_time = -1;
        processes[i].rt = processes[i].bt;
        processes[i].ct = 0;
        processes[i].tat = 0;
        processes[i].wt = 0;
    }
}

void static add_gantt(int pid, int start_time, int end_time){
    gantt[gantt_count].pid = pid;
    gantt[gantt_count].start_time = start_time;
    gantt[gantt_count].end_time = end_time;
    gantt_count++;
}

void fcfs() {
    int curr_time = 0;

    //sort
    for(int i=0; i < n; i++){
        struct Process temp;
        for(int j = 0; j < n-i-1; j++){
            if(processes[j].at > processes[j+1].at){
                temp = processes[j];
                processes[j] = processes[j+1];
                processes[j+1] = temp;
            }
        }
    }
    
}