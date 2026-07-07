import { useEffect, useRef } from 'react';
import { statsBus, type PipelineStats } from './statsBus';

/**
 * Floating, draggable performance overlay
 * Shows camera FPS and BlazeFace/FaceMesh timings, with a scrolling graph
 * rendered off the main thread on an OffscreenCanvas worker.
 *
 * The container is a plain fixed-position div; everything dynamic (text + graph) is updated
 * imperatively from the statsBus callback so per-frame stats never trigger React re-renders.
 * Rendered only while logging is enabled (see where it's mounted).
 */

// Inline worker that owns the OffscreenCanvas and draws the scrolling graph off the main thread.
const GRAPH_WORKER_CODE = `
  let ctx;
  let maxPoints = 60;
  let stopped = false;
  onmessage = (e) => {
    const { type, data } = e.data;
    if (type === "stop") { stopped = true; return; }
    if (stopped) return;
    if (type === "init") {
      ctx = data.canvas.getContext('2d');
      maxPoints = data.maxPoints;
    } else if (type === "draw") {
      const videoHistory = data.video, detHistory = data.det, lmHistory = data.lm, costHistory = data.cost;
      const w = data.w, h = data.h, leftPad = 28;
      const all = [...videoHistory, ...detHistory, ...lmHistory, ...costHistory];
      const dataMax = all.length ? Math.max(...all, 30) : 30;
      const niceIntervals = [5, 10, 15, 20, 25, 30];
      let tickInterval = 15;
      for (const iv of niceIntervals) { if (Math.ceil(dataMax / iv) * iv <= iv * 5) { tickInterval = iv; break; } }
      const yMin = 0;
      const yMax = Math.ceil(dataMax / tickInterval) * tickInterval;
      const ticks = [];
      for (let v = yMin; v <= yMax; v += tickInterval) ticks.push(v);
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.font = "10px monospace";
      ctx.fillStyle = "#aaa";
      for (let i = 0; i < ticks.length; i++) {
        const norm = (ticks[i] - yMin) / (yMax - yMin);
        const y = h - norm * h;
        ctx.strokeStyle = "#333";
        ctx.beginPath(); ctx.moveTo(leftPad, y); ctx.lineTo(w, y); ctx.stroke();
        ctx.fillText(ticks[i].toString(), 2, y - 2);
      }
      ctx.strokeStyle = "#555";
      ctx.beginPath(); ctx.moveTo(leftPad + 0.5, 0); ctx.lineTo(leftPad + 0.5, h); ctx.stroke();
      const drawLine = (dataArr, color) => {
        if (!dataArr.length) return;
        ctx.strokeStyle = color;
        ctx.beginPath();
        const len = dataArr.length;
        for (let i = 0; i < len; i++) {
          const x = leftPad + ((i - len + 1 + maxPoints) / maxPoints) * (w - leftPad);
          const norm = (dataArr[i] - yMin) / (yMax - yMin);
          const y = h - norm * h;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };
      drawLine(videoHistory, "#0f0");
      drawLine(detHistory, "#ff6b6b");
      drawLine(lmHistory, "#5cf");
      drawLine(costHistory, "#fa0");
    }
  };
`;

const StatsWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const MAX_POINTS = 60;
    const videoHistory: number[] = [];
    const detHistory: number[] = [];
    const lmHistory: number[] = [];
    const costHistory: number[] = [];
    let frameCount = 0;
    let hidden = false;

    const setStyle = (el: HTMLElement, style: Partial<CSSStyleDeclaration>) => Object.assign(el.style, style);

    setStyle(container, {
      position: 'fixed', top: '50px', right: '30px', background: 'rgba(0,0,0,0.75)', color: 'white',
      fontFamily: 'monospace', fontSize: '11px', padding: '6px', borderRadius: '8px', zIndex: '99999',
      width: '250px', cursor: 'move', userSelect: 'none',
    });

    // Close button
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '✕';
    setStyle(closeBtn, { position: 'absolute', top: '4px', right: '6px', cursor: 'pointer', color: '#aaa', fontSize: '11px' });

    // Help icon + tooltip
    const helpIcon = document.createElement('span');
    helpIcon.textContent = '?';
    setStyle(helpIcon, {
      position: 'absolute', bottom: '6px', right: '6px', cursor: 'pointer', color: '#aaa', fontSize: '10px',
      fontWeight: 'bold', width: '14px', height: '14px', lineHeight: '14px', textAlign: 'center',
      border: '1px solid #aaa', borderRadius: '50%',
    });
    const tooltip = document.createElement('div');
    tooltip.innerHTML = `
      <b>Video</b> — Camera frame rate (FPS)<br>
      <b>Detection</b> — BlazeFace detection round-trip time<br>
      <b>Landmark</b> — FaceMesh landmark round-trip time<br>
      <b>inf</b> — Pure ONNX inference time inside worker<br>
      <b>skip N</b> — Detection runs every N frames<br>
      <b>LM-skip</b> — % of frames where landmarks were reused<br>
      <b>Cost/frame</b> — Amortized detection + landmark time per frame
    `;
    setStyle(tooltip, {
      display: 'none', position: 'absolute', bottom: '22px', right: '0', background: 'rgba(0,0,0,0.92)',
      color: '#ddd', fontSize: '10px', lineHeight: '1.6', padding: '8px 10px', borderRadius: '6px',
      whiteSpace: 'nowrap', zIndex: '100000', pointerEvents: 'none', border: '1px solid #555', textAlign: 'left',
    });
    helpIcon.appendChild(tooltip);
    helpIcon.onmouseenter = () => { tooltip.style.display = 'block'; };
    helpIcon.onmouseleave = () => { tooltip.style.display = 'none'; };

    // Graph canvas (rendered by the worker via OffscreenCanvas)
    const canvas = document.createElement('canvas');
    canvas.width = 230;
    canvas.height = 70;

    // Text stats
    const statsEl = document.createElement('div');
    setStyle(statsEl, { marginTop: '4px', lineHeight: '1.5', fontSize: '10.5px' });

    // Legend
    const legend = document.createElement('div');
    setStyle(legend, {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px',
      fontSize: '10.5px', gap: '8px', flexWrap: 'nowrap',
    });
    legend.innerHTML = `
      <div style="display:flex;align-items:center;gap:4px;white-space:nowrap;"><span style="width:9px;height:9px;background:#0f0;border-radius:2px;display:inline-block;"></span><span>Video</span></div>
      <div style="display:flex;align-items:center;gap:4px;white-space:nowrap;"><span style="width:9px;height:9px;background:#ff6b6b;border-radius:2px;display:inline-block;"></span><span>Detection</span></div>
      <div style="display:flex;align-items:center;gap:4px;white-space:nowrap;"><span style="width:9px;height:9px;background:#5cf;border-radius:2px;display:inline-block;"></span><span>Landmark</span></div>
      <div style="display:flex;align-items:center;gap:4px;white-space:nowrap;"><span style="width:9px;height:9px;background:#fa0;border-radius:2px;display:inline-block;"></span><span>Cost/f</span></div>
    `;

    container.append(closeBtn, helpIcon, canvas, legend, statsEl);

    // Off-main-thread graph worker
    const offscreen = canvas.transferControlToOffscreen();
    const blobUrl = URL.createObjectURL(new Blob([GRAPH_WORKER_CODE], { type: 'application/javascript' }));
    const worker = new Worker(blobUrl, { name: 'STATS_WIDGET_WORKER' });
    worker.postMessage({ type: 'init', data: { canvas: offscreen, maxPoints: MAX_POINTS } }, [offscreen]);

    closeBtn.onclick = () => {
      hidden = true;
      container.style.display = 'none';
      worker.postMessage({ type: 'stop' });
    };

    // Per-frame stats → imperative text + throttled graph update (no React re-render)
    const unsubscribe = statsBus.subscribe((stats: PipelineStats) => {
      if (hidden) return;
      const videoFps = stats.cameraFps || 0;

      let html = `<span style="color:#0f0">Video: ${videoFps.toFixed(1)} FPS</span>`;
      html += `<br><span style="color:#ff6b6b">Detection: ${stats.detectionAvgMs.toFixed(1)}ms</span>`;
      if (stats.detectionInferenceMs > 0) html += ` (inf: ${stats.detectionInferenceMs.toFixed(1)}ms)`;
      html += ` (skip ${stats.detectionSkipN})`;
      html += `<br><span style="color:#5cf">Landmark: ${stats.landmarkAvgMs.toFixed(1)}ms</span>`;
      if (stats.landmarkInferenceMs > 0) html += ` (inf: ${stats.landmarkInferenceMs.toFixed(1)}ms)`;
      html += `<br>LM-skip: ${stats.landmarkSkipPct.toFixed(0)}%`;
      html += ` &nbsp; <span style="color:#fa0">Cost/frame: ${stats.costPerFrameMs.toFixed(1)}ms</span>`;
      statsEl.innerHTML = html;

      // Throttle graph pushes relative to the camera rate (~6 points/sec)
      frameCount++;
      const N = Math.max(1, Math.round(videoFps / 6));
      if (frameCount % N === 0) {
        videoHistory.push(videoFps);
        detHistory.push(stats.detectionAvgMs || 0);
        lmHistory.push(stats.landmarkAvgMs || 0);
        costHistory.push(stats.costPerFrameMs);
        if (videoHistory.length > MAX_POINTS) videoHistory.shift();
        if (detHistory.length > MAX_POINTS) detHistory.shift();
        if (lmHistory.length > MAX_POINTS) lmHistory.shift();
        if (costHistory.length > MAX_POINTS) costHistory.shift();
        worker.postMessage({
          type: 'draw',
          data: { video: videoHistory, det: detHistory, lm: lmHistory, cost: costHistory, w: canvas.width, h: canvas.height },
        });
      }
    });

    // Dragging
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'SPAN') return; // don't drag when clicking close/help
      isDragging = true;
      offsetX = e.clientX - container.offsetLeft;
      offsetY = e.clientY - container.offsetTop;
    };
    const onMouseUp = () => { isDragging = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      container.style.left = `${e.clientX - offsetX}px`;
      container.style.top = `${e.clientY - offsetY}px`;
      container.style.bottom = 'auto';
      container.style.right = 'auto';
    };
    container.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      unsubscribe();
      worker.postMessage({ type: 'stop' });
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      container.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
      container.replaceChildren();
    };
  }, []);

  return <div ref={containerRef} />;
};

export default StatsWidget;
