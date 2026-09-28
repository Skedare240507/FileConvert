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
        const rawErr = await uploadRes.text();
        let errMsg = 'Failed to upload file';
        try { errMsg = (JSON.parse(rawErr) as { error?: string }).error ?? errMsg; } catch { /* non-JSON body */ }
        throw new Error(errMsg);
      }

      const { r2Key } = JSON.parse(await uploadRes.text()) as { r2Key: string };

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
        const rawErr = await jobRes.text();
        let errMsg = 'Failed to create conversion job';
        try { errMsg = (JSON.parse(rawErr) as { error?: string }).error ?? errMsg; } catch { /* non-JSON body */ }
        throw new Error(errMsg);
      }

      const jobRaw = await jobRes.text();
      const { jobId } = JSON.parse(jobRaw) as { jobId: string };

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

  /**
   * startMultiFileConversion — for batch jobs (e.g. JPG→PDF, JPG→PPT).
   *
   * Packs all files into a ZIP archive client-side using JSZip, then
   * uploads the single ZIP to the backend with sourceType='zip'.
   * The imageWorker unpacks it and processes every image in order.
   * For a single file, falls through to the normal startConversion path.
   */
  const startMultiFileConversion = async (
    files: File[],
    sourceType: string,
    targetType: string,
  ) => {
    if (files.length === 0) return;

    // Single file — skip zipping, use the regular upload path
    if (files.length === 1) {
      return startConversion(files[0], sourceType, targetType, 1);
    }

    setConverting(true);
    setDone(false);
    setErrorMsg(null);
    setProgress({ status: 'preparing files...', percent: 5 });

    try {
      // Dynamically import JSZip (already a dependency via jszip)
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      // Add files in order with zero-padded names so the worker sorts correctly
      files.forEach((f, idx) => {
        const paddedName = `${String(idx).padStart(4, '0')}_${f.name}`;
        zip.file(paddedName, f);
      });

      setProgress({ status: 'zipping images...', percent: 15 });
      // STORE compression: images are already compressed, re-compressing wastes time
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
      const zipFile = new File([zipBlob], 'images.zip', { type: 'application/zip' });

      setProgress({ status: 'uploading files...', percent: 25 });

      const formData = new FormData();
      formData.append('file', zipFile);
      formData.append('sourceType', 'zip');
      formData.append('targetType', targetType);

      const uploadRes = await fetch('/api/convert/upload/direct', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const rawErr = await uploadRes.text();
        let errMsg = 'Failed to upload files';
        try { errMsg = (JSON.parse(rawErr) as { error?: string }).error ?? errMsg; } catch { /* */ }
        throw new Error(errMsg);
      }

      const { r2Key } = JSON.parse(await uploadRes.text()) as { r2Key: string };

      setProgress({ status: 'creating job...', percent: 40 });
      const jobRes = await fetch('/api/convert/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          r2InputKey: r2Key,
          sourceType: 'zip',
          targetType,
          fileCount: files.length,
        }),
      });

      if (!jobRes.ok) {
        const rawErr = await jobRes.text();
        let errMsg = 'Failed to create conversion job';
        try { errMsg = (JSON.parse(rawErr) as { error?: string }).error ?? errMsg; } catch { /* */ }
        throw new Error(errMsg);
      }

      const { jobId } = JSON.parse(await jobRes.text()) as { jobId: string };

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
              setProgress({ status: data.status || 'processing', percent: data.progress || 60 });
            }
          } catch (err) {
            console.error('SSE JSON parse error', err);
          }
        };
        es.onerror = async () => {
          es.close();
          try {
            const statusRes = await fetch(`/api/convert/jobs/${jobId}/download`);
            if (statusRes.ok) { setProgress({ status: 'completed', percent: 100 }); resolve(); }
            else reject(new Error('SSE connection lost. Please try again.'));
          } catch {
            reject(new Error('SSE connection lost. Please try again.'));
          }
        };
      });

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
      console.error('Multi-file conversion error:', err);
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
    startMultiFileConversion,
    reset,
  };
}
