# ONDA · BlackMamba Audio Lab

Aplicación macOS Apple Silicon basada en Matplotlib. Osciloscopio local con visualización línea/círculo, estelas cromáticas, ganancia, grosor, velocidad de color, nivel RMS digital en dBFS y pausa. El nivel no es una medición calibrada de presión sonora.

Abre ONDA.app y pulsa **Iniciar micrófono**. macOS solicitará autorización. Utiliza la entrada predeterminada configurada en Ajustes del Sistema → Sonido → Entrada. **Modo demo** genera una señal sintética identificada; no captura ni graba audio. O cambia a círculo, espacio a línea, P pausa.

## Construcción

Requiere macOS arm64, Python 3.14.7 y la identidad local de firma `BlackMamba ControlGame Local Signing` en el llavero. Esa identidad no se distribuye. Para otros equipos debe configurarse una identidad apropiada en ONDA.spec; no se instala ni confía ningún certificado automáticamente.

Desde la raíz del repositorio:

```sh
python3 -m venv .venv-native
.venv-native/bin/python -m pip install -r native/requirements-build.txt
PYTHON="$PWD/.venv-native/bin/python" native/build.sh
```

Salida: `native/dist/ONDA.app`. El paquete incluye Python y bibliotecas; la aplicación instalada no requiere activar un entorno virtual. Identificador estable: `corp.blackmamba.onda`. No utiliza red ni almacena audio.

Firma local, sin Developer ID ni notarización de Apple. El instalador está destinado a este Mac; no constituye una distribución notarizada para terceros. Las actualizaciones deben conservar identidad de firma, identificador y ruta de instalación para ayudar a preservar el permiso del micrófono.

## Comprobaciones

Preview reproducible sin hardware:

```sh
.venv-native/bin/python native/onda.py --demo --snapshot /tmp/onda-preview.png
```

El build verifica la firma con `codesign --verify --strict`. El acceso físico al micrófono de la app requiere la autorización interactiva normal de macOS.
