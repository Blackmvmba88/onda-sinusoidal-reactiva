"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Sample = {
  step: number;
  cost: number;
  stability: number;
  energy: number;
};

function sampleAt(step: number): Sample {
  const decay = Math.exp(-step / 78);
  const oscillation = Math.sin(step * 0.24) * decay;
  const energy = 0.18 + Math.abs(oscillation) * 0.74;
  const cost = energy * energy + decay * 0.22;
  return {
    step,
    cost,
    stability: Math.max(0, Math.min(1, 1 - cost * 0.72)),
    energy,
  };
}

export function VgeDemo() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [microphoneError, setMicrophoneError] = useState("");
  const [microphoneLevel, setMicrophoneLevel] = useState(0);
  const [microphonePoints, setMicrophonePoints] = useState("");
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setStep((current) => (current >= 200 ? 0 : current + 1));
    }, 60);
    return () => window.clearInterval(timer);
  }, [running]);

  const stopMicrophone = useCallback(() => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    void audioContextRef.current?.close();
    frameRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
    setMicrophoneActive(false);
    setMicrophoneLevel(0);
    setMicrophonePoints("");
  }, []);

  useEffect(() => stopMicrophone, [stopMicrophone]);

  const startMicrophone = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicrophoneError("Este navegador no ofrece acceso al micrófono.");
      return;
    }
    try {
      setMicrophoneError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.72;
      context.createMediaStreamSource(stream).connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      streamRef.current = stream;
      audioContextRef.current = context;
      setMicrophoneActive(true);
      setRunning(false);

      const draw = () => {
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        const coordinates: string[] = [];
        const stride = Math.max(1, Math.floor(samples.length / 128));
        for (let index = 0; index < samples.length; index += stride) {
          const normalized = (samples[index] - 128) / 128;
          sum += normalized * normalized;
          coordinates.push(`${(index / (samples.length - 1)) * 100},${50 + normalized * 44}`);
        }
        setMicrophoneLevel(Math.min(1, Math.sqrt(sum / coordinates.length) * 3.6));
        setMicrophonePoints(coordinates.join(" "));
        frameRef.current = window.requestAnimationFrame(draw);
      };
      draw();
    } catch (error) {
      stopMicrophone();
      setMicrophoneError(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Permiso de micrófono rechazado. Actívalo en el navegador para usar la onda en vivo."
          : "No se pudo iniciar el micrófono.",
      );
    }
  }, [stopMicrophone]);

  const sample = useMemo(() => sampleAt(step), [step]);
  const simulationPoints = useMemo(
    () =>
      Array.from({ length: 72 }, (_, index) => {
        const x = (index / 71) * 100;
        const phase = index * 0.31 + step * 0.13;
        const amplitude = 24 * Math.exp(-step / 155);
        const y = 50 + Math.sin(phase) * amplitude * (0.7 + Math.cos(index * 0.08) * 0.3);
        return `${x},${y}`;
      }).join(" "),
    [step],
  );
  const points = microphoneActive && microphonePoints ? microphonePoints : simulationPoints;

  return (
    <section className="instrument" aria-label="Simulación VGE">
      <div className="instrumentTop">
        <div>
          <span className="eyebrow">{microphoneActive ? "Entrada de audio real" : "Motor activo"}</span>
          <h2>{microphoneActive ? "Micrófono → onda → nivel" : "Estado → dinámica → costo"}</h2>
        </div>
        <span className={`statusPill ${running || microphoneActive ? "live" : ""}`}>
          <i /> {microphoneActive ? "Micrófono en vivo" : running ? "Ejecutando" : "En pausa"}
        </span>
      </div>

      <div className="scope" aria-label="Campo dinámico VGE">
        <div className="scopeGrid" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img">
          <title>Trayectoria dinámica calculada por pasos</title>
          <polyline points={points} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="scopeLabel">
          {microphoneActive ? `INPUT · NIVEL ${(microphoneLevel * 100).toFixed(1)}%` : "SEED 42 · DT 0.1"}
        </span>
      </div>

      <div className="metrics">
        <Metric label={microphoneActive ? "Fuente" : "Paso"} value={microphoneActive ? "MIC" : String(sample.step).padStart(3, "0")} />
        <Metric label={microphoneActive ? "Nivel RMS" : "Costo"} value={microphoneActive ? microphoneLevel.toFixed(4) : sample.cost.toFixed(4)} />
        <Metric label={microphoneActive ? "Señal" : "Estabilidad"} value={microphoneActive ? (microphoneLevel > .02 ? "Detectada" : "Silencio") : `${(sample.stability * 100).toFixed(1)}%`} />
        <Metric label={microphoneActive ? "Muestreo" : "Energía abstracta"} value={microphoneActive ? "1024 pts" : sample.energy.toFixed(4)} />
      </div>

      <div className="controls">
        <button className="micButton" onClick={microphoneActive ? stopMicrophone : startMicrophone}>
          {microphoneActive ? "Apagar micrófono" : "Usar micrófono"}
        </button>
        <button className="primaryButton" onClick={() => setRunning((value) => !value)}>
          {running ? "Pausar simulación" : "Ejecutar simulación"}
        </button>
        <button className="secondaryButton" onClick={() => { setRunning(false); setStep(0); }}>
          Reiniciar
        </button>
      </div>
      {microphoneError && <p className="microphoneError" role="alert">{microphoneError}</p>}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
