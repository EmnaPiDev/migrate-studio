import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileArchive, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface DragDropUploaderProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  progress: number;
}

export default function DragDropUploader({
  onUpload,
  isUploading,
  progress,
}: DragDropUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.zip') || file.type === 'application/zip')) {
        setSelectedFile(file);
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isUploading ? handleClick : undefined}
        className={cn(
          'drop-zone p-12 cursor-pointer group',
          isDragging && 'drop-zone-active',
          isUploading && 'cursor-default'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip,application/zip"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-16 h-16 text-primary" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground">
                  Uploading {selectedFile?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(progress)}% complete
                </p>
              </div>
              <Progress value={progress} className="w-64 h-2" />
            </motion.div>
          ) : selectedFile ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <FileArchive className="w-16 h-16 text-primary" />
              <div className="flex items-center gap-2">
                <span className="text-foreground font-medium">{selectedFile.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="p-1 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <motion.div
                className="relative"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="p-6 rounded-2xl bg-secondary/50 group-hover:bg-primary/10 transition-colors">
                  <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <motion.div
                  className="absolute -inset-2 rounded-3xl border border-primary/30"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold text-foreground">
                  Drop your AngularJS project here
                </p>
                <p className="text-muted-foreground">
                  or click to browse • ZIP files only
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileArchive className="w-4 h-4" />
                <span>Supports .zip archives up to 100MB</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
