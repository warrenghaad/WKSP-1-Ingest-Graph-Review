import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import { FileItem } from './FileList';
import { FileText, PanelLeftOpen, PanelRightOpen, Link as LinkIcon } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface DualEditorProps {
  leftFile: FileItem | null;
  rightFile: FileItem | null;
  onContentChange: (fileId: string, content: string) => void;
}

export function DualEditor({ leftFile, rightFile, onContentChange }: DualEditorProps) {
  return (
    <div className="h-full" style={{ background: '#080b14' }}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50} minSize={25}>
          {leftFile ? (
            <EditorPane file={leftFile} side="left" onContentChange={onContentChange} />
          ) : (
            <EmptyPane side="left" />
          )}
        </ResizablePanel>

        <ResizableHandle
          withHandle
          style={{ background: '#1e2340', width: '3px' }}
        />

        <ResizablePanel defaultSize={50} minSize={25}>
          {rightFile ? (
            <EditorPane file={rightFile} side="right" onContentChange={onContentChange} />
          ) : (
            <EmptyPane side="right" />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function EmptyPane({ side }: { side: 'left' | 'right' }) {
  const color = side === 'left' ? '#6366f1' : '#06b6d4';
  const Icon = side === 'left' ? PanelLeftOpen : PanelRightOpen;

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: side === 'left'
          ? 'linear-gradient(180deg, #0a0d1a 0%, #080b14 100%)'
          : 'linear-gradient(180deg, #080d14 0%, #080b14 100%)',
      }}
    >
      {/* Pane header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{
          background: 'rgba(14,17,30,0.8)',
          borderColor: '#1e2340',
          borderTop: `2px solid ${color}30`,
        }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: `${color}80` }}
        >
          {side} pane
        </span>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: `${color}0d`,
            border: `1px solid ${color}20`,
            boxShadow: `0 0 30px ${color}10`,
          }}
        >
          <Icon className="w-7 h-7" style={{ color: `${color}60` }} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: '#334155' }}>
            No file open
          </p>
          <p className="text-xs mt-1" style={{ color: '#1e293b' }}>
            Select a file from the sidebar
          </p>
        </div>

        {/* Decorative grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: `linear-gradient(${color}40 1px, transparent 1px), linear-gradient(90deg, ${color}40 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>
    </div>
  );
}

function EditorPane({
  file,
  side,
  onContentChange,
}: {
  file: FileItem;
  side: 'left' | 'right';
  onContentChange: (fileId: string, content: string) => void;
}) {
  const color = side === 'left' ? '#6366f1' : '#06b6d4';
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineCountRef = useRef<HTMLDivElement>(null);

  const lines = file.content.split('\n');
  const lineCount = Math.max(lines.length, 1);

  const syncScroll = () => {
    if (textareaRef.current && lineCountRef.current) {
      lineCountRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const charCount = file.content.length;
  const wordCount = file.content.trim() ? file.content.trim().split(/\s+/).length : 0;

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: '#0a0d1a' }}
    >
      {/* Tab header */}
      <div
        className="flex items-center gap-0 border-b flex-shrink-0"
        style={{ borderColor: '#1e2340', borderTop: `2px solid ${color}` }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2.5 border-r"
          style={{
            background: 'rgba(14,17,30,0.9)',
            borderColor: '#1e2340',
            minWidth: 0,
            flex: 1,
          }}
        >
          <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
          <span
            className="text-xs font-medium truncate"
            style={{ color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {file.name}
          </span>
          {file.linkedTo.length > 0 && (
            <div className="flex items-center gap-1 ml-1 flex-shrink-0">
              <LinkIcon className="w-3 h-3" style={{ color: '#06b6d4' }} />
              <span style={{ color: '#06b6d4', fontSize: '10px' }}>{file.linkedTo.length}</span>
            </div>
          )}
        </div>

        {/* File stats */}
        <div className="flex items-center gap-3 px-3 flex-shrink-0" style={{ background: 'rgba(8,11,20,0.8)' }}>
          <span style={{ color: '#334155', fontSize: '10px', fontFamily: 'monospace' }}>
            {lineCount}L
          </span>
          <span style={{ color: '#334155', fontSize: '10px', fontFamily: 'monospace' }}>
            {wordCount}W
          </span>
          <span
            className="px-1.5 py-0.5 rounded uppercase"
            style={{
              background: `${color}15`,
              color,
              fontSize: '9px',
              fontFamily: 'monospace',
            }}
          >
            {ext || 'txt'}
          </span>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line numbers */}
        <div
          ref={lineCountRef}
          className="flex-shrink-0 overflow-hidden select-none"
          style={{
            width: '44px',
            background: 'rgba(8,11,20,0.6)',
            borderRight: '1px solid #1a1d2e',
            paddingTop: '12px',
            paddingBottom: '12px',
            overflowY: 'hidden',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className="text-right pr-3"
              style={{
                color: '#2d3352',
                fontSize: '12px',
                lineHeight: '1.6',
                fontFamily: "'JetBrains Mono', monospace",
                height: '19.2px',
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={file.content}
          onChange={(e) => onContentChange(file.id, e.target.value)}
          onScroll={syncScroll}
          className="flex-1 resize-none outline-none p-3"
          style={{
            background: 'transparent',
            color: '#cbd5e1',
            fontSize: '12px',
            lineHeight: '1.6',
            fontFamily: "'JetBrains Mono', monospace",
            caretColor: color,
            border: 'none',
          }}
          placeholder={`# Start editing ${file.name}...`}
          spellCheck={false}
        />
      </div>

      {/* Bottom status bar */}
      <div
        className="flex items-center px-3 py-1 border-t gap-3 flex-shrink-0"
        style={{ borderColor: '#1a1d2e', background: 'rgba(8,11,20,0.8)' }}
      >
        <span style={{ color: '#1e293b', fontSize: '10px' }}>
          {(charCount / 1024).toFixed(2)} KB
        </span>
        <span style={{ color: '#1e293b', fontSize: '10px' }}>
          UTF-8
        </span>
        <div
          className="ml-auto w-1.5 h-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 4px ${color}` }}
        />
      </div>
    </div>
  );
}
