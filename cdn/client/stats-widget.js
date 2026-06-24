class StatsWidget {
  constructor() {
    this.videoHistory = [];
    this.detHistory = [];
    this.lmHistory = [];
    this.costHistory = [];
    this.maxPoints = 60;
    this._hidden = false;
    this._frameCount = 0;

    // Container
    this.container = document.createElement("div");
    Object.assign(this.container.style, {
      position: "fixed",
      top: "50px",
      right: "30px",
      background: "rgba(0,0,0,0.75)",
      color: "white",
      fontFamily: "monospace",
      fontSize: "11px",
      padding: "6px",
      borderRadius: "8px",
      zIndex: 99999,
      width: "250px",
      cursor: "move",
      userSelect: "none",
    });

    // Close button
    const closeBtn = document.createElement("span");
    closeBtn.textContent = "✕";
    Object.assign(closeBtn.style, {
      position: "absolute",
      top: "4px",
      right: "6px",
      cursor: "pointer",
      color: "#aaa",
      fontSize: "11px",
    });
    closeBtn.onclick = () => {
      this.close();
    };

    // Help icon
    const helpIcon = document.createElement("span");
    helpIcon.textContent = "?";
    Object.assign(helpIcon.style, {
      position: "absolute",
      bottom: "6px",
      right: "6px",
      cursor: "pointer",
      color: "#aaa",
      fontSize: "10px",
      fontWeight: "bold",
      width: "14px",
      height: "14px",
      lineHeight: "14px",
      textAlign: "center",
      border: "1px solid #aaa",
      borderRadius: "50%",
    });
    const tooltip = document.createElement("div");
    tooltip.innerHTML = `
      <b>Video</b> — Camera frame rate (FPS)<br>
      <b>Detection</b> — BlazeFace detection round-trip time<br>
      <b>Landmark</b> — FaceMesh landmark round-trip time<br>
      <b>inf</b> — Pure ONNX inference time inside worker<br>
      <b>skip N</b> — Detection runs every N frames<br>
      <b>LM-skip</b> — % of frames where landmarks were reused<br>
      <b>Cost/frame</b> — Amortized detection + landmark time per frame
    `;
    Object.assign(tooltip.style, {
      display: "none",
      position: "absolute",
      bottom: "22px",
      right: "0",
      background: "rgba(0,0,0,0.92)",
      color: "#ddd",
      fontSize: "10px",
      lineHeight: "1.6",
      padding: "8px 10px",
      borderRadius: "6px",
      whiteSpace: "nowrap",
      zIndex: "100000",
      pointerEvents: "none",
      border: "1px solid #555",
      textAlign: "left",
    });
    helpIcon.appendChild(tooltip);
    helpIcon.onmouseenter = () => { tooltip.style.display = "block"; };
    helpIcon.onmouseleave = () => { tooltip.style.display = "none"; };

    // Canvas for FPS graph
    this.canvas = document.createElement("canvas");
    this.canvas.width = 230;
    this.canvas.height = 70;

    // Stats text rows
    this.statsEl = document.createElement("div");
    Object.assign(this.statsEl.style, {
      marginTop: "4px",
      lineHeight: "1.5",
      fontSize: "10.5px",
    });

    // Legend
    this.legend = document.createElement("div");
    Object.assign(this.legend.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "4px",
      fontSize: "10.5px",
      gap: "8px",
      flexWrap: "nowrap",
    });
    this.legend.innerHTML = `
      <div style="display:flex;align-items:center;gap:4px;white-space:nowrap;">
          <span style="width:9px;height:9px;background:#0f0;border-radius:2px;display:inline-block;"></span>
          <span>Video</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px;white-space:nowrap;">
          <span style="width:9px;height:9px;background:#ff6b6b;border-radius:2px;display:inline-block;"></span>
          <span>Detection</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px;white-space:nowrap;">
          <span style="width:9px;height:9px;background:#5cf;border-radius:2px;display:inline-block;"></span>
          <span>Landmark</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px;white-space:nowrap;">
          <span style="width:9px;height:9px;background:#fa0;border-radius:2px;display:inline-block;"></span>
          <span>Cost/f</span>
      </div>
    `;

    this.container.append(closeBtn, helpIcon, this.canvas, this.legend, this.statsEl);
    document.body.appendChild(this.container);

    this.enableDrag();
    this._initWorker();
  }

  _initWorker() {
    const offscreen = this.canvas.transferControlToOffscreen();
    const workerCode = `
      let ctx;
      let maxPoints = 60;
      let videoHistory = [];
      let detHistory = [];
      let lmHistory = [];
      let costHistory = [];
      let stopped = false;

      onmessage = (e) => {
        const { type, data } = e.data;
        if (type === "stop") {
          stopped = true;
          return;
        }
        if (stopped) return;

        if (type === "init") {
          ctx = data.canvas.getContext('2d');
          maxPoints = data.maxPoints;
        } else if (type === "draw") {
          videoHistory = data.video;
          detHistory = data.det;
          lmHistory = data.lm;
          costHistory = data.cost;

          const w = data.w;
          const h = data.h;
          const leftPad = 28;

          const all = [...videoHistory, ...detHistory, ...lmHistory, ...costHistory];
          const dataMax = all.length ? Math.max(...all, 30) : 30;

          // Pick a nice tick interval so we get round numbers including 30
          const niceIntervals = [5, 10, 15, 20, 25, 30];
          let tickInterval = 15;
          for (const iv of niceIntervals) {
            if (Math.ceil(dataMax / iv) * iv <= iv * 5) { tickInterval = iv; break; }
          }
          const yMin = 0;
          const yMax = Math.ceil(dataMax / tickInterval) * tickInterval;
          const ticks = [];
          for (let v = yMin; v <= yMax; v += tickInterval) ticks.push(v);

          ctx.clearRect(0, 0, w, h);
          ctx.lineWidth = 1;
          ctx.font = "10px monospace";
          ctx.fillStyle = "#aaa";

          // Y grid
          for (let i = 0; i < ticks.length; i++) {
            const norm = (ticks[i] - yMin) / (yMax - yMin);
            const y = h - norm * h;
            ctx.strokeStyle = "#333";
            ctx.beginPath();
            ctx.moveTo(leftPad, y);
            ctx.lineTo(w, y);
            ctx.stroke();
            ctx.fillText(ticks[i].toString(), 2, y - 2);
          }

          // Y-axis
          ctx.strokeStyle = "#555";
          ctx.beginPath();
          ctx.moveTo(leftPad + 0.5, 0);
          ctx.lineTo(leftPad + 0.5, h);
          ctx.stroke();

          // Draw line (right-to-left scrolling)
          const drawLine = (dataArr, color) => {
            if (!dataArr.length) return;
            ctx.strokeStyle = color;
            ctx.beginPath();
            const len = dataArr.length;
            for (let i = 0; i < len; i++) {
              const x = leftPad + ((i - len + 1 + maxPoints) / maxPoints) * (w - leftPad);
              const norm = (dataArr[i] - yMin) / (yMax - yMin);
              const y = h - norm * h;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
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
    const blob = new Blob([workerCode], { type: "application/javascript" });
    this.worker = new Worker(URL.createObjectURL(blob), { name: "STATS_WIDGET_WORKER" });
    this.worker.postMessage({ type: "init", data: { canvas: offscreen, maxPoints: this.maxPoints } }, [offscreen]);
  }

  close() {
    this.container.style.display = "none";
    this._hidden = true;
    if (this.worker) this.worker.postMessage({ type: "stop" });
  }

  /**
   * @param {{ cameraFps: number, faceTrackerFps: number, faceCount: number, detectionAvgMs: number, detectionSkipN: number, landmarkAvgMs: number, landmarkSkipPct: number, costPerFrameMs: number }} stats
   */
  set(stats) {
    if (this._hidden) return;

    const videoFps = stats.cameraFps || 0;

    // Update text stats
    let html = `<span style="color:#0f0">Video: ${videoFps.toFixed(1)} FPS</span>`;
    html += `<br><span style="color:#ff6b6b">Detection: ${stats.detectionAvgMs.toFixed(1)}ms</span>`;
    if (stats.detectionInferenceMs > 0) html += ` (inf: ${stats.detectionInferenceMs.toFixed(1)}ms)`;
    html += ` (skip ${stats.detectionSkipN})`;
    html += `<br><span style="color:#5cf">Landmark: ${stats.landmarkAvgMs.toFixed(1)}ms</span>`;
    if (stats.landmarkInferenceMs > 0) html += ` (inf: ${stats.landmarkInferenceMs.toFixed(1)}ms)`;
    html += `<br>LM-skip: ${stats.landmarkSkipPct.toFixed(0)}%`;
    html += ` &nbsp; <span style="color:#fa0">Cost/frame: ${stats.costPerFrameMs.toFixed(1)}ms</span>`;
    this.statsEl.innerHTML = html;

    // Throttle graph updates
    this._frameCount++;
    const N = Math.max(1, Math.round(videoFps / 6));
    if (this._frameCount % N === 0) {
      this.videoHistory.push(videoFps);
      this.detHistory.push(stats.detectionAvgMs || 0);
      this.lmHistory.push(stats.landmarkAvgMs || 0);
      this.costHistory.push(stats.costPerFrameMs);
      if (this.videoHistory.length > this.maxPoints) this.videoHistory.shift();
      if (this.detHistory.length > this.maxPoints) this.detHistory.shift();
      if (this.lmHistory.length > this.maxPoints) this.lmHistory.shift();
      if (this.costHistory.length > this.maxPoints) this.costHistory.shift();

      this.worker.postMessage({
        type: "draw",
        data: {
          video: this.videoHistory,
          det: this.detHistory,
          lm: this.lmHistory,
          cost: this.costHistory,
          w: this.canvas.width,
          h: this.canvas.height,
        },
      });
    }
  }

  enableDrag() {
    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    this.container.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "SPAN") return;
      isDragging = true;
      offsetX = e.clientX - this.container.offsetLeft;
      offsetY = e.clientY - this.container.offsetTop;
    });
    document.addEventListener("mouseup", () => (isDragging = false));
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      this.container.style.left = `${e.clientX - offsetX}px`;
      this.container.style.top = `${e.clientY - offsetY}px`;
      this.container.style.bottom = "auto";
      this.container.style.right = "auto";
    });
  }
}

window.StatsWidget = StatsWidget;
