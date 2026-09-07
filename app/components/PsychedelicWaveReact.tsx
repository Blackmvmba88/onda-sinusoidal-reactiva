"use client";

import { useEffect, useRef, useState, useCallback } from "react";

function hsvToRgb(h: number, s: number, v: number): string {
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

function getPaletteColor(palette: string, hue: number, layer: number, totalLayers: number): string {
  const t = layer / totalLayers;
  if (palette === "acid") {
    const r = Math.round(185 * (1 - t));
    const g = 255;
    const b = Math.round(56 + t * 148);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (palette === "cyber") {
    const r = Math.round(255 * (1 - t * 0.8));
    const g = Math.round(t * 220);
    const b = 255;
    return `rgb(${r}, ${g}, ${b})`;
  } else if (palette === "fire") {
    const localHue = (hue * 0.15) % 0.15; // Rango de tonos cálidos
    return hsvToRgb(localHue, 1.0, 1.0);
  } else if (palette === "ocean") {
    const localHue = 0.5 + (hue * 0.2) % 0.2; // Rango de tonos azul-cyan
    return hsvToRgb(localHue, 1.0, 1.0);
  } else {
    return hsvToRgb(hue, 1.0, 1.0); // Arcoíris completo
  }
}

export function PsychedelicWaveReact() {
  const [modo, setModo] = useState<"linea" | "circulo">("linea");
  
  // Parámetros de edición
  const [lineWidth, setLineWidth] = useState(2.2);
  const [gain, setGain] = useState(1.4);
  const [colorSpeed, setColorSpeed] = useState(0.015);
  const [radius, setRadius] = useState(0.55);
  const [shadowGlow, setShadowGlow] = useState(16); // Resplandor neón
  const [persistence, setPersistence] = useState(0.92); // Duración de estela
  const [colorPalette, setColorPalette] = useState<"rainbow" | "acid" | "cyber" | "fire" | "ocean">("rainbow");

  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const CHUNK = 1024;
  const TRAIL_COUNT = 12;
  const trailHistoryRef = useRef<Float32Array[]>(
    Array.from({ length: TRAIL_COUNT }, () => new Float32Array(CHUNK))
  );

  const limpiarBuffer = useCallback(() => {
    trailHistoryRef.current = Array.from(
      { length: TRAIL_COUNT },
      () => new Float32Array(CHUNK)
    );
  }, []);

  const cambiarModo = useCallback((nuevoModo: "linea" | "circulo") => {
    limpiarBuffer();
    setModo(nuevoModo);
  }, [limpiarBuffer]);

  // Manejo de teclado: 'o' para Círculo, 'Espacio' para Línea
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === "o" || e.key === "O") {
        cambiarModo("circulo");
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        cambiarModo("linea");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cambiarModo]);

  // Micrófono Toggle
  const toggleMic = async () => {
    if (micActive) {
      micStreamRef.current?.getTracks().forEach((track) => track.stop());
      void audioCtxRef.current?.close();
      audioCtxRef.current = null;
      analyserRef.current = null;
      micStreamRef.current = null;
      setMicActive(false);
    } else {
      try {
        setMicError("");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        });
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = CHUNK * 2;
        analyser.smoothingTimeConstant = 0.6;
        ctx.createMediaStreamSource(stream).connect(analyser);

        micStreamRef.current = stream;
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
        setMicActive(true);
      } catch {
        setMicError("No se pudo iniciar el micrófono.");
      }
    }
  };

  // Ajuste de Canvas a Pantalla Completa
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // Bucle Principal de Renderizado
  useEffect(() => {
    let frame = 0;
    const currentBuffer = new Float32Array(CHUNK);

    const render = () => {
      frame++;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      if (micActive && analyserRef.current) {
        analyserRef.current.getFloatTimeDomainData(currentBuffer);
      } else {
        const freq = 220 + 110 * Math.sin(frame / 40.0);
        const amp = 0.5 + 0.25 * Math.cos(frame / 60.0);
        for (let i = 0; i < CHUNK; i++) {
          const t = i / 44100;
          currentBuffer[i] = amp * Math.sin(2 * Math.PI * freq * t);
        }
      }

      // Aplicar ganancia
      const gBuffer = new Float32Array(CHUNK);
      for (let i = 0; i < CHUNK; i++) {
        gBuffer[i] = currentBuffer[i] * gain;
      }

      // Actualizar historial
      const history = [gBuffer, ...trailHistoryRef.current.slice(0, TRAIL_COUNT - 1)];
      trailHistoryRef.current = history;

      // Limpiar fondo negro absoluto
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Renderizar 12 capas de estela
      for (let layer = TRAIL_COUNT - 1; layer >= 0; layer--) {
        const data = history[layer];
        const fade = Math.pow(persistence, layer);
        const alpha = Math.pow(fade, 1.4) * 0.95;
        const hue = (frame * colorSpeed + layer * 0.055) % 1.0;
        const color = getPaletteColor(colorPalette, hue, layer, TRAIL_COUNT);

        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = Math.max(0.5, lineWidth - layer * 0.12);

        // Control de Sombra / Resplandor Neón
        if (shadowGlow > 0) {
          ctx.shadowBlur = layer === 0 ? shadowGlow : Math.round(shadowGlow * 0.35);
          ctx.shadowColor = color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();

        if (modo === "circulo") {
          const baseR = (Math.min(width, height) / 2) * radius - layer * 1.5;
          for (let i = 0; i < CHUNK; i++) {
            const angle = (i / CHUNK) * Math.PI * 2;
            const r = baseR + data[i] * fade * 90;
            const px = cx + r * Math.cos(angle);
            const py = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
        } else {
          const offsetY = layer * -2.5;
          const sliceW = width / (CHUNK - 1);
          for (let i = 0; i < CHUNK; i++) {
            const px = i * sliceW;
            const py = cy - data[i] * fade * (height * 0.28) + offsetY;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [modo, lineWidth, gain, colorSpeed, radius, shadowGlow, persistence, colorPalette, micActive]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", backgroundColor: "#000000", overflow: "hidden" }}>
      {/* Canvas Principal */}
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />

      {/* Header HUD Superior Minimalista */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "20px",
          right: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#b9ff38", fontFamily: "monospace", fontSize: "13px", fontWeight: "bold", letterSpacing: "2px" }}>
            ONDA REACTIVA
          </span>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "11px",
              fontFamily: "monospace",
              backgroundColor: modo === "circulo" ? "rgba(0, 255, 204, 0.15)" : "rgba(185, 255, 56, 0.15)",
              color: modo === "circulo" ? "#00ffcc" : "#b9ff38",
              border: `1px solid ${modo === "circulo" ? "#00ffcc" : "#b9ff38"}`,
            }}
          >
            {modo === "circulo" ? "🟢 MODO CÍRCULO [o]" : "⚡ MODO LÍNEA [Espacio]"}
          </span>
        </div>

        <div style={{ pointerEvents: "auto" }}>
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            style={{
              background: panelOpen ? "rgba(185, 255, 56, 0.2)" : "rgba(15, 20, 16, 0.8)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${panelOpen ? "#b9ff38" : "rgba(255, 255, 255, 0.2)"}`,
              color: panelOpen ? "#b9ff38" : "#ffffff",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              borderRadius: "6px",
              transition: "0.2s",
              boxShadow: panelOpen ? "0 0 15px rgba(185, 255, 56, 0.3)" : "none",
            }}
          >
            {panelOpen ? "✕ Ocultar Panel" : "⚙️ Panel de Edición"}
          </button>
        </div>
      </div>

      {/* Panel Lateral Semitransparente Flotante (Right Sidebar Drawer) */}
      {panelOpen && (
        <div
          style={{
            position: "absolute",
            top: "65px",
            right: "20px",
            bottom: "20px",
            width: "320px",
            background: "rgba(10, 14, 11, 0.72)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(185, 255, 56, 0.22)",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7)",
            zIndex: 10,
            color: "#e9f0eb",
            fontFamily: "sans-serif",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Título del Panel */}
          <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "10px" }}>
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#8a9790", textTransform: "uppercase", letterSpacing: "1px" }}>
              Panel de Configuración
            </span>
            <h3 style={{ margin: "4px 0 0", fontSize: "16px", color: "#ffffff" }}>Ajustes de Render</h3>
          </div>

          {/* Selector de Modo */}
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "#8a9790", marginBottom: "8px" }}>FORMA Y MODO</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                onClick={() => cambiarModo("linea")}
                style={{
                  background: modo === "linea" ? "#b9ff38" : "transparent",
                  color: modo === "linea" ? "#000000" : "#e9f0eb",
                  border: "1px solid #b9ff38",
                  padding: "8px",
                  fontWeight: "bold",
                  fontSize: "11px",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
              >
                ⚡ Línea [Espacio]
              </button>
              <button
                onClick={() => cambiarModo("circulo")}
                style={{
                  background: modo === "circulo" ? "#00ffcc" : "transparent",
                  color: modo === "circulo" ? "#000000" : "#e9f0eb",
                  border: "1px solid #00ffcc",
                  padding: "8px",
                  fontWeight: "bold",
                  fontSize: "11px",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
              >
                🟢 Círculo [o]
              </button>
            </div>
          </div>

          {/* Micrófono Toggle */}
          <div>
            <button
              onClick={toggleMic}
              style={{
                width: "100%",
                background: micActive ? "#ff3366" : "rgba(255, 255, 255, 0.06)",
                color: "#ffffff",
                border: micActive ? "1px solid #ff3366" : "1px solid rgba(255, 255, 255, 0.15)",
                padding: "10px",
                fontWeight: "bold",
                fontSize: "12px",
                cursor: "pointer",
                borderRadius: "6px",
              }}
            >
              {micActive ? "🎙️ Apagar Micrófono" : "🎙️ Usar Micrófono Live"}
            </button>
            {micError && <p style={{ color: "#f3c866", fontSize: "11px", margin: "6px 0 0" }}>{micError}</p>}
          </div>

          {/* Paleta de Colores */}
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "#8a9790", marginBottom: "8px" }}>PALETA DE COLOR</label>
            <select
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value as typeof colorPalette)}
              style={{
                width: "100%",
                background: "#121814",
                color: "#e9f0eb",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                padding: "8px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                outline: "none",
              }}
            >
              <option value="rainbow">🌈 Psicodélico Arcoíris</option>
              <option value="acid">⚡ Verde Neón Acid</option>
              <option value="cyber">💖 Cyber Magenta & Cyan</option>
              <option value="fire">🔥 Fuego & Cálido</option>
              <option value="ocean">🌊 Océano & Azul Neón</option>
            </select>
          </div>

          {/* Sliders Ajustables */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#8a9790", marginBottom: "4px" }}>
                <span>✨ Resplandor Neón (Sombra)</span>
                <span style={{ color: "#00ffcc", fontFamily: "monospace" }}>{shadowGlow} px</span>
              </label>
              <input
                type="range"
                min={0}
                max={30}
                value={shadowGlow}
                onChange={(e) => setShadowGlow(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "#00ffcc" }}
              />
            </div>

            <div>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#8a9790", marginBottom: "4px" }}>
                <span>⏳ Persistencia Estela (Tiempo)</span>
                <span style={{ color: "#ff00a0", fontFamily: "monospace" }}>{Math.round(persistence * 100)}%</span>
              </label>
              <input
                type="range"
                min={0.80}
                max={0.98}
                step={0.01}
                value={persistence}
                onChange={(e) => setPersistence(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#ff00a0" }}
              />
            </div>

            <div>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#8a9790", marginBottom: "4px" }}>
                <span>✏️ Grosor de Línea</span>
                <span style={{ color: "#b9ff38", fontFamily: "monospace" }}>{lineWidth.toFixed(1)} px</span>
              </label>
              <input
                type="range"
                min={0.5}
                max={6.0}
                step={0.1}
                value={lineWidth}
                onChange={(e) => setLineWidth(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#b9ff38" }}
              />
            </div>

            <div>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#8a9790", marginBottom: "4px" }}>
                <span>🔊 Ganancia de Audio</span>
                <span style={{ color: "#ffcc00", fontFamily: "monospace" }}>{gain.toFixed(2)} x</span>
              </label>
              <input
                type="range"
                min={0.2}
                max={4.0}
                step={0.1}
                value={gain}
                onChange={(e) => setGain(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#ffcc00" }}
              />
            </div>

            <div>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#8a9790", marginBottom: "4px" }}>
                <span>🎨 Velocidad de Color</span>
                <span style={{ color: "#00ffcc", fontFamily: "monospace" }}>{colorSpeed.toFixed(3)}</span>
              </label>
              <input
                type="range"
                min={0.0}
                max={0.05}
                step={0.002}
                value={colorSpeed}
                onChange={(e) => setColorSpeed(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#00ffcc" }}
              />
            </div>

            <div>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#8a9790", marginBottom: "4px" }}>
                <span>⭕ Radio Círculo</span>
                <span style={{ color: "#b9ff38", fontFamily: "monospace" }}>{radius.toFixed(2)} r</span>
              </label>
              <input
                type="range"
                min={0.2}
                max={0.9}
                step={0.02}
                value={radius}
                onChange={(e) => setRadius(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#b9ff38" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
