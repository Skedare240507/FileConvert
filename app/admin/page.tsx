'use client';

import React, { useEffect, useState } from 'react';

interface JobCounts {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

interface QueueMetrics {
  conversion: JobCounts;
  merge: JobCounts;
  scan: JobCounts;
  cleanup: JobCounts;
  timestamp: string;
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<QueueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/queue-metrics');
      if (!res.ok) throw new Error('Failed to fetch metrics');
      const data = await res.json();
      setMetrics(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const renderCard = (title: string, counts?: JobCounts) => (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '1rem' }}>
      <h3>{title}</h3>
      {counts ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><strong>Active:</strong> {counts.active}</li>
          <li><strong>Waiting:</strong> {counts.waiting}</li>
          <li><strong>Completed:</strong> {counts.completed}</li>
          <li><strong>Failed:</strong> {counts.failed}</li>
        </ul>
      ) : (
        <p>No data</p>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Admin Dashboard</h1>
      <button onClick={fetchMetrics} disabled={loading} style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}>
        {loading ? 'Refreshing...' : 'Refresh Metrics'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {renderCard('Conversion Queue', metrics.conversion)}
          {renderCard('Merge Queue', metrics.merge)}
          {renderCard('Scan Queue', metrics.scan)}
          {renderCard('Cleanup Queue', metrics.cleanup)}
        </div>
      )}
      
      {metrics && (
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
          Last updated: {new Date(metrics.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  );
}
