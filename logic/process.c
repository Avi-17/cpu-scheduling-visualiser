#include "process.h"

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

void init_gantt(Gantt* g, int pid, int start_time, int end_time){
    g->pid = pid;
    g->start_time = start_time;
    g->end_time = end_time;
}
