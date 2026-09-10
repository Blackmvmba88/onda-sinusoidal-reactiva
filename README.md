# Onda Sinusoidal Reactiva 🌊⚡

**Onda Sinusoidal Reactiva** es un ecosistema completo de visualización de audio en tiempo real, síntesis de señales senoidales y procesamiento digital (DSP). Combina un motor web reactivo en **React / Next.js** a pantalla completa con un conjunto de aplicaciones nativas en **Python** (Matplotlib, Rich, NumPy, SciPy y Web Audio API).

---

## 🌟 Características Principales

### 🌐 Interfaz Web Reactiva (React / Next.js)
- **Pantalla Completa Negro Absoluto (`#000000`):** Canvas fluido sin distracciones enfocado en la forma de onda.
- **Modos de Forma Dinámicos:**
  - **⚡ Modo Línea (`[Espacio]`):** Osciloscopio cartesiano horizontal con 12 capas de estela multicolor.
  - **🟢 Modo Círculo (`[o]` / `[O]`):** Osciloscopio polar en coordenadas circulares reactivo al audio.
  - **Limpieza Instantánea:** Vaciado inmediato de buffers al cambiar de modo para evitar trazos o líneas residuales cruzadas.
- **Panel de Edición Lateral Flotante:**
  - Menú desplegable semitransparente con efecto *glassmorphism* (*backdrop-filter blur*).
  - Ocultable / Mostrable con el botón `[⚙️ Panel de Edición]`.
- **Controles de Parámetros en Tiempo Real:**
  - **✨ Resplandor Neón (Sombra):** Ajuste de brillo neón (`shadowBlur`) de 0px a 30px.
  - **⏳ Persistencia Estela (Tiempo):** Duración de desvanecimiento de las 12 capas de degradado (80% a 98%).
  - **✏️ Grosor de Línea:** Trazo dinámico de 0.5px a 6.0px.
  - **🔊 Ganancia de Audio:** Sensibilidad de entrada de audio (0.2x a 4.0x).
  - **🎨 Velocidad de Color:** Frecuencia de mutación cromática.
  - **⭕ Radio Círculo:** Tamaño base en modo polar.
- **Paletas de Color Específicas:**
  - 🌈 **Psicodélico Arcoíris** (Ciclo HSV continuo)
  - ⚡ **Verde Neón Acid** (Cyberpunk `#b9ff38` y `#00ffcc`)
  - 💖 **Cyber Magenta & Cyan** (Synthwave Neón)
  - 🔥 **Fuego & Cálido** (Tonos cálidos y rojizos)
  - 🌊 **Océano & Azul Neón** (Azul marino y cian profundo)
- **Entrada de Audio:**
  - Soporte de micrófono en vivo vía **Web Audio API** (`AnalyserNode`).
  - Simulador sintético armónico automático si el micrófono no está activo.

### 🐍 Motores Nativos en Python
- **`visualizador_onda.py`:** Aplicación nativa en Matplotlib con 12 capas HSV y controles interactivos por teclado (`[o]` y `[espacio]`).
- **`ondasinusoidal.py`:** Analizador psicodélico con FFT, cálculo de amplitud RMS, decibelios y panel informativo en Rich.
- **`ondads.py`:** Osciloscopio de consola con barras espectrales del arcoíris en tiempo real.
- **`sinesoothe` (`ONDASINUS88`):** Motor de resonancia senoidal y relajación acústica con suite de pruebas `pytest`.

---

## ⌨️ Controles por Teclado

| Tecla | Acción |
|---|---|
| **`o`** / **`O`** | Cambiar a **Modo Círculo 🟢** (Coordenadas polares con limpieza de pantalla) |
| **`Espacio`** | Cambiar a **Modo Línea ⚡** (Coordenadas cartesianas con limpieza de pantalla) |

---

## 🚀 Ejecución del Proyecto

### 1. Aplicación Web React (Next.js)

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir **`http://localhost:3000`** en tu navegador.

### 2. Scripts Nativos en Python

```bash
# Crear e instalar entorno virtual con dependencias
python3 -m venv venv
source venv/bin/activate
pip install matplotlib scipy sounddevice numpy rich librosa pytest

# Ejecutar visualizador nativo Matplotlib (Línea / Círculo)
python3 visualizador_onda.py

# Ejecutar osciloscopio de consola con barras arcoíris
python3 /Volumes/BlackMamba\ Projects/Projects/02-Audio-DSP/ondadspai/ondads.py --no-ws
```

---

## 📁 Estructura del Código

```text
├── app/
│   ├── components/
│   │   ├── PsychedelicWaveReact.tsx   # Componente principal React con Canvas + Sliders Sleek
│   │   ├── CatalogGrid.tsx            # Grilla interactiva del catálogo de 13 proyectos
│   │   └── InteractiveWaveLab.tsx     # Laboratorio de pruebas Web Audio API
│   ├── layout.tsx                     # Layout raíz de Next.js
│   ├── page.tsx                       # Página principal
│   └── globals.css                    # Estilos CSS y temas oscuros
├── visualizador_onda.py               # Visualizador nativo Python (Matplotlib + Teclas 'o' y 'Espacio')
├── lanzador_ondas.py                  # Script ejecutor nativo para terminal
├── README.md                          # Documentación del proyecto
└── ROADMAP.md                         # Plan de desarrollo y próximas fases
```

---

## 🌌 Especificación procedural

La especificación de la waveform simétrica, luminosa y audioreactiva está documentada en:

**[`README_BLACKMAMBA_LUMINOUS_WAVEFORM.md`](README_BLACKMAMBA_LUMINOUS_WAVEFORM.md)**

Principio del motor:

> **La imagen no acompaña a la música: nace de ella.**

Pipeline conceptual:

```text
audio → waveform → geometry → organism → landscape → world
```

---

## 📜 Licencia

Desarrollado bajo la firma **BlackMamba RECORDS / Iyari Gomez (2026)**.
