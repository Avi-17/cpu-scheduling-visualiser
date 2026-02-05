#ifndef PROCESS_H
#define PROCESS_H

#define MAX_P 100
#define MAX_G 500

typedef struct Process{
    //static props
    int pid;
    int at;
    int bt;
    int priority;

    //dynamic props
    int rt;
    int start_time;
    int completed;      //boolean flag

    //metrics
    int ct;
    int tat;
    int wt;
} Process;

void init_process(Process* p, int pid, int at, int bt, int priority);

typedef struct Gantt{
    int pid;
    int start_time;
    int end_time;
} Gantt;

void init_gantt(Gantt* g, int pid, int start_time, int end_time);

#endif