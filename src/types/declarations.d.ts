declare module 'bullmq' {
  export class Queue<T = any> {
    constructor(name: string, opts?: any);
    add(name: string, data: T, opts?: any): Promise<any>;
    getJobCounts(...args: any[]): Promise<any>;
  }
  export class Worker<T = any> {
    constructor(name: string, processor: any, opts?: any);
    on(event: string, callback: any): void;
  }
  export type Job<T = any> = any;
  export class QueueEvents {
    constructor(name: string, opts?: any);
  }
}
declare module '@playwright/test';
