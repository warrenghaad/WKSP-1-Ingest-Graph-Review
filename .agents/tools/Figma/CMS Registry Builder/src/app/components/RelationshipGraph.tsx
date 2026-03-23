import { useEffect, useRef, useState, useCallback } from 'react';
import { FileItem } from './FileList';
import { RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface RelationshipGraphProps {
  files: FileItem[];
  onFileClick: (fileId: string) => void;
}

interface GraphNode {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  linkedTo: string[];
}

export function RelationshipGraph({ files, onFileClick }: RelationshipGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const animFrameRef = useRef<number>(0);
  const [zoom, setZoom] = useState(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoveredIdRef = useRef<string | null>(null);

  const initNodes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.32;

    nodesRef.current = files.map((file, i) => {
      const angle = (i / files.length) * Math.PI * 2 - Math.PI / 2;
      return {
        id: file.id,
        name: file.name,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: 0,
        vy: 0,
        linkedTo: file.linkedTo,
      };
    });
  }, [files]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    // Dark bg
    ctx.fillStyle = '#080b14';
    ctx.fillRect(0, 0, w, h);

    // Dot grid
    ctx.fillStyle = 'rgba(30,35,64,0.5)';
    for (let x = 0; x < w; x += 28) {
      for (let y = 0; y < h; y += 28) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (files.length === 0) {
      ctx.fillStyle = '#1e293b';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Upload files to see the relationship graph', w / 2, h / 2);
      return;
    }

    const nodes = nodesRef.current;

    // Apply force layout tick
    nodes.forEach((node) => {
      // Repel from other nodes
      nodes.forEach((other) => {
        if (other.id === node.id) return;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = Math.min(3000 / (dist * dist), 4);
        node.vx += (dx / dist) * force;
        node.vy += (dy / dist) * force;
      });

      // Attract to center
      const cx = w / 2;
      const cy = h / 2;
      node.vx += (cx - node.x) * 0.002;
      node.vy += (cy - node.y) * 0.002;

      // Spring toward linked nodes
      node.linkedTo.forEach((linkedId) => {
        const other = nodes.find((n) => n.id === linkedId);
        if (!other) return;
        const dx = other.x - node.x;
        const dy = other.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 120;
        const force = (dist - targetDist) * 0.015;
        node.vx += (dx / dist) * force;
        node.vy += (dy / dist) * force;
      });

      // Damping
      node.vx *= 0.85;
      node.vy *= 0.85;
      node.x += node.vx;
      node.y += node.vy;

      // Keep in bounds
      const pad = 60;
      node.x = Math.max(pad, Math.min(w - pad, node.x));
      node.y = Math.max(pad, Math.min(h - pad, node.y));
    });

    // Draw edges
    nodes.forEach((node) => {
      node.linkedTo.forEach((linkedId) => {
        const target = nodes.find((n) => n.id === linkedId);
        if (!target) return;

        const isHovered = hoveredIdRef.current === node.id || hoveredIdRef.current === target.id;

        const grad = ctx.createLinearGradient(node.x, node.y, target.x, target.y);
        grad.addColorStop(0, isHovered ? 'rgba(99,102,241,0.8)' : 'rgba(99,102,241,0.25)');
        grad.addColorStop(1, isHovered ? 'rgba(6,182,212,0.8)' : 'rgba(6,182,212,0.25)');

        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = isHovered ? 2 : 1.5;
        ctx.stroke();
      });
    });

    // Draw nodes
    nodes.forEach((node) => {
      const isHovered = hoveredIdRef.current === node.id;
      const hasLinks = node.linkedTo.length > 0;
      const nodeR = isHovered ? 22 : 18;

      // Glow
      if (hasLinks || isHovered) {
        const glowColor = hasLinks ? '#6366f1' : '#475569';
        const glow = ctx.createRadialGradient(node.x, node.y, nodeR * 0.5, node.x, node.y, nodeR * 2.5);
        glow.addColorStop(0, isHovered ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.15)');
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeR * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      // Node circle
      const grad = ctx.createRadialGradient(
        node.x - nodeR * 0.3,
        node.y - nodeR * 0.3,
        nodeR * 0.1,
        node.x,
        node.y,
        nodeR
      );
      if (hasLinks) {
        grad.addColorStop(0, isHovered ? '#818cf8' : '#6366f1');
        grad.addColorStop(1, isHovered ? '#6366f1' : '#4f46e5');
      } else {
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#0f172a');
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Border
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2);
      ctx.strokeStyle = isHovered
        ? '#a5b4fc'
        : hasLinks
        ? 'rgba(99,102,241,0.6)'
        : 'rgba(30,41,59,0.8)';
      ctx.lineWidth = isHovered ? 2 : 1.5;
      ctx.stroke();

      // Link count badge
      if (hasLinks) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${isHovered ? 11 : 10}px JetBrains Mono, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.linkedTo.length.toString(), node.x, node.y);
      }

      // Label
      const shortName =
        node.name.length > 14 ? node.name.substring(0, 12) + '…' : node.name;
      ctx.fillStyle = isHovered ? '#e2e8f0' : '#64748b';
      ctx.font = `${isHovered ? '11px' : '10px'} Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(shortName, node.x, node.y + nodeR + 12);
    });

    animFrameRef.current = requestAnimationFrame(draw);
  }, [files]);

  useEffect(() => {
    initNodes();
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [files, draw, initNodes]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = nodesRef.current.find((n) => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 22;
    });

    if (clicked) onFileClick(clicked.id);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hovered = nodesRef.current.find((n) => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 22;
    });

    const newId = hovered ? hovered.id : null;
    hoveredIdRef.current = newId;
    setHoveredId(newId);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  };

  return (
    <div className="h-full w-full relative" style={{ background: '#080b14' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => {
          hoveredIdRef.current = null;
          setHoveredId(null);
        }}
      />

      {/* Controls */}
      <div
        className="absolute top-3 right-3 flex flex-col gap-1"
      >
        <button
          onClick={initNodes}
          className="w-7 h-7 rounded flex items-center justify-center transition-colors"
          style={{ background: '#111428', border: '1px solid #1e2340', color: '#475569' }}
          title="Reset layout"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-3 left-3 rounded-lg px-3 py-2 text-xs space-y-1.5"
        style={{ background: 'rgba(8,11,20,0.85)', border: '1px solid #1e2340' }}
      >
        <p className="font-semibold text-xs" style={{ color: '#475569' }}>LEGEND</p>
        <div className="flex items-center gap-2">
          <div
            className="w-3.5 h-3.5 rounded-full"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          />
          <span style={{ color: '#64748b' }}>Has links</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3.5 h-3.5 rounded-full border"
            style={{ background: '#0f172a', borderColor: '#1e293b' }}
          />
          <span style={{ color: '#64748b' }}>No links</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-px w-6"
            style={{ background: 'linear-gradient(90deg, #6366f1, #06b6d4)' }}
          />
          <span style={{ color: '#64748b' }}>Relationship</span>
        </div>
      </div>

      {hoveredId && (
        <div
          className="absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs"
          style={{
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: '#a5b4fc',
          }}
        >
          {nodesRef.current.find((n) => n.id === hoveredId)?.name}
        </div>
      )}
    </div>
  );
}
