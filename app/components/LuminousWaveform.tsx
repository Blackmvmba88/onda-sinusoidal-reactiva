"use client";

import { useEffect, useRef, useState } from "react";

type ReactiveState = {
  rms: number;
  peak: number;
  bass: number;
  mids: number;
  highs: number;
  transient: number;
  spectralCentroid: number;
  silence: number;
  energy: number;
  time: number;
};

const ZERO_STATE: ReactiveState = {
  rms: 0,
  peak: 0,
  bass: 0,
  mids: 0,
  highs: 0,
  transient: 0,
  spectralCentroid: 0,
  silence: 1,
  energy: 0,
  time: 0,
};

const ATTACK = 0.65;
const RELEASE = 0.08;
const FFT_SIZE = 2048;
const BAR_COUNT = 420;

function smooth(current: number, target: number) {
  const rate = target > current ? ATTACK : RELEASE;
  return current + (target - current) * rate;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function averageRange(data: Uint8Array, start: number, end: number) {
  let sum = 0;
  let count = 0;
  const safeStart = Math.max(0, Math.min(data.length - 1, start));
  const safeEnd = Math.max(safeStart + 1, Math.min(data.length, end));
  for (let i = safeStart; i < safeEnd; i++) {
    sum += data[i] / 255;
    count++;
  }
  return count ? sum / count : 0;
}

export function LuminousWaveform() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const smoothedRef = useRef<ReactiveState>({ ...ZERO_STATE });
  const previousRmsRef = useRef(0);

  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState("");
  const [hudVisible, setHudVisible] = useState(true);

  const stopMic = async () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    analyserRef.current = null;
    if (audioContextRef.current) {
      await audioContextRef.current.close().catch(() => undefined);
    }
    audioContextRef.current = null;
    setMicActive(false);
  };

  const toggleMic = async () => {
    if (micActive) {
      await stopMic();
      return;
    }

    try {
      setMicError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.45;

      audioContext.createMediaStreamSource(stream).connect(analyser);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setMicActive(true);
    } catch {
      setMicError("No se pudo abrir el micrófono.");
    }
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      void audioContextRef.current?.close();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const timeDomain = new Float32Array(FFT_SIZE);
    const frequency = new Uint8Array(FFT_SIZE / 2);
    const envelope = new Float32Array(BAR_COUNT);
    const targetEnvelope = new Float32Array(BAR_COUNT);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const synthFallback = (t: number) => {
      const pulseCenters = [0.14, 0.28, 0.39, 0.53, 0.67, 0.82];
      for (let i = 0; i < FFT_SIZE; i++) {
        const x = i / (FFT_SIZE - 1);
        let env = 0.02;
        for (let p = 0; p < pulseCenters.length; p++) {
          const center = pulseCenters[p] + Math.sin(t * 0.22 + p) * 0.008;
          const width = 0.018 + (p % 3) * 0.01;
          env += Math.exp(-Math.pow((x - center) / width, 2)) * (0.35 + p * 0.08);
        }
        const carrier =
          Math.sin(i * 0.34 + t * 3.1) * 0.6 +
          Math.sin(i * 0.71 + t * 1.7) * 0.28 +
          Math.sin(i * 1.43 + t * 0.8) * 0.12;
        timeDomain[i] = carrier * env * 0.55;
      }

      for (let i = 0; i < frequency.length; i++) {
        const x = i / frequency.length;
        const shape =
          Math.exp(-x * 3.4) * 0.72 +
          Math.exp(-Math.pow((x - 0.18) / 0.08, 2)) * 0.25 +
          Math.exp(-Math.pow((x - 0.42) / 0.16, 2)) * 0.12;
        frequency[i] = Math.round(clamp01(shape) * 255);
      }
    };

    const analyze = (t: number) => {
      const analyser = analyserRef.current;
      if (micActive && analyser) {
        analyser.getFloatTimeDomainData(timeDomain);
        analyser.getByteFrequencyData(frequency);
      } else {
        synthFallback(t);
      }

      let sumSquares = 0;
      let peak = 0;
      for (let i = 0; i < timeDomain.length; i++) {
        const value = Math.abs(timeDomain[i]);
        sumSquares += value * value;
        peak = Math.max(peak, value);
      }

      const rms = Math.sqrt(sumSquares / timeDomain.length);
      const sampleRate = audioContextRef.current?.sampleRate ?? 44100;
      const hzPerBin = sampleRate / FFT_SIZE;
      const bassEnd = Math.round(180 / hzPerBin);
      const midsEnd = Math.round(2200 / hzPerBin);
      const highsEnd = Math.round(12000 / hzPerBin);

      const bass = averageRange(frequency, 0, bassEnd);
      const mids = averageRange(frequency, bassEnd, midsEnd);
      const highs = averageRange(frequency, midsEnd, highsEnd);

      let weighted = 0;
      let magnitude = 0;
      for (let i = 0; i < frequency.length; i++) {
        const value = frequency[i] / 255;
        weighted += i * hzPerBin * value;
        magnitude += value;
      }
      const spectralCentroid = magnitude
        ? clamp01((weighted / magnitude) / 10000)
        : 0;

      const transient = clamp01(Math.max(0, rms - previousRmsRef.current) * 8.5);
      previousRmsRef.current = rms;
      const silence = clamp01(1 - rms * 9);
      const energy = clamp01(rms * 4.5 + bass * 0.35 + transient * 0.8);

      const target: ReactiveState = {
        rms: clamp01(rms * 3.5),
        peak: clamp01(peak),
        bass,
        mids,
        highs,
        transient,
        spectralCentroid,
        silence,
        energy,
        time: t,
      };

      const current = smoothedRef.current;
      smoothedRef.current = {
        rms: smooth(current.rms, target.rms),
        peak: smooth(current.peak, target.peak),
        bass: smooth(current.bass, target.bass),
        mids: smooth(current.mids, target.mids),
        highs: smooth(current.highs, target.highs),
        transient: smooth(current.transient, target.transient),
        spectralCentroid: smooth(current.spectralCentroid, target.spectralCentroid),
        silence: smooth(current.silence, target.silence),
        energy: smooth(current.energy, target.energy),
        time: t,
      };

      return smoothedRef.current;
    };

    const render = (now: number) => {
      const t = now / 1000;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const centerY = height * 0.5;
      const reactive = analyze(t);

      const gradient = ctx.createRadialGradient(
        width * 0.5,
        centerY,
        0,
        width * 0.5,
        centerY,
        Math.max(width, height) * 0.72,
      );
      gradient.addColorStop(0, "#0a1a3a");
      gradient.addColorStop(0.42, "#061126");
      gradient.addColorStop(1, "#020714");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const usableWidth = width * 0.86;
      const startX = (width - usableWidth) / 2;
      const barStep = usableWidth / BAR_COUNT;
      const maxHeight = height * 0.34;

      for (let i = 0; i < BAR_COUNT; i++) {
        const start = Math.floor((i / BAR_COUNT) * timeDomain.length);
        const end = Math.max(
          start + 1,
          Math.floor(((i + 1) / BAR_COUNT) * timeDomain.length),
        );
        let localPeak = 0;
        for (let j = start; j < end; j++) {
          localPeak = Math.max(localPeak, Math.abs(timeDomain[j]));
        }

        const shaped = Math.pow(clamp01(localPeak * 1.8), 0.72);
        const target =
          shaped *
          maxHeight *
          (0.78 + reactive.bass * 0.26 + reactive.transient * 0.32);
        targetEnvelope[i] = target;
        envelope[i] = smooth(envelope[i], targetEnvelope[i]);
      }

      const centerGlow = 10 + reactive.energy * 24;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowBlur = centerGlow;
      ctx.shadowColor = "rgba(55, 170, 255, 0.95)";
      ctx.strokeStyle = "rgba(120, 205, 255, 0.88)";
      ctx.lineWidth = 1.1 + reactive.energy * 1.7;
      ctx.beginPath();
      ctx.moveTo(width * 0.04, centerY);
      ctx.lineTo(width * 0.96, centerY);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < BAR_COUNT; i++) {
        const x = startX + i * barStep;
        const h = envelope[i];
        const alpha = 0.5 + reactive.energy * 0.45;

        ctx.shadowBlur = 13 + reactive.highs * 18 + reactive.transient * 22;
        ctx.shadowColor = `rgba(50, ${Math.round(150 + reactive.highs * 80)}, 255, ${alpha})`;
        ctx.strokeStyle = `rgba(91, 191, 255, ${0.52 + reactive.energy * 0.34})`;
        ctx.lineWidth = Math.max(1, barStep * 0.72);
        ctx.beginPath();
        ctx.moveTo(x, centerY - h);
        ctx.lineTo(x, centerY + h);
        ctx.stroke();

        ctx.shadowBlur = 3 + reactive.transient * 8;
        ctx.shadowColor = "rgba(255,255,255,0.95)";
        ctx.strokeStyle = `rgba(225, 248, 255, ${0.7 + reactive.peak * 0.28})`;
        ctx.lineWidth = Math.max(0.55, barStep * 0.24);
        ctx.beginPath();
        ctx.moveTo(x, centerY - h * 0.92);
        ctx.lineTo(x, centerY + h * 0.92);
        ctx.stroke();
      }
      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    animationRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [micActive]);

  return (
    <main
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#020714",
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />

      {hudVisible && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            color: "#dff8ff",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 22,
              left: 24,
              letterSpacing: "0.18em",
              fontSize: 12,
              textShadow: "0 0 14px rgba(75, 190, 255, 0.8)",
            }}
          >
            BLACKMAMBA // LUMINOUS WAVEFORM
          </div>

          <div
            style={{
              position: "absolute",
              left: 24,
              bottom: 22,
              display: "flex",
              gap: 10,
              alignItems: "center",
              pointerEvents: "auto",
            }}
          >
            <button
              onClick={toggleMic}
              style={{
                border: "1px solid rgba(109, 214, 255, 0.55)",
                background: micActive
                  ? "rgba(255, 68, 109, 0.2)"
                  : "rgba(5, 20, 42, 0.72)",
                color: "#e7fbff",
                padding: "9px 13px",
                borderRadius: 999,
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                boxShadow: "0 0 18px rgba(47, 157, 255, 0.12)",
              }}
            >
              {micActive ? "● MIC LIVE" : "○ ENABLE MIC"}
            </button>

            <span style={{ fontSize: 11, opacity: 0.68 }}>
              {micActive ? "real audio" : "procedural fallback"}
            </span>
          </div>

          {micError && (
            <div
              style={{
                position: "absolute",
                left: 24,
                bottom: 68,
                fontSize: 11,
                color: "#ffd0d8",
              }}
            >
              {micError}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setHudVisible((value) => !value)}
        aria-label="Toggle HUD"
        style={{
          position: "absolute",
          top: 18,
          right: 20,
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "1px solid rgba(120, 210, 255, 0.42)",
          background: "rgba(4, 17, 38, 0.66)",
          color: "#bceeff",
          cursor: "pointer",
          backdropFilter: "blur(10px)",
        }}
      >
        {hudVisible ? "×" : "+"}
      </button>
    </main>
  );
}
