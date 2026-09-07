"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

interface Props {
  projectId: string;
  title: string;
  repo: string;
  description: string;
}

export function InteractiveWaveLab({ projectId, title, repo, description }: Props) {
  // Common states
  const [activeTab, setActiveTab] = useState<"visualizer" | "synth" | "info">("visualizer");
  
  // Synth states (ONDASINUS88)
  const [freq, setFreq] = useState(432);
  const [volume, setVolume] = useState(0.3);
  const [isPlayingSynth, setIsPlayingSynth] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Harmonics state (ondasinusoidal)
  const [h1, setH1] = useState(1.0);
  const [h2, setH2] = useState(0.5);
  const [h3, setH3] = useState(0.25);

  // Wave parameters (OndaNew)
  const [waveFreq, setWaveFreq] = useState(0.05);
  const [waveAmp, setWaveAmp] = useState(40);
  const [waveSpeed, setWaveSpeed] = useState(0.04);

  // Filter parameters (osciloscopio)
  const [filterType, setFilterType] = useState<"lowpass" | "highpass">("lowpass");
  const [cutoff, setCutoff] = useState(800);

  // Phase shift (nuevaonda)
  const [phaseShift, setPhaseShift] = useState(90);

  // FPS Benchmark (epic_sinewave_benchmarks)
  const [fps, setFps] = useState(60);

  // Mic state (rainbow-mic-scope, etc.)
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState("");
  const micStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Handle Synth Start/Stop
  const toggleSynth = () => {
    if (isPlayingSynth) {
      oscRef.current?.stop();
      oscRef.current?.disconnect();
      gainRef.current?.disconnect();
      setIsPlayingSynth(false);
    } else {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      audioCtxRef.current = ctx;
      oscRef.current = osc;
      gainRef.current = gain;
      setIsPlayingSynth(true);
    }
  };

  useEffect(() => {
    if (isPlayingSynth && oscRef.current && gainRef.current && audioCtxRef.current) {
      oscRef.current.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      gainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [freq, volume, isPlayingSynth]);

  // Clean up synth
  useEffect(() => {
    return () => {
      oscRef.current?.stop();
      audioCtxRef.current?.close();
    };
  }, []);

  // Handle Mic Start/Stop
  const toggleMic = async () => {
    if (micActive) {
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      setMicActive(false);
    } else {
      try {
        setMicError("");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        ctx.createMediaStreamSource(stream).connect(analyser);

        micStreamRef.current = stream;
        analyserRef.current = analyser;
        setMicActive(true);
      } catch {
        setMicError("No se pudo acceder al micrófono.");
      }
    }
  };

  // Canvas Animation Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let step = 0;
    let lastTime = performance.now();
    let frameCount = 0;

    const draw = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      step += waveSpeed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Grid for oscilloscope style
      if (projectId === "oscilloscope-project" || projectId === "osciloscopio") {
        ctx.strokeStyle = "#16221a";
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      ctx.lineWidth = 3;
      const cy = canvas.height / 2;

      // Project-specific rendering styles
      if (projectId === "rainbow-mic-scope" || projectId === "rainbow-wave-visualizer") {
        // Rainbow Wave Effect
        const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        grad.addColorStop(0, "#ff0055");
        grad.addColorStop(0.3, "#ffcc00");
        grad.addColorStop(0.6, "#00ffcc");
        grad.addColorStop(1, "#3388ff");
        ctx.strokeStyle = grad;
      } else if (projectId === "OndaSinusoidalRainbow") {
        ctx.strokeStyle = "#00ff66";
      } else {
        ctx.strokeStyle = "#b9ff38";
      }

      ctx.beginPath();

      if (micActive && analyserRef.current) {
        // Mic input rendering
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteTimeDomainData(dataArray);

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
      } else if (projectId === "rainbow-mic-scope") {
        // Circular Scope simulation
        const radius = 80;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        for (let i = 0; i <= 360; i += 2) {
          const rad = (i * Math.PI) / 180;
          const r = radius + Math.sin(rad * 8 + step * 4) * 25;
          const x = centerX + Math.cos(rad) * r;
          const y = centerY + Math.sin(rad) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else if (projectId === "ondasinusoidal") {
        // Harmonics combination
        for (let x = 0; x < canvas.width; x++) {
          const t = x * 0.03 + step;
          const y =
            cy -
            (Math.sin(t) * h1 * 40 +
              Math.sin(t * 2) * h2 * 20 +
              Math.sin(t * 3) * h3 * 10);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else if (projectId === "nuevaonda") {
        // Dual Phase Wave comparison
        ctx.strokeStyle = "#00ffcc";
        for (let x = 0; x < canvas.width; x++) {
          const y = cy - Math.sin(x * 0.04 + step) * 35;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = "#ff0077";
        const shiftRad = (phaseShift * Math.PI) / 180;
        for (let x = 0; x < canvas.width; x++) {
          const y = cy - Math.sin(x * 0.04 + step + shiftRad) * 35;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else {
        // Standard Sine Wave
        for (let x = 0; x < canvas.width; x++) {
          const y = cy - Math.sin(x * waveFreq + step) * waveAmp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  }, [waveFreq, waveAmp, waveSpeed, h1, h2, h3, phaseShift, micActive, projectId]);

  useEffect(() => {
    renderCanvas();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [renderCanvas]);

  return (
    <main className="projectPage">
      <nav className="topbar">
        <Link href="/" className="brand">
          ONDA <span>SINUSOIDAL</span>
        </Link>
        <Link href="/" className="backLink">
          ← Volver al catálogo completo
        </Link>
      </nav>

      <div className="projectIntro">
        <div>
          <span className="indexTag">MÓDULO EJECUTABLE · {projectId}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="verdict warning">
          <span>Repositorio Origen</span>
          <strong>{repo}</strong>
          <p>Motor interactivo Web Audio & Canvas activo.</p>
        </div>
      </div>

      <section className="instrument">
        <div className="instrumentTop">
          <div>
            <span className="eyebrow">Osciloscopio & Laboratorio Interactivo</span>
            <h2>{title} en tiempo real</h2>
          </div>
          <div className="controlsGroup">
            <button
              className={`chip ${activeTab === "visualizer" ? "active" : ""}`}
              onClick={() => setActiveTab("visualizer")}
            >
              Visualizador
            </button>
            <button
              className={`chip ${activeTab === "synth" ? "active" : ""}`}
              onClick={() => setActiveTab("synth")}
            >
              Sintetizador Audio
            </button>
          </div>
        </div>

        <div className="scope">
          <canvas ref={canvasRef} width={1000} height={320} style={{ width: "100%", height: "100%" }} />
          <span className="scopeLabel">
            {micActive ? "MIC AUDIO LIVE" : `SINE ENGINE · ${fps} FPS`}
          </span>
        </div>

        {/* Dynamic Controls based on project */}
        <div className="controls" style={{ flexWrap: "wrap", margin: "20px 0" }}>
          <button className="micButton" onClick={toggleMic}>
            {micActive ? "Apagar Micrófono" : "Usar Micrófono Live"}
          </button>
          <button
            className={isPlayingSynth ? "secondaryButton" : "primaryButton"}
            onClick={toggleSynth}
          >
            {isPlayingSynth ? "Detener Audio 🔊" : "Generar Tono Senoidal 🔊"}
          </button>
          {micError && <span className="microphoneError">{micError}</span>}
        </div>

        {/* Project Specific Controls */}
        <div className="controlsGrid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", borderTop: "1px solid var(--line)", paddingTop: "20px" }}>
          {projectId === "ONDASINUS88" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--muted)" }}>
                  Frecuencia Sinesoothe: {freq} Hz
                </label>
                <input
                  type="range"
                  min={100}
                  max={1000}
                  value={freq}
                  onChange={(e) => setFreq(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--muted)" }}>
                  Volumen: {Math.round(volume * 100)}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>
            </>
          )}

          {projectId === "ondasinusoidal" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--muted)" }}>Armónico 1 (Fundamental): {h1}</label>
                <input type="range" min={0} max={2} step={0.1} value={h1} onChange={(e) => setH1(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--muted)" }}>Armónico 2: {h2}</label>
                <input type="range" min={0} max={2} step={0.1} value={h2} onChange={(e) => setH2(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--muted)" }}>Armónico 3: {h3}</label>
                <input type="range" min={0} max={2} step={0.1} value={h3} onChange={(e) => setH3(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
            </>
          )}

          {projectId === "nuevaonda" && (
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--muted)" }}>Desfase ($\Delta \phi$): {phaseShift}°</label>
              <input type="range" min={0} max={360} value={phaseShift} onChange={(e) => setPhaseShift(Number(e.target.value))} style={{ width: "100%" }} />
            </div>
          )}

          {projectId === "OndaNew" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--muted)" }}>Frecuencia (Spatial): {waveFreq.toFixed(3)}</label>
                <input type="range" min={0.01} max={0.2} step={0.005} value={waveFreq} onChange={(e) => setWaveFreq(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--muted)" }}>Amplitud (Height): {waveAmp}px</label>
                <input type="range" min={5} max={100} value={waveAmp} onChange={(e) => setWaveAmp(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--muted)" }}>Velocidad: {waveSpeed.toFixed(3)}</label>
                <input type="range" min={0.005} max={0.1} step={0.005} value={waveSpeed} onChange={(e) => setWaveSpeed(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
            </>
          )}

          {projectId === "osciloscopio" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--muted)" }}>Tipo de Filtro DSP</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value as "lowpass" | "highpass")} style={{ width: "100%", background: "var(--panel)", color: "var(--ink)", border: "1px solid var(--line)", padding: "6px" }}>
                  <option value="lowpass">Pasa-Bajas (Lowpass)</option>
                  <option value="highpass">Pasa-Altas (Highpass)</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--muted)" }}>Corte de Frecuencia: {cutoff} Hz</label>
                <input type="range" min={100} max={5000} step={100} value={cutoff} onChange={(e) => setCutoff(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
            </>
          )}
        </div>
      </section>

      <section className="evidencePanel">
        <div>
          <span>Motor Render</span>
          <strong>Canvas 2D / Web Audio</strong>
        </div>
        <div>
          <span>Frecuencia Base</span>
          <strong>{freq} Hz</strong>
        </div>
        <div>
          <span>Estado Render</span>
          <strong>{fps} FPS (60hz)</strong>
        </div>
        <div>
          <span>Procedencia</span>
          <strong>{repo}</strong>
        </div>
      </section>
    </main>
  );
}
