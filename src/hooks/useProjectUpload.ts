import { useState, useCallback } from 'react';
import type { UploadResponse } from '@/types/api';

interface UseProjectUploadReturn {
  upload: (file: File, name?: string) => Promise<UploadResponse | null>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

export function useProjectUpload(): UseProjectUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(async (file: File, name?: string): Promise<UploadResponse | null> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate upload progress for demo
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      clearInterval(progressInterval);
      setProgress(100);

      // Mock response
      const response: UploadResponse = {
        projectId: `proj-${Date.now()}`,
        taskId: `task-${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      };

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { upload, isUploading, progress, error, reset };
}
