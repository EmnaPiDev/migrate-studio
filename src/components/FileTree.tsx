import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, FileCode, FileJson, FileCog } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  hasDiff?: boolean;
}

interface FileTreeProps {
  files: FileNode[];
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
}

const getFileIcon = (name: string, isOpen?: boolean) => {
  if (name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.js') || name.endsWith('.jsx')) {
    return FileCode;
  }
  if (name.endsWith('.json')) {
    return FileJson;
  }
  if (name.endsWith('.config.js') || name.endsWith('.config.ts')) {
    return FileCog;
  }
  return File;
};

interface TreeNodeProps {
  node: FileNode;
  level: number;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
}

function TreeNode({ node, level, selectedPath, onSelectFile }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(level < 2);
  const isSelected = selectedPath === node.path;
  const isDirectory = node.type === 'directory';

  const handleClick = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(node.path);
    }
  };

  const FileIcon = isDirectory
    ? isOpen
      ? FolderOpen
      : Folder
    : getFileIcon(node.name);

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors text-left',
          isSelected
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
          node.hasDiff && 'border-l-2 border-warning'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {isDirectory && (
          <span className="w-4 h-4 flex items-center justify-center">
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </span>
        )}
        {!isDirectory && <span className="w-4" />}
        <FileIcon
          className={cn(
            'w-4 h-4 flex-shrink-0',
            isDirectory ? 'text-warning' : 'text-muted-foreground'
          )}
        />
        <span className="truncate">{node.name}</span>
        {node.hasDiff && (
          <span className="ml-auto text-xs text-warning bg-warning/10 px-1.5 py-0.5 rounded">
            diff
          </span>
        )}
      </button>

      <AnimatePresence>
        {isDirectory && isOpen && node.children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                level={level + 1}
                selectedPath={selectedPath}
                onSelectFile={onSelectFile}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FileTree({ files, selectedPath, onSelectFile }: FileTreeProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
        <Folder className="w-10 h-10 mb-2 opacity-30" />
        <p className="text-sm">No files uploaded</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin py-2">
      {files.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          level={0}
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  );
}
