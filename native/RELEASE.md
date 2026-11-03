# ONDA 1.1.0 · actualización local

- Instalación estable: `/Applications/ONDA.app` (arm64).
- Build: `PYTHON=/Users/blackmamba/Downloads/apollo-ai/venv/bin/python native/build.sh`.
- Firma: certificado local BlackMamba ControlGame Local Signing; identificador `corp.blackmamba.onda`, requisito anclado al certificado `59f352c35a520fc8e1b425b6b18777c8ba40b0e9`.
- Recuperación de 1.0: `~/Library/Application Support/BlackMamba/ONDA/recovery/1.0.0-20261103/ONDA.app`.
- Datos: preferencias JSON fuera del bundle; no se revierte el archivo al restaurar el ejecutable.
- Verificación: cuatro temas × cuatro texturas; pies editados; validación de color HEX; guardar y recargar; recuperación de JSON corrupto; demo, círculo y pausa.
- Firma local sin notarización. El micrófono físico requiere permiso normal de macOS.

## 1.2.0 · animación

Rasterización mediana antes: 65.62 ms línea / 63.63 ms círculo. Después: 4.89 / 3.60 ms en el mismo tamaño. Temporizador nativo: mediana 16.06 ms, p95 18.25 ms durante 180 cuadros de demo. No es una medición de FPS de presentación ni latencia física del micrófono.

Candidato empaquetado abierto y ventana inspeccionada. Caché, invalidación de tema/tamaño, círculo de 2048 puntos, bloques de audio 512→2048 y pausa verificados. Misma firma y requisito designado que 1.1.1. Recuperación: `~/Library/Application Support/BlackMamba/ONDA/recovery/1.1.1-before-performance/ONDA.app`.
