#ifndef SCHEDULER_H
#define SCHEDULER_H

#include "process.h"

extern int n;
extern Process processes[MAX_P];
extern Gantt gantt[MAX_G];
extern int gantt_count;

void reset_scheduler();
void fcfs();
void srtf();
void sjf();
void compute_metric();
void write_output(const char* filename);


#endif