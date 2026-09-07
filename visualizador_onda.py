#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Visualizador de Audio en Tiempo Real — Modo Línea y Círculo con Sliders Interactivos.

Captura audio del micrófono (o simulador sintético) y despliega la señal.
Teclas de control:
  - Presiona 'o' o 'O' para cambiar a Modo CÍRCULO.
  - Presiona ' ' (espacio) para volver a Modo LÍNEA.

Sliders de control (en la parte inferior de la ventana):
  - Grosor de Línea
  - Ganancia / Amplitud de Audio
  - Velocidad de Cambio de Color
  - Radio Base para Modo Círculo
"""

import sys

try:
    import sounddevice as sd
except OSError as e:
    print(f"\n[FATAL] Error del sistema: {e}")
    print("Falta PortAudio. En macOS puedes instalarlo con:")
    print("    brew install portaudio\n")
    sys.exit(1)
except ImportError as e:
    print(f"\n[FATAL] Falta una dependencia: {e}")
    print("Instala con:")
    print("    pip install sounddevice numpy matplotlib\n")
    sys.exit(1)

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from matplotlib.colors import hsv_to_rgb
from matplotlib.widgets import Slider


DEVICE = None
CHANNELS = 1
SAMPLERATE = 44100
CHUNK = 2048

modo_simulador = False
modo_figura = "linea"  # "linea" o "circulo"

# Configuración de la figura y espacio para sliders
fig, ax = plt.subplots(figsize=(11, 8.5))
plt.subplots_adjust(bottom=0.28, top=0.92, left=0.06, right=0.94)

x = np.arange(0, CHUNK)
angles = np.linspace(0, 2 * np.pi, CHUNK)

trail_count = 12
trail_lines = []
buffer = np.zeros(CHUNK, dtype=np.float32)
trail_history = [np.zeros(CHUNK, dtype=np.float32) for _ in range(trail_count)]

# Crear ejes para Sliders de control
ax_color = "#151c17"
ax_lw = fig.add_axes([0.15, 0.18, 0.70, 0.03], facecolor=ax_color)
ax_gain = fig.add_axes([0.15, 0.13, 0.70, 0.03], facecolor=ax_color)
ax_color_speed = fig.add_axes([0.15, 0.08, 0.70, 0.03], facecolor=ax_color)
ax_radius = fig.add_axes([0.15, 0.03, 0.70, 0.03], facecolor=ax_color)

# Sliders interactivos de Matplotlib
slider_lw = Slider(ax_lw, "Grosor Línea", 0.5, 6.0, valinit=2.0, valfmt="%.1f px", color="#b9ff38")
slider_gain = Slider(ax_gain, "Ganancia Audio", 0.1, 4.0, valinit=1.0, valfmt="%.2f x", color="#00ffcc")
slider_color_speed = Slider(ax_color_speed, "Velocidad Color", 0.0, 0.05, valinit=0.01, valfmt="%.3f", color="#ff00a0")
slider_radius = Slider(ax_radius, "Radio Círculo", 0.2, 1.1, valinit=0.65, valfmt="%.2f r", color="#ffcc00")

# Estilar etiquetas de los sliders
for slider in [slider_lw, slider_gain, slider_color_speed, slider_radius]:
    slider.label.set_color("white")
    slider.valtext.set_color("white")
    slider.label.set_fontsize(10)
    slider.valtext.set_fontsize(10)


def limpiar_historial():
    """Limpia el buffer y el historial de estelas al cambiar de modo para evitar artefactos trazados."""
    global buffer, trail_history
    buffer.fill(0)
    trail_history = [np.zeros(CHUNK, dtype=np.float32) for _ in range(trail_count)]


def configurar_ejes(modo):
    """Limpia la pantalla y reconfigura los ejes según el modo (línea o círculo)."""
    limpiar_historial()
    ax.clear()
    ax.set_facecolor("black")
    fig.set_facecolor("#090d0b")
    plt.setp(ax, xticks=[], yticks=[])

    if modo == "circulo":
        ax.set_title("🟢 MODO CÍRCULO [o] | Presiona [Espacio] para Modo Línea", color="#00ffcc", fontsize=13, fontweight="bold")
        ax.set_xlim(-1.4, 1.4)
        ax.set_ylim(-1.4, 1.4)
        ax.set_aspect("equal", adjustable="box")
    else:
        ax.set_title("⚡ MODO LÍNEA [Espacio] | Presiona [o] para Modo Círculo", color="#b9ff38", fontsize=13, fontweight="bold")
        ax.set_xlim(0, CHUNK)
        ax.set_ylim(-1.1, 1.1)
        ax.set_aspect("auto")

    # Recrear líneas de la estela en el eje despejado
    global trail_lines
    trail_lines = []
    base_lw = slider_lw.val
    for i in range(trail_count):
        hue = (0.33 + i * 0.055) % 1.0
        color = hsv_to_rgb((hue, 1.0, 1.0))
        alpha = 0.95 * (1.0 - i / trail_count) ** 1.6
        lw = max(0.5, base_lw - i * 0.12)
        zorder = trail_count - i
        (line,) = ax.plot([], [], "-", lw=lw, color=color, alpha=alpha, zorder=zorder)
        trail_lines.append(line)


configurar_ejes(modo_figura)


def on_key_press(event):
    """Manejador de teclado: alterna modo y realiza una limpieza completa de estela."""
    global modo_figura
    key = event.key
    if key in ["o", "O"]:
        if modo_figura != "circulo":
            modo_figura = "circulo"
            configurar_ejes("circulo")
            fig.canvas.draw_idle()
    elif key in [" ", "space"]:
        if modo_figura != "linea":
            modo_figura = "linea"
            configurar_ejes("linea")
            fig.canvas.draw_idle()


fig.canvas.mpl_connect("key_press_event", on_key_press)


def audio_callback(indata, frames, time, status):
    """Recibe bloques de audio entrante y los almacena en el buffer."""
    global buffer
    data = indata[:, 0].astype(np.float32, copy=False)
    if len(data) >= CHUNK:
        buffer = data[-CHUNK:]
    else:
        buffer = np.roll(buffer, -len(data))
        buffer[-len(data):] = data


def update_plot(frame):
    """Renderiza la animación leyendo los sliders dinámicos de grosor, ganancia, color y radio."""
    global buffer, trail_history

    if modo_simulador:
        frecuencia = 220 + 110 * np.sin(frame / 40.0)
        amplitud = 0.5 + 0.25 * np.cos(frame / 60.0)
        t = np.arange(CHUNK) / SAMPLERATE
        buffer = amplitud * np.sin(2 * np.pi * frecuencia * t)

    # Aplicar ganancia del slider
    gain = slider_gain.val
    current_signal = buffer * gain

    # Actualizar historial
    trail_history = [current_signal.copy()] + trail_history[:-1]

    # Leer parámetros dinámicos de los sliders
    base_lw = slider_lw.val
    color_speed = slider_color_speed.val
    base_radius = slider_radius.val

    for i, line in enumerate(trail_lines):
        fade = 1.0 - i / max(1, trail_count - 1)
        hue = (frame * color_speed + i * 0.055) % 1.0
        line.set_color(hsv_to_rgb((hue, 1.0, 1.0)))

        # Actualizar grosor dinámicamente desde el slider
        lw = max(0.5, base_lw - i * 0.12)
        line.set_linewidth(lw)

        if modo_figura == "circulo":
            r_base = base_radius - i * 0.015
            sig = trail_history[i] * fade * 0.40
            r = r_base + sig
            px = r * np.cos(angles)
            py = r * np.sin(angles)
            line.set_data(px, py)
        else:
            offset = -0.02 * i
            line.set_data(x, trail_history[i] * fade + offset)

    return tuple(trail_lines)


stream = None
try:
    print("Iniciando captura de audio del micrófono...")
    stream = sd.InputStream(
        device=DEVICE,
        channels=CHANNELS,
        samplerate=SAMPLERATE,
        callback=audio_callback,
        blocksize=CHUNK,
    )
    stream.start()
    print("✓ Micrófono activo.")
except Exception as e:
    print(f"Advertencia: No se pudo iniciar el micrófono ({e}). Activando simulador de audio sintético.")
    modo_simulador = True

print("\n🎛️  CONTROLES E INTERFAZ:")
print("    [o]       → Cambiar a MODO CÍRCULO 🟢 (con limpieza de estela)")
print("    [espacio] → Cambiar a MODO LÍNEA ⚡ (con limpieza de estela)")
print("    Sliders   → Ajustar Grosor, Ganancia, Velocidad de Color y Radio en vivo\n")


def main():
    ani = FuncAnimation(fig, update_plot, interval=30, blit=True, cache_frame_data=False)
    try:
        plt.show()
    finally:
        if stream and stream.active:
            stream.stop()
            stream.close()
        print("Visualizador finalizado.")


if __name__ == "__main__":
    main()
