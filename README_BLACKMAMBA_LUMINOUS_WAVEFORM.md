# 🌊 BLACKMAMBA LUMINOUS WAVEFORM

> **El audio no controla la animación.  
> El audio ES la geometría.**

Visualizador audioreactivo procedural para **BlackMamba RECORDS / Iyari Gomez**, basado en una onda horizontal simétrica que transforma amplitud, energía, transientes y contenido espectral en una estructura luminosa viva.

La intención visual es conservar la lectura clásica de una waveform, pero llevarla a un lenguaje **cinemático, orgánico, tridimensional y procedural**.

---

## 1. Identidad visual

La escena parte de una única línea horizontal central.

Desde ella emerge la señal:

```text
                     ╭────╮
            ╭──╮    │    │         ╭─────╮
────────────╯  ╰────╯    ╰─────────╯     ╰────────────
────────────╮  ╭────╮    ╭─────────╮     ╭────────────
            ╰──╯    │    │         ╰─────╯
                     ╰────╯
```

La geometría se refleja verticalmente alrededor del eje central:

```text
          +Y
           ↑
      waveform
           │
───────────┼───────────  CENTER LINE
           │
      waveform
           ↓
          -Y
```

Esto produce la sensación de que la música genera **cuerpos de energía** alrededor de una línea de equilibrio.

---

## 2. Regla principal

```text
AUDIO
  ↓
ANÁLISIS
  ↓
ENERGÍA
  ↓
GEOMETRÍA
  ↓
LUZ
  ↓
MOVIMIENTO
```

No utilizar una animación prefabricada sincronizada artificialmente.

Cada cuadro debe poder derivarse del estado real del audio.

> Si cambia la canción, cambia la estructura.

---

## 3. Características visuales

### Waveform simétrica

La amplitud se proyecta simultáneamente hacia arriba y hacia abajo.

```js
top    = centerY - amplitude
bottom = centerY + amplitude
```

La simetría mantiene una lectura limpia y permite que los picos fuertes se conviertan en grandes masas visuales.

### Línea central de energía

Una línea luminosa horizontal permanece como referencia constante.

```text
────────────────────────────────────────────
```

Debe reaccionar ligeramente a:

- RMS
- subgraves
- intensidad global
- silencios
- ataques

Puede aumentar brillo o grosor durante eventos energéticos.

---

## 4. Morfología

La onda no debe sentirse como un simple osciloscopio.

Cada región puede evolucionar hacia formas:

```text
onda
 ↓
pulso
 ↓
campana
 ↓
gota
 ↓
montaña
 ↓
cristal
 ↓
flor
 ↓
organismo
```

La señal permanece reconocible, pero la geometría puede adquirir volumen.

---

## 5. Estado audioreactivo

Estado mínimo recomendado:

```ts
interface ReactiveState {
  rms: number
  peak: number

  bass: number
  mids: number
  highs: number

  transient: number
  spectralCentroid: number

  silence: number
  energy: number

  time: number
}
```

---

## 6. Mapeo audio → imagen

| Audio | Visual |
|---|---|
| RMS | altura general |
| Peak | picos extremos |
| Bass | anchura / masa |
| Mids | deformación |
| Highs | detalle fino |
| Transient | explosión / impulso |
| Spectral centroid | brillo |
| Silence | contracción |
| Beat | respiración |

Ejemplo:

```js
height =
    rms * baseGain +
    transient * attackGain +
    bass * bassGain
```

---

## 7. Geometría

La forma puede construirse con cientos o miles de muestras.

```text
sample[0]
sample[1]
sample[2]
sample[3]
   ...
sample[n]
```

Cada muestra genera una columna vertical:

```text
        │
       ││
      │││
     ││││
─────┼┼┼┼─────
     ││││
      │││
       ││
        │
```

Al aumentar la densidad:

```text
||||||||||||||||||||||||||||||||||||||||||||
```

la waveform adquiere el aspecto continuo observado en la referencia.

---

## 8. Suavizado temporal

El audio directo produce demasiado ruido visual.

Usar interpolación:

```js
visualAmplitude +=
  (targetAmplitude - visualAmplitude) * smoothing;
```

Dos velocidades son ideales:

```js
attack  = 0.65
release = 0.08
```

Resultado:

```text
golpe → respuesta rápida
caída  → desaparición suave
```

---

## 9. Glow

Elemento fundamental del diseño.

Pipeline sugerido:

```text
Wave Geometry
      ↓
Primary Emission
      ↓
Bloom
      ↓
Gaussian Blur
      ↓
Additive Composite
      ↓
Final Frame
```

La onda debe poseer:

1. núcleo blanco;
2. cuerpo azul/cian;
3. halo azul;
4. bloom exterior.

Conceptualmente:

```text
        blue halo
     ─────────────
       cyan glow
       ─────────
         WHITE
          ││
          ││
```

---

## 10. Profundidad

Aunque la waveform sea vista frontalmente, puede contener profundidad Z.

```text
X = tiempo
Y = amplitud
Z = energía / frecuencia
```

Esto permite transformar posteriormente la misma señal en:

- túneles;
- montañas;
- ciudades;
- flores;
- océanos;
- organismos;
- terrenos;
- paisajes.

---

## 11. Cámara

Vista base:

```text
camera
   ↓

────────────────────────── waveform
```

Configuración recomendada:

```text
posición frontal
FOV reducido
centro perfectamente alineado
movimiento mínimo
```

Posteriormente:

```text
zoom
orbit
travel
micro-camera
macro-camera
```

---

## 12. Fondo

Base:

```text
#020714
#061126
#071A35
```

El fondo nunca debe competir con la onda.

Puede contener:

- gradiente radial;
- niebla;
- partículas mínimas;
- textura;
- iluminación volumétrica.

---

## 13. Estados visuales

### SILENCE

```text
──────────────────────────────
```

La onda prácticamente desaparece.

### LOW ENERGY

```text
──────╭─╮──╭──╮──╭─╮────────
```

### MUSIC

```text
────╭──╮╭────╮╭───╮╭────╮────
```

### TRANSIENT

```text
────────────╭████╮────────────
            ██████
────────────╰████╯────────────
```

### DROP

La onda puede ocupar gran parte del cuadro manteniendo el eje central estable.

---

## 14. Arquitectura

```text
┌───────────────────────────┐
│        AUDIO INPUT        │
└─────────────┬─────────────┘
              ↓
┌───────────────────────────┐
│      WebAudio / FFT       │
│ RMS / PEAK / TRANSIENTS   │
└─────────────┬─────────────┘
              ↓
┌───────────────────────────┐
│      REACTIVE STATE       │
└─────────────┬─────────────┘
              ↓
┌───────────────────────────┐
│   WAVEFORM GENERATOR      │
└─────────────┬─────────────┘
              ↓
┌───────────────────────────┐
│     GPU / WEBGL / GLSL    │
└─────────────┬─────────────┘
              ↓
┌───────────────────────────┐
│ GLOW / BLOOM / POST FX    │
└─────────────┬─────────────┘
              ↓
┌───────────────────────────┐
│        FINAL VIDEO        │
└───────────────────────────┘
```

---

## 15. Implementación sugerida

Stack web:

```text
Web Audio API
      +
AnalyserNode
      +
WebGL / Three.js
      +
GLSL
      +
requestAnimationFrame
```

Para máxima densidad:

```text
InstancedMesh
```

o directamente:

```text
custom BufferGeometry
+
vertex shader
```

---

## 16. Shader

El shader puede recibir:

```glsl
uniform float uTime;
uniform float uEnergy;
uniform float uBass;
uniform float uTransient;
uniform float uGlow;
```

Cada vértice:

```glsl
position.y *= uEnergy;
```

y posteriormente incorporar:

```glsl
noise
frequency deformation
phase displacement
depth
rotation
```

---

## 17. Escalamiento

Esta waveform constituye el **nivel cero** del motor procedural.

```text
LEVEL 0
waveform

LEVEL 1
volumetric waveform

LEVEL 2
organic waveform

LEVEL 3
procedural objects

LEVEL 4
landscape

LEVEL 5
world

LEVEL 6
world inside world
```

La arquitectura debe permitir entrar visualmente en cualquier región de la onda.

Al acercar la cámara:

```text
waveform
   ↓
estructura
   ↓
territorio
   ↓
ecosistema
```

---

## 18. Filosofía BLACKMAMBA

La señal no es decoración.

La señal es la materia prima.

```text
SONIDO
  =
DATOS
  =
FORMA
  =
ESPACIO
  =
MUNDO
```

Por lo tanto:

> **La imagen no acompaña a la música: nace de ella.**

---

## 19. Criterios de aceptación

La implementación base queda validada cuando:

- [ ] reproduce audio real;
- [ ] obtiene waveform real del buffer;
- [ ] mantiene simetría vertical;
- [ ] posee línea energética central;
- [ ] responde a RMS;
- [ ] responde a transientes;
- [ ] distingue graves/agudos;
- [ ] utiliza suavizado attack/release;
- [ ] el glow depende del audio;
- [ ] funciona a 60 FPS;
- [ ] mantiene sincronía audio/frame;
- [ ] permite pantalla completa;
- [ ] puede grabarse/renderizarse;
- [ ] la geometría puede reemplazarse sin modificar el analizador.

---

## 20. Evolución

La forma mostrada aquí es solamente el primer organismo.

```text
WAVE
 ↓
VOLUME
 ↓
FLOWER
 ↓
TERRAIN
 ↓
LANDSCAPE
 ↓
WORLD
```

El mismo `ReactiveState` debe poder alimentar todos ellos.

---

## BLACKMAMBA PROCEDURAL SYSTEM

**Iyari Gomez**  
**BlackMamba RECORDS**

```text
audio → waveform → geometry → organism → landscape → world
```

---

> **One song. One signal. One unique world.**
