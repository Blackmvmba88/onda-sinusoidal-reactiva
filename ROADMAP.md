# Roadmap — Onda Sinusoidal Reactiva 🗺️⚡

Este documento establece la visión técnica, las fases de desarrollo y los hito futuros para la evolución del motor de **Onda Sinusoidal Reactiva**.

---

## 📌 Fase 1: Consolidación & Experiencia Base (Completado) ✅

- [x] **Consolidación del Catálogo:** Indexación formal de los 13 proyectos de onda del ecosistema BlackMamba.
- [x] **Motor React a Pantalla Completa:** Canvas de alto rendimiento en fondo negro puro (`#000000`).
- [x] **Modos de Forma Interactivas:**
  - Alternancia fluida entre **Modo Línea (`[Espacio]`)** y **Modo Círculo (`[o]`)**.
  - **Reset Inmediato de Buffer:** Limpieza completa de estelas al cambiar de modo para evitar trazos cruzados.
- [x] **Panel Lateral Sleek Flotante:**
  - Drawer lateral semitransparente con efecto *glassmorphism* colapsable.
- [x] **Controles de Edición Avanzados:**
  - Slider de **Resplandor Neón (`shadowBlur`)**.
  - Slider de **Persistencia y Tiempo de Estela (`persistence`)**.
  - Selector de **Paletas de Color** (Arcoíris, Acid Neón, Cyber Magenta, Fuego, Océano).
- [x] **Entrada de Audio Dual:** Soporte de micrófono en vivo vía Web Audio API y simulador sintético automático.

---

## 🚀 Fase 2: Rendimiento WebGL & Shader Effects (Q4 2026) 🔄

- [ ] **Migración del Renderizador a WebGL 2.0 / Fragment Shaders:**
  - Reemplazo del trazado 2D por fragment shaders acelerados por GPU para soportar +100 capas de estelas a 120 FPS estables.
- [ ] **Efectos de Post-Procesamiento:**
  - *Bloom Shader* neón de alta intensidad.
  - Efecto de distorsión *Chromatic Aberration* (Desfase de canales R/G/B reactivo a graves).
  - Efecto de escáner CRT / retro-grid opcional.
- [ ] **Modos de Geometría Adicionales:**
  - **Modo Lissajous 3D:** Figuras senoidales entrelazadas en 3 dimensiones ($\sin(a t)$, $\sin(b t)$, $\sin(c t)$).
  - **Modo Espectrograma Radial:** Anillo de 64 bandas espectrales con respuesta FFT.

---

## 🎛️ Fase 3: Audio DSP & Conectividad MIDI (Q1 2027) ⏳

- [ ] **Sintetizador Web Audio Integrado Completo:**
  - Osciladores polifónicos con moduladores LFO senoidales reactivos.
  - Control de envolvente ADSR (Attack, Decay, Sustain, Release) en el panel lateral.
- [ ] **Soporte WebMIDI:**
  - Mapeo de perillas y faders de controladores MIDI físicos (Akai, Novation, Arturia) directamente a los sliders del panel.
- [ ] **Grabación de Video & Exportación:**
  - Capturador `MediaRecorder` integrado en la UI para exportar clips WebM/MP4 a 60 FPS con audio reactivo.

---

## 🤖 Fase 4: Sincronización Generativa por IA & VST/Plugin (Q2 2027) 🔮

- [ ] **Reconocimiento de BPM y Detección de Transitorios:**
  - Algoritmo de *Beat Tracking* en tiempo real para hacer reaccionar los pulsos del resplandor neón al ritmo exacto de cualquier canción.
- [ ] **Exportación a Plugin VST3 / Audio Unit:**
  - Empaquetado del motor C++/JUCE basado en `ONDASINUS88` para ejecutarse como plugin visualizador dentro de DAWs (Ableton Live, FL Studio, Logic Pro).
- [ ] **Integración con Motor Generativo Iyari Gomez / Suno:**
  - Sincronización de forma de onda con la metadata y temas del catálogo canónico de BlackMamba RECORDS.

---

## 📈 Resumen de Estado de Desarrollo

```text
[████████████████████] 100%  Fase 1: Consolidación & UI React Sleek
[██████░░░░░░░░░░░░░░]  30%  Fase 2: WebGL & Shader Effects
[░░░░░░░░░░░░░░░░░░░░]   0%  Fase 3: Audio DSP & WebMIDI
[░░░░░░░░░░░░░░░░░░░░]   0%  Fase 4: IA Sincronización & Plugin VST
```
