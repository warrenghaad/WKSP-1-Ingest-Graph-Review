import { Brain, Loader2, SendHorizonal, Sparkles, Terminal, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { FileItem } from './FileList';

interface LLMPanelProps {
  files: FileItem[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  'Analyze files and suggest a database schema',
  'Identify relationships between these files',
  'Suggest categories for organizing this content',
  'Find common patterns across all files',
];

export function LLMPanel({ files }: LLMPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [processing, setProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleProcess = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim() || processing || files.length === 0) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: finalPrompt, timestamp: new Date() },
    ]);
    setPrompt('');
    setProcessing(true);

    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

    const linkedCount = files.filter((f) => f.linkedTo.length > 0).length;
    const totalLinks = files.reduce((acc, f) => acc + f.linkedTo.length, 0);
    const fileNames = files.map((f) => f.name).join(', ');
    const avgSize = files.length
      ? Math.round(files.reduce((a, f) => a + f.content.length, 0) / files.length / 1024 * 10) / 10
      : 0;

    const result = `## Analysis Complete

**Files analyzed:** ${files.length} (${fileNames})

**Relationship summary:**
- ${linkedCount} of ${files.length} files have established links
- ${totalLinks} total relationships mapped
- Average file size: ~${avgSize}KB

**Recommendations based on "${finalPrompt}":**

1. **Schema suggestion** — Create a \`documents\` table with columns: \`id\`, \`name\`, \`content\`, \`type\`, \`created_at\`, \`metadata (JSONB)\`

2. **Relationship table** — A \`document_links\` junction table with \`source_id\` → \`target_id\` foreign keys will capture your ${totalLinks} link${totalLinks !== 1 ? 's' : ''}

3. **Categorization** — Group files by extension type (${[...new Set(files.map(f => '.' + f.name.split('.').pop()))].join(', ')}) for the initial taxonomy

4. **Next steps** — Review relationships in the graph view, then export your registry to JSON or SQL format

> ℹ️ Connect a real LLM API (OpenAI, Anthropic, etc.) to unlock intelligent content analysis.`;

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: result, timestamp: new Date() },
    ]);
    setProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleProcess();
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#0c0f1d' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: '#1e2340' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            <Brain className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
          </div>
          <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>
            AI Assistant
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: files.length > 0 ? '#10b981' : '#334155',
              boxShadow: files.length > 0 ? '0 0 6px #10b981' : 'none',
            }}
          />
          <span style={{ color: '#475569', fontSize: '10px' }}>
            {files.length > 0 ? `${files.length} file${files.length !== 1 ? 's' : ''} ready` : 'No files'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            {/* Welcome */}
            <div
              className="rounded-lg p-3"
              style={{
                background: 'rgba(139,92,246,0.06)',
                border: '1px solid rgba(139,92,246,0.15)',
              }}
            >
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#a78bfa' }} />
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#c4b5fd' }}>
                    AI-Powered Analysis
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
                    Ask me to analyze your files, suggest database schemas, identify patterns, or
                    help organize your content for export.
                  </p>
                </div>
              </div>
            </div>

            {/* No files warning */}
            {files.length === 0 && (
              <div
                className="rounded-lg p-3 flex items-start gap-2"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.15)',
                }}
              >
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#f87171' }} />
                <p className="text-xs" style={{ color: '#ef4444' }}>
                  Upload files first to enable analysis.
                </p>
              </div>
            )}

            {/* Suggestion chips */}
            {files.length > 0 && (
              <div>
                <p className="text-xs mb-2" style={{ color: '#334155' }}>Quick prompts:</p>
                <div className="space-y-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleProcess(s)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all"
                      style={{
                        background: 'rgba(30,35,64,0.4)',
                        border: '1px solid #1e2340',
                        color: '#64748b',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.4)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#a78bfa';
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e2340';
                        (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(30,35,64,0.4)';
                      }}
                    >
                      → {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}
              >
                <Brain className="w-3 h-3" style={{ color: '#a78bfa' }} />
              </div>
            )}
            <div
              className="max-w-[85%] rounded-lg px-3 py-2.5"
              style={
                msg.role === 'user'
                  ? {
                      background: 'rgba(99,102,241,0.15)',
                      border: '1px solid rgba(99,102,241,0.25)',
                    }
                  : {
                      background: 'rgba(20,24,40,0.8)',
                      border: '1px solid #1e2340',
                    }
              }
            >
              <pre
                className="text-xs whitespace-pre-wrap leading-relaxed"
                style={{
                  color: msg.role === 'user' ? '#c7d2fe' : '#94a3b8',
                  fontFamily: msg.role === 'assistant' ? "'JetBrains Mono', monospace" : 'inherit',
                }}
              >
                {msg.content}
              </pre>
              <p className="text-right mt-1" style={{ color: '#1e293b', fontSize: '9px' }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {processing && (
          <div className="flex items-start gap-2">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}
            >
              <Brain className="w-3 h-3" style={{ color: '#a78bfa' }} />
            </div>
            <div
              className="px-3 py-2.5 rounded-lg flex items-center gap-2"
              style={{ background: 'rgba(20,24,40,0.8)', border: '1px solid #1e2340' }}
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#a78bfa' }} />
              <span className="text-xs" style={{ color: '#64748b' }}>
                Analyzing…
              </span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{
                      background: '#6366f1',
                      animation: `bounce 1s ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input area */}
      <div
        className="flex-shrink-0 p-3 border-t"
        style={{ borderColor: '#1e2340' }}
      >
        <div
          className="flex items-end gap-2 rounded-xl p-2"
          style={{
            background: 'rgba(14,17,30,0.8)',
            border: '1px solid #2a2d3e',
          }}
        >
          <Terminal className="w-3.5 h-3.5 mb-1.5 flex-shrink-0" style={{ color: '#334155' }} />
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              files.length === 0
                ? 'Upload files first…'
                : 'Ask the AI… (Enter to send)'
            }
            disabled={files.length === 0 || processing}
            rows={2}
            className="flex-1 resize-none outline-none bg-transparent text-xs leading-relaxed"
            style={{
              color: '#94a3b8',
              fontFamily: "'JetBrains Mono', monospace",
              caretColor: '#6366f1',
            }}
          />
          <button
            onClick={() => handleProcess()}
            disabled={!prompt.trim() || processing || files.length === 0}
            className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all"
            style={{
              background:
                prompt.trim() && !processing && files.length > 0
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(30,35,64,0.5)',
              color:
                prompt.trim() && !processing && files.length > 0 ? '#fff' : '#334155',
              boxShadow:
                prompt.trim() && !processing && files.length > 0
                  ? '0 0 12px rgba(99,102,241,0.4)'
                  : 'none',
            }}
          >
            <SendHorizonal className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-center mt-1.5" style={{ color: '#1e293b', fontSize: '9px' }}>
          Mock interface · Connect OpenAI/Anthropic API for real analysis
        </p>
      </div>
    </div>
  );
}
