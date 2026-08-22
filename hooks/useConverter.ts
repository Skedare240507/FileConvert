import { useState } from 'react';

interface ConversionProgress {
  status: string;
  percent: number;
}

interface UseConverterOptions {
  onSuccess?: (jobId: string) => void;
  onError?: (error: Error) => void;
}

export function useConverter(options?: UseConverterOptions) {
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState<ConversionProgress>({ status: 'idle', percent: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startConversion = async (file: File, sourceType: string, targetType: string, fileCount: number = 1) => {
    setConverting(true);
    setDone(false);
    setErrorMsg(null);
    setProgress({ status: 'uploading file...', percent: 10 });

    try {
      // 1. Direct Upload to Backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sourceType', sourceType);
      formData.append('targetType', targetType);

      const uploadRes = await fetch('/api/convert/upload/direct', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || 'Failed to upload file');
      }

      const { r2Key } = await uploadRes.json();

      // 2. Create Job
      setProgress({ status: 'creating job...', percent: 40 });
      const jobRes = await fetch('/api/convert/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          r2InputKey: r2Key,
          sourceType,
          targetType,
          fileCount,
        }),
      });

      if (!jobRes.ok) {
        const err = await jobRes.json();
        throw new Error(err.error || 'Failed to create conversion job');
      }

      const { jobId } = await jobRes.json();

      // 4. SSE Progress
      setProgress({ status: 'queued', percent: 45 });
      
      await new Promise<void>((resolve, reject) => {
        const es = new EventSource(`/api/convert/jobs/${jobId}/live`);
        
        es.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.status === 'completed') {
              setProgress({ status: 'completed', percent: 100 });
              es.close();
              resolve();
            } else if (data.status === 'failed') {
              es.close();
              reject(new Error(data.error || 'Conversion worker failed'));
            } else {
              setProgress({ 
                status: data.status || 'processing', 
                percent: data.progress || 50 
              });
            }
          } catch (err) {
            console.error('SSE JSON parse error', err);
          }
        };

        es.onerror = async () => {
          es.close();
          // SSE can fire onerror on normal stream close — poll once for final status
          try {
            const statusRes = await fetch(`/api/convert/jobs/${jobId}/download`);
            if (statusRes.ok) {
              // Job completed — treat as success
              setProgress({ status: 'completed', percent: 100 });
              resolve();
            } else {
              reject(new Error('SSE connection lost. Please try again.'));
            }
          } catch {
            reject(new Error('SSE connection lost. Please try again.'));
          }
        };
      });

      // 5. Fetch signed download URL then trigger download
      setProgress({ status: 'downloading...', percent: 100 });
      setDone(true);
      const dlRes = await fetch(`/api/convert/jobs/${jobId}/download`);
      if (dlRes.ok) {
        const { downloadUrl } = await dlRes.json();
        window.location.href = downloadUrl;
      } else {
        throw new Error('Failed to get download link');
      }
      
      options?.onSuccess?.(jobId);

    } catch (err: any) {
      console.error('Conversion flow error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred.');
      options?.onError?.(err);
    } finally {
      setConverting(false);
    }
  };

  const reset = () => {
    setConverting(false);
    setDone(false);
    setProgress({ status: 'idle', percent: 0 });
    setErrorMsg(null);
  };

  return {
    converting,
    done,
    progress,
    errorMsg,
    startConversion,
    reset,
  };
}
