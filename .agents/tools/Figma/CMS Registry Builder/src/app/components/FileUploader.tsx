import { useState, useCallback } from 'react';
import { Upload, FolderOpen } from 'lucide-react';

interface FileUploaderProps {
  onFilesAdded: (files: File[]) => void;
}

export function FileUploader({ onFilesAdded }: FileUploaderProps) {
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesAdded(files);
      e.target.value = '';
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        /\.(txt|md|json|csv|xml|html|css|js|ts|tsx|jsx|yaml|yml|log)$/i.test(f.name)
      );
      if (files.length > 0) onFilesAdded(files);
    },
    [onFilesAdded]
  );

  return (
    <label
      htmlFor="file-upload"
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className="block cursor-pointer rounded-lg transition-all duration-200"
      style={{
        border: dragging
          ? '1.5px dashed #6366f1'
          : '1.5px dashed #2a2d3e',
        background: dragging
          ? 'rgba(99,102,241,0.08)'
          : 'rgba(30,35,64,0.3)',
        boxShadow: dragging ? '0 0 16px rgba(99,102,241,0.2)' : 'none',
        padding: '14px 10px',
      }}
    >
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{
            background: dragging ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
          }}
        >
          {dragging ? (
            <FolderOpen className="w-4 h-4" style={{ color: '#6366f1' }} />
          ) : (
            <Upload className="w-4 h-4" style={{ color: '#6366f1' }} />
          )}
        </div>
        <span className="text-xs font-medium text-center" style={{ color: '#94a3b8' }}>
          {dragging ? 'Drop files here' : 'Drop files or click to browse'}
        </span>
        <span className="text-xs" style={{ color: '#475569' }}>
          txt, md, json, csv, js, ts…
        </span>
      </div>
      <input
        id="file-upload"
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        accept=".txt,.md,.json,.csv,.xml,.html,.css,.js,.ts,.tsx,.jsx,.yaml,.yml,.log"
      />
    </label>
  );
}
