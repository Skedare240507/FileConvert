const fs = require('fs');
const files = [
  'backend/queue/queues.ts',
  'backend/workers/cleanupWorker.ts',
  'backend/workers/documentWorker.ts',
  'backend/workers/imageWorker.ts',
  'backend/workers/mergeWorker.ts',
  'backend/workers/ocrWorker.ts',
  'backend/workers/orchestrator.ts'
];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  fs.writeFileSync(f, content.replace(/from 'bullmq'/g, "from 'bullmq/dist/esm/index'"));
});
console.log('Fixed imports');
