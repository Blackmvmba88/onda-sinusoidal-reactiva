#!/usr/bin/env python3
import os
import sys
import subprocess

VENV_PYTHON = "/Users/blackmamba/Musica/sinu/venv/bin/python3"
PROJECTS_DIR = "/Volumes/BlackMamba Projects/Projects"

NATIVE_PROJECTS = [
    {
        "id": "1",
        "title": "nuevaonda / ondasinusoidal.py (Matplotlib + FFT + Panel Rich)",
        "path": f"{PROJECTS_DIR}/02-Audio-DSP/nuevaonda",
        "cmd": [VENV_PYTHON, "ondasinusoidal.py"],
        "info": "Captura de micrófono/señal con gráfico Matplotlib animado psicodélico y espectro FFT."
    },
    {
        "id": "2",
        "title": "ondadspai / ondads.py (Visualizador de Barras Arcoíris en Terminal)",
        "path": f"{PROJECTS_DIR}/02-Audio-DSP/ondadspai",
        "cmd": [VENV_PYTHON, "ondads.py", "--no-ws"],
        "info": "Barras espectrales de frecuencias arcoíris en consola con ganancia adaptativa."
    },
    {
        "id": "3",
        "title": "vozgemini / visualizador_onda.py (Onda con Estela Multicolor HSV)",
        "path": f"{PROJECTS_DIR}/03-IA/vozgemini",
        "cmd": [VENV_PYTHON, "visualizador_onda.py"],
        "info": "Onda de audio en vivo con 12 capas de estela multicolor en ventana Matplotlib."
    },
    {
        "id": "4",
        "title": "ONDASINUS88 / sinesoothe (Pruebas unitarias de Motor Python)",
        "path": f"{PROJECTS_DIR}/00-Inbox-Repos/ondasinus88",
        "cmd": [VENV_PYTHON, "-m", "pytest", "tests"],
        "env": {"PYTHONPATH": f"{PROJECTS_DIR}/00-Inbox-Repos/ondasinus88"},
        "info": "Motor sinesoothe de resonancia senoidal y mapa de reducción."
    },
    {
        "id": "5",
        "title": "nuevaonda / test_ondasinusoidal.py (Suite de Pruebas de Señal)",
        "path": f"{PROJECTS_DIR}/02-Audio-DSP/nuevaonda",
        "cmd": [VENV_PYTHON, "test_ondasinusoidal.py"],
        "info": "Pruebas de FFT, cálculo de RMS, decibelios y mapa de colores de frecuencia."
    },
    {
        "id": "6",
        "title": "USB-Legacy rainvow / test_ondads.py (Pruebas de Osciloscopio Terminal)",
        "path": f"{PROJECTS_DIR}/08-Archivo/USB-Legacy/rainvow",
        "cmd": [VENV_PYTHON, "tests/test_ondads.py"],
        "info": "Pruebas históricas del osciloscopio en terminal."
    }
]

def main():
    print("============================================================")
    print("  ONDA SINUSOIDAL REACTIVA — EJECUTOR NATIVO DE TERMINAL")
    print("============================================================\n")

    if not os.path.exists(PROJECTS_DIR):
        print("⚠️ ADVERTENCIA: La USB / sparsebundle no está montado.")
        print("Ejecuta: hdiutil attach '/Volumes/ADATA SC740/BlackMamba-Projects.sparsebundle'\n")
        return

    for opt in NATIVE_PROJECTS:
        status = "✓ Listo" if os.path.exists(opt["path"]) else "✗ No encontrado"
        print(f"  [{opt['id']}] {opt['title']} ({status})")
        print(f"      Ubicación: {opt['path']}")
        print(f"      {opt['info']}\n")

    if len(sys.argv) > 1:
        choice = sys.argv[1].strip()
    else:
        choice = input("Selecciona el proyecto nativo a ejecutar (1-6) o [Q] para salir: ").strip()

    if choice.lower() == 'q':
        sys.exit(0)

    selected = next((opt for opt in NATIVE_PROJECTS if opt["id"] == choice), None)
    if not selected:
        print("Opción inválida.")
        return

    print(f"\n🚀 Ejecutando nativamente: {selected['title']}...\n")
    os.chdir(selected["path"])
    
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    if "env" in selected:
        env.update(selected["env"])

    try:
        subprocess.run(selected["cmd"], env=env)
    except KeyboardInterrupt:
        print("\nEjecución finalizada.")

if __name__ == "__main__":
    main()
