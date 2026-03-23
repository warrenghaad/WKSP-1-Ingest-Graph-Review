import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { FileItem } from './FileList';
import { useState } from 'react';
import { Link as LinkIcon, Tag, Plus, X, Check, FileText } from 'lucide-react';

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFile: FileItem | null;
  allFiles: FileItem[];
  onUpdateLinks: (fileId: string, linkedIds: string[]) => void;
  onUpdateMetadata: (fileId: string, key: string, value: string) => void;
}

export function LinkDialog({
  open,
  onOpenChange,
  currentFile,
  allFiles,
  onUpdateLinks,
  onUpdateMetadata,
}: LinkDialogProps) {
  const [metadataKey, setMetadataKey] = useState('');
  const [metadataValue, setMetadataValue] = useState('');
  const [activeTab, setActiveTab] = useState<'links' | 'metadata'>('links');

  if (!currentFile) return null;

  const otherFiles = allFiles.filter((f) => f.id !== currentFile.id);
  const linkedIds = new Set(currentFile.linkedTo);

  const handleToggleLink = (fileId: string) => {
    const newLinkedIds = new Set(linkedIds);
    if (newLinkedIds.has(fileId)) {
      newLinkedIds.delete(fileId);
    } else {
      newLinkedIds.add(fileId);
    }
    onUpdateLinks(currentFile.id, Array.from(newLinkedIds));
  };

  const handleAddMetadata = () => {
    if (metadataKey && metadataValue) {
      onUpdateMetadata(currentFile.id, metadataKey, metadataValue);
      setMetadataKey('');
      setMetadataValue('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden"
        style={{
          background: '#0c0f1d',
          border: '1px solid #1e2340',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
        }}
      >
        <DialogHeader className="p-0">
          {/* Modal header */}
          <div
            className="px-5 py-4 border-b"
            style={{
              borderColor: '#1e2340',
              background: 'linear-gradient(135deg, #0d1021 0%, #111428 100%)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}
              >
                <LinkIcon className="w-4 h-4" style={{ color: '#818cf8' }} />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
                  File Relationships
                </DialogTitle>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <FileText className="w-3 h-3" style={{ color: '#475569' }} />
                  <span
                    className="text-xs truncate"
                    style={{ color: '#6366f1', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {currentFile.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: '#334155' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#64748b')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#334155')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-4">
              <TabButton
                active={activeTab === 'links'}
                onClick={() => setActiveTab('links')}
                icon={<LinkIcon className="w-3.5 h-3.5" />}
                label={`Links (${currentFile.linkedTo.length})`}
                color="#6366f1"
              />
              <TabButton
                active={activeTab === 'metadata'}
                onClick={() => setActiveTab('metadata')}
                icon={<Tag className="w-3.5 h-3.5" />}
                label={`Metadata (${Object.keys(currentFile.metadata || {}).length})`}
                color="#8b5cf6"
              />
            </div>
          </div>
        </DialogHeader>

        <div className="p-5" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {activeTab === 'links' && (
            <div className="space-y-3">
              {otherFiles.length === 0 ? (
                <div
                  className="rounded-lg p-6 flex flex-col items-center gap-2"
                  style={{ background: 'rgba(30,35,64,0.3)', border: '1px dashed #1e2340' }}
                >
                  <LinkIcon className="w-8 h-8" style={{ color: '#1e2340' }} />
                  <p className="text-xs text-center" style={{ color: '#334155' }}>
                    No other files to link to. Upload more files first.
                  </p>
                </div>
              ) : (
                otherFiles.map((file) => {
                  const isLinked = linkedIds.has(file.id);
                  return (
                    <button
                      key={file.id}
                      onClick={() => handleToggleLink(file.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
                      style={{
                        background: isLinked
                          ? 'rgba(99,102,241,0.1)'
                          : 'rgba(30,35,64,0.3)',
                        border: isLinked
                          ? '1px solid rgba(99,102,241,0.4)'
                          : '1px solid #1e2340',
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isLinked ? '#6366f1' : 'rgba(30,35,64,0.6)',
                          border: `1px solid ${isLinked ? '#6366f1' : '#2a2d3e'}`,
                        }}
                      >
                        {isLinked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#475569' }} />
                      <span
                        className="text-sm flex-1 truncate"
                        style={{
                          color: isLinked ? '#e2e8f0' : '#64748b',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '12px',
                        }}
                      >
                        {file.name}
                      </span>
                      {file.linkedTo.length > 0 && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4' }}
                        >
                          {file.linkedTo.length} link{file.linkedTo.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="space-y-4">
              {/* Existing metadata */}
              {currentFile.metadata && Object.keys(currentFile.metadata).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#334155' }}>
                    Current Tags
                  </p>
                  <div className="space-y-2">
                    {Object.entries(currentFile.metadata).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{ background: 'rgba(30,35,64,0.4)', border: '1px solid #1e2340' }}
                      >
                        <Tag className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#8b5cf6' }} />
                        <span className="text-xs font-medium" style={{ color: '#6366f1' }}>{key}</span>
                        <span style={{ color: '#334155' }}>:</span>
                        <span className="text-xs flex-1 truncate" style={{ color: '#94a3b8' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add metadata */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#334155' }}>
                  Add Tag
                </p>
                <div className="flex gap-2">
                  <input
                    value={metadataKey}
                    onChange={(e) => setMetadataKey(e.target.value)}
                    placeholder="key"
                    className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
                    style={{
                      background: 'rgba(14,17,30,0.8)',
                      border: '1px solid #2a2d3e',
                      color: '#94a3b8',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                    onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.5)')}
                    onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = '#2a2d3e')}
                  />
                  <input
                    value={metadataValue}
                    onChange={(e) => setMetadataValue(e.target.value)}
                    placeholder="value"
                    className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
                    style={{
                      background: 'rgba(14,17,30,0.8)',
                      border: '1px solid #2a2d3e',
                      color: '#94a3b8',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                    onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.5)')}
                    onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = '#2a2d3e')}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMetadata()}
                  />
                  <button
                    onClick={handleAddMetadata}
                    disabled={!metadataKey || !metadataValue}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background:
                        metadataKey && metadataValue
                          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                          : 'rgba(30,35,64,0.4)',
                      color: metadataKey && metadataValue ? '#fff' : '#334155',
                      boxShadow:
                        metadataKey && metadataValue
                          ? '0 0 12px rgba(99,102,241,0.3)'
                          : 'none',
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t flex items-center justify-between"
          style={{ borderColor: '#1e2340', background: 'rgba(8,11,20,0.5)' }}
        >
          <span className="text-xs" style={{ color: '#334155' }}>
            {currentFile.linkedTo.length} link{currentFile.linkedTo.length !== 1 ? 's' : ''} ·{' '}
            {Object.keys(currentFile.metadata || {}).length} tag{Object.keys(currentFile.metadata || {}).length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              boxShadow: '0 0 12px rgba(99,102,241,0.3)',
            }}
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{
        background: active ? `${color}20` : 'transparent',
        color: active ? color : '#475569',
        border: `1px solid ${active ? `${color}40` : 'transparent'}`,
      }}
    >
      {icon}
      {label}
    </button>
  );
}
