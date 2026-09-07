import { InteractiveWaveLab } from "../../components/InteractiveWaveLab";

type Props = {
  params: Promise<{ id: string }>;
};

const PROJECT_TITLES: Record<string, { title: string; repo: string; description: string }> = {
  ondasinu: {
    title: "VGE Engine (ondasinu)",
    repo: "Blackmvmba88/ondasinu",
    description: "Simulador de estados y optimización ampliado con visualización de micrófono en vivo."
  },
  ONDASINUS88: {
    title: "ONDASINUS88 (sinesoothe)",
    repo: "Blackmvmba88/ONDASINUS88",
    description: "Sintetizador y oscilador senoidal relajante con ajuste fino de frecuencia Hz y ganancia."
  },
  "rainbow-mic-scope": {
    title: "rainbow-mic-scope",
    repo: "Blackmvmba88/rainbow-mic-scope",
    description: "Osciloscopio gráfico circular alimentado por micrófono con respuesta multicolor."
  },
  ondasinusoidal: {
    title: "ondasinusoidal",
    repo: "Blackmvmba88/ondasinusoidal",
    description: "Generador senoidal puro con síntesis y combinación de armónicos fundamental y superiores."
  },
  OndaNew: {
    title: "OndaNew",
    repo: "Blackmvmba88/OndaNew",
    description: "Visualizador senoidal interactivo con controles de velocidad, amplitud y frecuencia."
  },
  OndaSinusoidalRainbow: {
    title: "OndaSinusoidalRainbow",
    repo: "Blackmvmba88/OndaSinusoidalRainbow",
    description: "Osciloscopio en consola ANSI Rainbow adaptable a dispositivos móviles y Termux."
  },
  epic_sinewave_benchmarks: {
    title: "epic_sinewave_benchmarks",
    repo: "Blackmvmba88/epic_sinewave_benchmarks",
    description: "Pruebas de velocidad, tasa de refresco FPS y costo computacional de ondas."
  },
  osciloscopio: {
    title: "osciloscopio",
    repo: "Blackmvmba88/osciloscopio",
    description: "Procesador de señales DSP con filtros pasa-bajas, pasa-altas y grilla de precisión."
  },
  "oscilloscope-project": {
    title: "oscilloscope-project",
    repo: "Blackmvmba88/oscilloscope-project",
    description: "Osciloscopio digital libre con cuadrícula de división de voltaje e integración de hardware."
  },
  nuevaonda: {
    title: "nuevaonda",
    repo: "Blackmvmba88/nuevaonda",
    description: "Comparador senoidal dual de desfase angular y fase de señal."
  },
  Analizador: {
    title: "Analizador de Onda",
    repo: "Blackmvmba88/Analizador",
    description: "Analizador de frecuencias FFT y espectrograma de sonido."
  },
  "rainbow-wave-visualizer": {
    title: "rainbow-wave-visualizer",
    repo: "Blackmvmba88/rainbow-wave-visualizer",
    description: "Visualizador espectral en tiempo real con degradados neón y reactivos al ritmo."
  },
  "onda3d-ondadspai": {
    title: "onda3d & ondadspai",
    repo: "Projects/02-Audio-DSP/onda3d",
    description: "Procesamiento de audio espacial 3D y modelos DSP generativos de ondas."
  }
};

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const info = PROJECT_TITLES[id] || {
    title: `Proyecto ${id}`,
    repo: `Blackmvmba88/${id}`,
    description: "Motor interactivo de onda sinusoidal ejecutable en tiempo real."
  };

  return (
    <InteractiveWaveLab
      projectId={id}
      title={info.title}
      repo={info.repo}
      description={info.description}
    />
  );
}
