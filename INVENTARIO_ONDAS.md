# Inventario formal de proyectos de ondas

**Cuenta GitHub:** `Blackmvmba88`  
**Equipo local:** Mac de `blackmambarecords`  
**Fecha de corte:** 2026-07-18  
**Estado del inventario:** verificado mediante GitHub CLI, Git local, búsqueda por nombres y búsqueda de contenido.

## 1. Criterio y alcance

Este inventario reúne proyectos y componentes relacionados con ondas sinusoidales, visualización de formas de onda, osciloscopios y análisis de señales.

La clasificación es:

- **Principal:** el proyecto está dedicado explícitamente a ondas, seno, visualización de señal u osciloscopio.
- **Relacionado:** la onda es un componente de una aplicación más amplia.
- **Referencia:** el término aparece en documentación, catálogos o datos, pero no define el producto.

Se excluyeron dependencias, entornos virtuales, cachés, compilaciones y archivos generados.

## 2. Inventario GitHub

### 2.1 Repositorios principales

| # | Repositorio | Visibilidad | Última actualización | Clasificación | Evidencia | Confianza |
|---:|---|---|---|---|---|---|
| 1 | [ondasinu](https://github.com/Blackmvmba88/ondasinu) | Privado | 2026-06-28 | En evaluación | El código es VGE Engine, no un generador sinusoidal | Alta |
| 2 | [ONDASINUS88](https://github.com/Blackmvmba88/ONDASINUS88) | Público | 2026-06-11 | Principal | Motor Python `sinesoothe`, CLI, WebUI y pruebas | Alta |
| 3 | [rainbow-mic-scope](https://github.com/Blackmvmba88/rainbow-mic-scope) | Público | 2026-06-02 | Principal | Osciloscopio de micrófono, forma de onda circular y WebUI | Alta |
| 4 | [ondasinusoidal](https://github.com/Blackmvmba88/ondasinusoidal) | Público | 2026-05-28 | Principal | Implementación `ondasinusoidal.py`, pruebas y documentación | Alta |
| 5 | [OndaNew-main](https://github.com/Blackmvmba88/OndaNew-main) | Privado | 2026-04-15 | Principal | Nombre explícito | Media |
| 6 | [OndaNew](https://github.com/Blackmvmba88/OndaNew) | Público | 2026-04-13 | Principal | Visualizador web y referencias directas a `sine wave` | Alta |
| 7 | [OndaSinusoidalRainbow](https://github.com/Blackmvmba88/OndaSinusoidalRainbow) | Público | 2026-04-12 | Principal | Implementación `ondads_termux.py` y README | Alta |
| 8 | [epic_sinewave_benchmarks](https://github.com/Blackmvmba88/epic_sinewave_benchmarks) | Privado | 2026-02-25 | Principal | Benchmarks del Epic Sinewave Visualizer | Alta |
| 9 | [osciloscopio](https://github.com/Blackmvmba88/osciloscopio) | Público | 2026-01-18 | Principal | Adquisición, visualización, filtrado y exportación de señales | Alta |
| 10 | [oscilloscope-project](https://github.com/Blackmvmba88/oscilloscope-project) | Privado | 2026-01-12 | Principal | Osciloscopio abierto de hardware y software | Alta |
| 11 | [nuevaonda](https://github.com/Blackmvmba88/nuevaonda) | Público | 2026-01-09 | Principal | Nombre explícito; repositorio sin rama predeterminada detectada | Media |
| 12 | [Analizador](https://github.com/Blackmvmba88/Analizador) | Público | 2025-12-08 | Principal | Descripción: `Analizador de onda completo` | Alta |
| 13 | [rainbow-wave-visualizer](https://github.com/Blackmvmba88/rainbow-wave-visualizer) | Privado | 2025-10-29 | Principal | Nombre explícito y README con referencias sinusoidales | Alta |

### 2.2 Repositorios GitHub relacionados por código

Estos repositorios no son exclusivamente de ondas, pero contienen implementaciones o documentación relevante:

| Repositorio | Evidencia localizada | Clasificación |
|---|---|---|
| `fire` | `app/ui/sine_scope.py`, `scripts/sine_wave_rainbow.py`, pruebas FFT | Relacionado |
| `Music` | `src/app/AudioVisualizer.tsx` y visualizador heredado | Relacionado |
| `ReproductorAlecksey` | `audio_visualizer.py`, documentación y quickstart | Relacionado |
| `XarvisCore` | Laboratorio de audio 3D y lanzadores de ecualizador | Relacionado |
| `Oscar` | Referencias en README y ROADMAP | Referencia |
| `JesusTorres` | README y Makefile con referencias sinusoidales | Referencia |
| `MicrofonoGenesis` | Guías de ensamblaje y calibración | Relacionado |
| `virtualdj-automation` | Análisis semántico con señales sinusoidales | Relacionado |
| `reproductornuevo` | Visuales Hydra basados en ondas | Relacionado |
| `rainboe_av` | Generación de onda en `main.py` | Relacionado |

## 3. Inventario local en la Mac

### 3.1 Proyectos principales

| # | Ruta | Tipo | Remoto | Estado | Confianza | Advertencias / fallback |
|---:|---|---|---|---|---|---|
| 1 | `/Users/blackmambarecords/Projects/02-Audio-DSP/ONDASINUS88` | Python, CLI y WebUI | `Blackmvmba88/ONDASINUS88` | Checkout Git limpio; commit remoto identificado | Alta | Es la copia local más limpia y pequeña |
| 2 | `/Users/blackmambarecords/ONDASINUS88` | Python, CLI y WebUI | `Blackmvmba88/ONDASINUS88` | Misma base Git; contiene una carpeta anidada no registrada | Alta | No borrar: alberga otra copia con cambios locales |
| 3 | `/Users/blackmambarecords/ONDASINUS88/ONDASINUS88` | Python, CLI y tiempo real | `Blackmvmba88/ONDASINUS88` | Cambios en `pyproject.toml`, CLI y motor; nuevo `sinesoothe/live.py` | Alta | Trabajo local sin subir; debe preservarse antes de consolidar |
| 4 | `/Users/blackmambarecords/Projects/02-Audio-DSP/onda3d` | Monorepo TypeScript/Node | Sin remoto | Git inicializado; archivos del proyecto sin registrar | Alta | No existe respaldo remoto confirmado |
| 5 | `/Users/blackmambarecords/Projects/02-Audio-DSP/ondadspai` | Python | Sin remoto | Git inicializado; fuente y documentación sin registrar | Alta | No existe respaldo remoto confirmado |
| 6 | `/Users/blackmambarecords/Projects/01-Fundamentos/New-project-3` | Python, micrófono y visualización | Sin remoto | Contiene `rainbow_mic_sine.py`; archivo sin registrar | Alta | Gran parte del tamaño corresponde a `.venv` |

### 3.2 Componentes locales relacionados

| Ruta | Función | Clasificación | Confianza |
|---|---|---|---|
| `/Users/blackmambarecords/Projects/03-IA/vozgemini/visualizador_onda.py` | Visualización de onda dentro del proyecto de voz | Relacionado | Alta |
| `/Users/blackmambarecords/Projects/02-Audio-DSP/karaoke/src/components/Waveform.tsx` | Componente de waveform para karaoke | Relacionado | Alta |
| `/Users/blackmambarecords/Projects/02-Audio-DSP/Music/src/app/AudioVisualizer.tsx` | Visualizador de audio | Relacionado | Alta |
| `/Users/blackmambarecords/Documents/Reproductor/src/app/App.tsx` | Reproductor con comportamiento visual de onda | Relacionado | Media |
| `/Users/blackmambarecords/Documents/Music 2/espectro.py` | Espectro y análisis visual de audio | Relacionado | Media |
| `/Users/blackmambarecords/Projects/02-Audio-DSP/escriturasound/src/web/pages/PlayerThemes.tsx` | Tema visual con referencias de onda | Relacionado | Media |
| `/Users/blackmambarecords/Documents/Afinador de guitrra electrica/web/public/waveform.png` | Recurso gráfico de forma de onda | Recurso | Alta |
| `/Users/blackmambarecords/Documents/virtual/public/waveform.png` | Recurso gráfico de forma de onda | Recurso | Alta |

### 3.3 Coincidencias descartadas como proyectos

- Archivos dentro de `node_modules`, `.venv`, `venv`, `__pycache__`, `dist` y `build`.
- Datos de canciones cuyo texto contiene `sine wave` o `sinusoidal`.
- SDKs y paquetes de terceros.
- Imágenes `waveform.png` duplicadas en carpetas de compilación.

## 4. Correspondencia GitHub ↔ Mac

| Proyecto GitHub | Copia local confirmada | Estado de correspondencia |
|---|---|---|
| `ONDASINUS88` | Tres niveles/copias locales | Confirmado por remoto Git y commit común |
| `rainbow-mic-scope` | Posible derivado en `New-project-3/rainbow_mic_sine.py` | No confirmado: el proyecto local no tiene remoto |
| `ondasinusoidal` | No localizada por nombre o remoto | Solo GitHub |
| `ondasinu` | No localizada por remoto | Solo GitHub; podría relacionarse con `ondadspai` |
| `OndaNew-main` | No localizada | Solo GitHub |
| `OndaNew` | No localizada | Solo GitHub |
| `OndaSinusoidalRainbow` | No localizada | Solo GitHub |
| `epic_sinewave_benchmarks` | No localizada | Solo GitHub |
| `osciloscopio` | No localizada | Solo GitHub |
| `oscilloscope-project` | No localizada | Solo GitHub |
| `nuevaonda` | No localizada | Solo GitHub |
| `Analizador` | No localizada | Solo GitHub |
| `rainbow-wave-visualizer` | No localizada | Solo GitHub |
| Sin repositorio GitHub confirmado | `onda3d` | Solo Mac |
| Sin repositorio GitHub confirmado | `ondadspai` | Solo Mac |

## 5. Riesgos y acciones recomendadas

1. **Preservar cambios:** respaldar o publicar primero `/Users/blackmambarecords/ONDASINUS88/ONDASINUS88`.
2. **Resolver duplicación:** comparar las tres ubicaciones de `ONDASINUS88` y elegir una copia canónica.
3. **Conectar proyectos locales:** decidir si `onda3d` y `ondadspai` corresponden a repositorios existentes antes de crear repositorios nuevos.
4. **Evitar equivalencias por nombre:** `rainbow_mic_sine.py` parece relacionado con `rainbow-mic-scope`, pero no hay evidencia Git suficiente para declararlos idénticos.
5. **Clonar solo cuando sea necesario:** los repositorios marcados como “Solo GitHub” no están ausentes del ecosistema; únicamente no se detectó una copia local en las rutas revisadas.

## 6. Resumen cuantitativo

- **12 repositorios GitHub principales y 1 candidato en evaluación.**
- **10 repositorios GitHub relacionados o de referencia documentados.**
- **6 ubicaciones locales principales**, incluyendo duplicados/anidamientos.
- **8 componentes o recursos locales relacionados.**
- **1 correspondencia GitHub ↔ Mac confirmada:** `ONDASINUS88`.
- **2 proyectos locales sin remoto confirmado:** `onda3d` y `ondadspai`.

## 7. Límite de verificación

La búsqueda local cubrió `/Users/blackmambarecords/Documents`, `/Users/blackmambarecords/Desktop`, `/Users/blackmambarecords/Downloads`, `/Users/blackmambarecords/Projects` y coincidencias indexadas por Spotlight bajo el usuario. Un volumen externo no montado, una carpeta no indexada o contenido con nombres y texto completamente ajenos a ondas puede quedar fuera del inventario.
