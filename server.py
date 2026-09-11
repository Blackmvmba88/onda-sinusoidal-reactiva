#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Servidor y Lanzador Principal — Onda Sinusoidal Reactiva

Uso:
    python3 server.py           -> Inicia el servidor web React en http://localhost:3000
    python3 server.py --python  -> Inicia el visualizador nativo en Python (Matplotlib + Teclas 'o' y 'Espacio')
"""

import os
import sys
import subprocess
import webbrowser
import threading
import time

def open_browser():
    time.sleep(1.8)
    try:
        webbrowser.open("http://localhost:3000")
    except Exception:
        pass

def main():
    print("============================================================")
    print("  ONDA SINUSOIDAL REACTIVA — SERVIDOR")
    print("============================================================\n")

    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)

    # Modo ejecutor nativo Python
    if "--python" in sys.argv or "--native" in sys.argv or "--cli" in sys.argv:
        print("🚀 Iniciando visualizador nativo en Python (Matplotlib)...")
        venv_python = os.path.join(base_dir, "venv", "bin", "python3")
        python_cmd = venv_python if os.path.exists(venv_python) else sys.executable
        subprocess.run([python_cmd, "visualizador_onda.py"])
        return

    # Modo servidor web React (Next.js)
    print("🌐 Arrancando servidor web React / Next.js...")
    print("👉 Abre en tu navegador: http://localhost:3000\n")
    print("Presiona Ctrl+C para detener el servidor.\n")

    threading.Thread(target=open_browser, daemon=True).start()

    try:
        subprocess.run(["npx", "next", "dev", "-p", "3000"])
    except KeyboardInterrupt:
        print("\n✓ Servidor web detenido.")

if __name__ == "__main__":
    main()
