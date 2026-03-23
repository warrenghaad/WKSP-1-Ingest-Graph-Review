import { Trash2, Link as LinkIcon, PanelLeftOpen, PanelRightOpen, FileCode, FileText as FileTextIcon, FileJson, Hash } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

export interface FileItem {
  id: string;
  name: string;
  content: string;
  linkedTo: string[];
  metadata?: Record<string, string>;
}

interface FileListProps {
  files: FileItem[];
  selectedFiles: [string | null, string | null];
  onSelectFile: (fileId: string, pane: 0 | 1) => void;
  onDeleteFile: (fileId: string) => void;
  onLinkFiles: (fileId: string) => void;
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['js', 'ts', 'tsx', 'jsx'].includes(ext || ''))
    return <FileCode className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />;
  if (['json', 'yaml', 'yml'].includes(ext || ''))
    return <FileJson className="w-3.5 h-3.5" style={{ color: '#10b981' }} />;
  if (['md', 'txt'].includes(ext || ''))
    return <FileTextIcon className="w-3.5 h-3.5" style={{ color: '#06b6d4' }} />;
  if (['csv', 'xml'].includes(ext || ''))
    return <Hash className="w-3.5 h-3.5" style={{ color: '#8b5cf6' }} />;
  return <FileTextIcon className="w-3.5 h-3.5" style={{ color: '#64748b' }} />;
}

function getExtBadgeColor(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['js', 'ts', 'tsx', 'jsx'].includes(ext || '')) return '#f59e0b';
  if (['json', 'yaml', 'yml'].includes(ext || '')) return '#10b981';
  if (['md', 'txt'].includes(ext || '')) return '#06b6d4';
  if (['csv', 'xml'].includes(ext || '')) return '#8b5cf6';
  return '#64748b';
}

export function FileList({
  files,
  selectedFiles,
  onSelectFile,
  onDeleteFile,
  onLinkFiles,
}: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 px-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <FileTextIcon className="w-5 h-5" style={{ color: '#6366f1' }} />
        </div>
        <div className="text-center">
          <p className="text-xs font-medium" style={{ color: '#475569' }}>No files yet</p>
          <p className="text-xs mt-0.5" style={{ color: '#334155' }}>Upload files above to get started</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        {files.map((file) => {
          const isLeft = selectedFiles[0] === file.id;
          const isRight = selectedFiles[1] === file.id;
          const isSelected = isLeft || isRight;
          const ext = file.name.split('.').pop()?.toLowerCase() || '';
          const extColor = getExtBadgeColor(file.name);

          return (
            <div
              key={file.id}
              className="rounded-lg transition-all duration-150 group"
              style={{
                background: isSelected ? 'rgba(99,102,241,0.08)' : 'rgba(30,35,64,0.3)',
                border: isLeft
                  ? '1px solid rgba(99,102,241,0.5)'
                  : isRight
                  ? '1px solid rgba(6,182,212,0.5)'
                  : '1px solid rgba(30,35,64,0.8)',
              }}
            >
              {/* Selection indicator bar */}
              {isSelected && (
                <div
                  className="h-0.5 rounded-t-lg"
                  style={{
                    background: isLeft
                      ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                      : 'linear-gradient(90deg, #06b6d4, #0ea5e9)',
                  }}
                />
              )}

              <div className="px-2.5 py-2">
                {/* File name row */}
                <div className="flex items-center gap-2 mb-1.5">
                  {getFileIcon(file.name)}
                  <span
                    className="text-xs flex-1 truncate font-medium"
                    style={{ color: isSelected ? '#e2e8f0' : '#94a3b8' }}
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <span
                    className="text-xs px-1 rounded uppercase font-mono"
                    style={{
                      background: `${extColor}15`,
                      color: extColor,
                      fontSize: '9px',
                    }}
                  >
                    {ext || 'file'}
                  </span>
                </div>

                {/* Info row */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs" style={{ color: '#334155', fontSize: '10px' }}>
                    {(file.content.length / 1024).toFixed(1)}kb
                  </span>
                  {file.linkedTo.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{ background: '#06b6d4' }}
                      />
                      <span style={{ color: '#06b6d4', fontSize: '10px' }}>
                        {file.linkedTo.length} link{file.linkedTo.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {isLeft && (
                    <span
                      className="ml-auto text-xs px-1.5 py-0.5 rounded font-semibold"
                      style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', fontSize: '9px' }}
                    >
                      L
                    </span>
                  )}
                  {isRight && (
                    <span
                      className="ml-auto text-xs px-1.5 py-0.5 rounded font-semibold"
                      style={{ background: 'rgba(6,182,212,0.2)', color: '#22d3ee', fontSize: '9px' }}
                    >
                      R
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <ActionBtn
                    title="Open Left"
                    onClick={() => onSelectFile(file.id, 0)}
                    color="#6366f1"
                    active={isLeft}
                  >
                    <PanelLeftOpen className="w-3 h-3" />
                  </ActionBtn>
                  <ActionBtn
                    title="Open Right"
                    onClick={() => onSelectFile(file.id, 1)}
                    color="#06b6d4"
                    active={isRight}
                  >
                    <PanelRightOpen className="w-3 h-3" />
                  </ActionBtn>
                  <ActionBtn
                    title="Manage Links"
                    onClick={() => onLinkFiles(file.id)}
                    color="#8b5cf6"
                  >
                    <LinkIcon className="w-3 h-3" />
                  </ActionBtn>
                  <div className="flex-1" />
                  <ActionBtn
                    title="Delete"
                    onClick={() => onDeleteFile(file.id)}
                    color="#ef4444"
                    danger
                  >
                    <Trash2 className="w-3 h-3" />
                  </ActionBtn>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function ActionBtn({
  children,
  title,
  onClick,
  color,
  active,
  danger,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  color: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="flex items-center justify-center w-6 h-6 rounded transition-all duration-150"
      style={{
        background: active ? `${color}25` : danger ? 'transparent' : 'rgba(30,35,64,0.6)',
        color: active ? color : danger ? '#64748b' : '#475569',
        border: active ? `1px solid ${color}40` : '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = `${color}20`;
        (e.currentTarget as HTMLButtonElement).style.color = color;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = active
          ? `${color}25`
          : danger
          ? 'transparent'
          : 'rgba(30,35,64,0.6)';
        (e.currentTarget as HTMLButtonElement).style.color = active
          ? color
          : danger
          ? '#64748b'
          : '#475569';
      }}
    >
      {children}
    </button>
  );
}
