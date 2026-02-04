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

void init_process(Process* p, int pid, int at, int bt, int priority){
    p->pid = pid;
    p->at = at;
    p->bt = bt;
    p->priority = priority;

    p->rt = bt;
    p->start_time = -1;
    p->completed = 0;

    p->ct = 0;
    p->tat = 0;
    p->wt = 0;
}

typedef struct Gantt{
    int pid;
    int start_time;
    int end_time;
} Gantt;

void init_gantt(Gantt* g, int pid, int start_time, int end_time){
    g->pid = pid;
    g->start_time = start_time;
    g->end_time = end_time;
}

#endif