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

    for(int i=0; i < n; i++){
        if(curr_time < processes[i].at){
            curr_time = processes[i].at;
        }

        processes[i].ct = curr_time + processes[i].bt;
        processes[i].tat = processes[i].ct - processes[i].at;
        processes[i].wt = processes[i].tat - processes[i].bt;
        add_gantt(processes[i].pid, curr_time, curr_time + processes[i].bt);
        curr_time += processes[i].bt;
        processes[i].completed = 1;
    }
}

void sjf(){
    int current_time = 0;
    int is_completed[n];
    for(int i = 0; i < n; i++){
        is_completed[i] = 0;
    }
    int completed = 0;
    
    while(completed < n){
        int idx = -1;
        int min_bt = INT_MAX;
        for(int i = 0; i < n; i++){
            if(processes[i].at <= current_time && !is_completed[i]){
                if(processes[i].bt < min_bt){
                    min_bt = processes[i].bt;
                    idx = i;
                } else if(processes[i].bt == min_bt){
                    if(processes[i].at < processes[idx].at){
                        idx = i;
                    }
                }
            }
        }
        if(idx == -1){
            current_time++;
            continue;
        }

        processes[idx].ct = current_time + processes[idx].bt;
        processes[idx].tat = processes[idx].ct - processes[idx].at;
        processes[idx].wt = processes[idx].tat - processes[idx].bt;
        add_gantt(processes[idx].pid, current_time, current_time + processes[idx].bt);
        current_time = processes[idx].ct;
        is_completed[idx] = 1;
        completed++;
    }
}