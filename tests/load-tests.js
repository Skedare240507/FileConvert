/**
 * k6 Load Test — FileConvert
 *
 * Simulates the real two-step conversion flow:
 *   Step 1  POST /api/convert/upload/direct  (multipart file upload -> returns r2Key)
 *   Step 2  POST /api/convert/jobs           (JSON job creation  -> returns jobId)
 *   Step 3  GET  /api/convert/jobs/:jobId    (poll job status)
 *
 * Run locally (requires k6 — https://k6.io/docs/get-started/installation/):
 *   k6 run tests/load-tests.js
 *
 * Run with Docker (no local k6 install needed):
 *   docker run --rm -i --network host -v "%CD%:/app" grafana/k6 run /app/tests/load-tests.js
 *
 * Thresholds:
 *   Error rate       < 1%
 *   Upload p95       < 5 s
 *   Job-create p95   < 10 s
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// ---------------------------------------------------------------------------
// Target URL — app is running locally via `npm run dev` on port 3000
// ---------------------------------------------------------------------------
// host.docker.internal resolves to the Windows host from inside a Docker container.
// This lets k6 (running in Docker) reach the Next.js dev server on the host machine.
const BASE_URL = 'http://host.docker.internal:3000';

// ---------------------------------------------------------------------------
// Test fixture — minimal valid PDF opened in binary mode
// Place a real PDF at tests/fixtures/sample.pdf before running.
// ---------------------------------------------------------------------------
const SAMPLE_PDF_BYTES = open('./fixtures/sample.pdf', 'b');

// ---------------------------------------------------------------------------
// Custom metrics
// ---------------------------------------------------------------------------
const uploadDuration = new Trend('upload_duration_ms', true);
const jobDuration    = new Trend('job_creation_duration_ms', true);
const errorRate      = new Rate('errors');

// ---------------------------------------------------------------------------
// Scenario & threshold configuration
// ---------------------------------------------------------------------------
export const options = {
  scenarios: {
    // Warm-up: ramp 0 -> 20 VUs over 1 min, hold 3 min, ramp down 1 min
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '3m', target: 20 },
        { duration: '1m', target: 0  },
      ],
      gracefulRampDown: '30s',
      tags: { scenario: 'ramp_up' },
    },

    // Steady-state: 100 iterations/minute for 5 minutes (starts after ramp_up)
    steady: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1m',
      duration: '5m',
      preAllocatedVUs: 50,
      maxVUs: 200,
      startTime: '5m',
      tags: { scenario: 'steady' },
    },
  },

  thresholds: {
    http_req_failed:          ['rate<0.01'],    // overall HTTP error rate < 1%
    upload_duration_ms:       ['p(95)<5000'],   // upload p95 < 5 s
    job_creation_duration_ms: ['p(95)<10000'],  // job-create p95 < 10 s
    errors:                   ['rate<0.01'],    // custom error rate < 1%
  },
};

// ---------------------------------------------------------------------------
// Main VU function — executed once per virtual-user iteration
// ---------------------------------------------------------------------------
export default function () {
  // Simulate unique clients per Virtual User (VU) so testing reflects real distributed traffic
  const clientIp = `192.168.10.${__VU}`;

  // ── Step 1: Upload file to /api/convert/upload/direct ─────────────────────
  const uploadRes = http.post(
    `${BASE_URL}/api/convert/upload/direct`,
    {
      file: http.file(SAMPLE_PDF_BYTES, 'sample.pdf', 'application/pdf'),
    },
    {
      headers: { 
        Accept: 'application/json',
        'X-Forwarded-For': clientIp,
        'x-load-test-secret': 'dev-load-test-pass',
      },
      tags: { name: 'upload_direct' },
    }
  );

  uploadDuration.add(uploadRes.timings.duration);

  const uploadOk = check(uploadRes, {
    'upload: status 200':  (r) => r.status === 200,
    'upload: has r2Key':   (r) => {
      try { return Boolean(JSON.parse(r.body).r2Key); } catch (_) { return false; }
    },
  });

  if (!uploadOk) {
    errorRate.add(1);
    console.error(`[upload] FAIL status=${uploadRes.status} body=${uploadRes.body ? uploadRes.body.slice(0, 200) : ''}`);
    sleep(1);
    return;
  }

  errorRate.add(0);

  let r2Key;
  try {
    r2Key = JSON.parse(uploadRes.body).r2Key;
  } catch (_) {
    errorRate.add(1);
    return;
  }

  // ── Step 2: Create conversion job at /api/convert/jobs ────────────────────
  const jobPayload = JSON.stringify({
    sourceType: 'pdf',
    targetType: 'docx',
    r2InputKey: r2Key,
    fileCount: 1,
  });

  // Forward the anon-identity cookie that the upload response may have set
  const anonCookie = uploadRes.cookies['fc_anon_id'];
  const cookieHeader = anonCookie && anonCookie.length
    ? `fc_anon_id=${anonCookie[0].value}`
    : '';

  const jobRes = http.post(
    `${BASE_URL}/api/convert/jobs`,
    jobPayload,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Forwarded-For': clientIp,
        'x-load-test-secret': 'dev-load-test-pass',
        Cookie: cookieHeader,
      },
      tags: { name: 'create_job' },
    }
  );

  jobDuration.add(jobRes.timings.duration);

  const jobOk = check(jobRes, {
    'job: status 200':  (r) => r.status === 200,
    'job: has jobId':   (r) => {
      try { return Boolean(JSON.parse(r.body).jobId); } catch (_) { return false; }
    },
  });

  if (!jobOk) {
    errorRate.add(1);
    console.error(`[job] FAIL status=${jobRes.status} body=${jobRes.body ? jobRes.body.slice(0, 200) : ''}`);
    sleep(1);
    return;
  }

  errorRate.add(0);

  // ── Step 3: Quick status poll at /api/convert/jobs/:jobId ─────────────────
  let jobId;
  try {
    jobId = JSON.parse(jobRes.body).jobId;
  } catch (_) {
    return;
  }

  sleep(1); // give the worker a moment to pick up the job

  const statusRes = http.get(
    `${BASE_URL}/api/convert/jobs/${jobId}`,
    {
      headers: { Accept: 'application/json', Cookie: cookieHeader },
      tags: { name: 'poll_status' },
    }
  );

  check(statusRes, {
    'poll: status 200 or 202': (r) => r.status === 200 || r.status === 202,
  });

  // Realistic user pacing — pause before next conversion so server resources stay balanced
  sleep(3);
}