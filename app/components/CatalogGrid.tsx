"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export type ProjectItem = {
  id: string;
  num: string;
  name: string;
  status: string;
  category: "principal" | "web" | "python" | "dsp";
  tags: string[];
  description: string;
  repo: string;
  executableUrl: string;
  verdict?: string;
};

const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "ondasinu",
    num: "01",
    name: "VGE Engine (ondasinu)",
    status: "EN EVALUACIÓN",
    category: "web",
    tags: ["Python", "Micrófono", "Simulación", "Web Audio"],
    description: "Motor de estados y optimización dinámico acoplado a un osciloscopio de audio en vivo.",
    repo: "Blackmvmba88/ondasinu",
    executableUrl: "/projects/ondasinu",
    verdict: "Funcional; ampliado con entrada de micrófono en tiempo real."
  },
  {
    id: "ONDASINUS88",
    num: "02",
    name: "ONDASINUS88 (sinesoothe)",
    status: "PRINCIPAL",
    category: "python",
    tags: ["Python", "sinesoothe", "CLI", "WebUI"],
    description: "Generador y sintetizador de sonido relajante en Python basado en ondas senoidales puras.",
    repo: "Blackmvmba88/ONDASINUS88",
    executableUrl: "/projects/ONDASINUS88",
    verdict: "Motor completo con sintetizador de tonos y pruebas automáticas."
  },
  {
    id: "rainbow-mic-scope",
    num: "03",
    name: "rainbow-mic-scope",
    status: "PRINCIPAL",
    category: "web",
    tags: ["Web Audio API", "Circular Scope", "Micrófono", "Canvas"],
    description: "Osciloscopio visualizador de forma de onda circular alimentado por la entrada de micrófono.",
    repo: "Blackmvmba88/rainbow-mic-scope",
    executableUrl: "/projects/rainbow-mic-scope",
    verdict: "Visualizador gráfico circular con degradados multicolor."
  },
  {
    id: "ondasinusoidal",
    num: "04",
    name: "ondasinusoidal",
    status: "BASE ALGORÍTMICA",
    category: "python",
    tags: ["Python", "NumPy", "Pruebas", "Matemáticas"],
    description: "Implementación matemática de cálculo de formas de onda sinusoidales, armónicos y fase.",
    repo: "Blackmvmba88/ondasinusoidal",
    executableUrl: "/projects/ondasinusoidal",
    verdict: "Módulo base con generador de armónicos fundamental y superiores."
  },
  {
    id: "OndaNew",
    num: "05",
    name: "OndaNew",
    status: "VISUALIZADOR WEB",
    category: "web",
    tags: ["HTML5 Canvas", "JavaScript", "Sine Wave", "CSS3"],
    description: "Visualizador web interactivo con ajuste dinámico de frecuencia, amplitud y velocidad.",
    repo: "Blackmvmba88/OndaNew",
    executableUrl: "/projects/OndaNew",
    verdict: "Interfaz fluida para ajustar parámetros de onda sinusoidal."
  },
  {
    id: "OndaSinusoidalRainbow",
    num: "06",
    name: "OndaSinusoidalRainbow",
    status: "TERMUX / MOBILE",
    category: "dsp",
    tags: ["Python", "Termux", "ANSI Rainbow", "Terminal"],
    description: "Adaptación del motor de onda con renderizado de caracteres ANSI en color rainbow para Android.",
    repo: "Blackmvmba88/OndaSinusoidalRainbow",
    executableUrl: "/projects/OndaSinusoidalRainbow",
    verdict: "Osciloscopio ligero optimizado para entornos de terminal."
  },
  {
    id: "epic_sinewave_benchmarks",
    num: "07",
    name: "epic_sinewave_benchmarks",
    status: "BENCHMARKS",
    category: "dsp",
    tags: ["Performance", "C++ / Python", "FPS", "Costo GPU"],
    description: "Suite de pruebas de rendimiento, FPS y costo computacional del renderizado senoidal.",
    repo: "Blackmvmba88/epic_sinewave_benchmarks",
    executableUrl: "/projects/epic_sinewave_benchmarks",
    verdict: "Métricas de consumo de memoria y medidor de FPS en vivo."
  },
  {
    id: "osciloscopio",
    num: "08",
    name: "osciloscopio",
    status: "PROCESAMIENTO",
    category: "dsp",
    tags: ["DSP", "Filtrado", "Espectro", "WAV"],
    description: "Sistema de adquisición de señales, filtrado pasa-bajas/pasa-altas y exportación de espectros.",
    repo: "Blackmvmba88/osciloscopio",
    executableUrl: "/projects/osciloscopio",
    verdict: "Filtro pasa-bajas y pasa-altas con perillas ajustables."
  },
  {
    id: "oscilloscope-project",
    num: "09",
    name: "oscilloscope-project",
    status: "HARDWARE + SOFTWARE",
    category: "dsp",
    tags: ["Hardware Libre", "ADC", "Sensores", "Osciloscopio"],
    description: "Proyecto de osciloscopio digital abierto integrado con lecturas de hardware físico.",
    repo: "Blackmvmba88/oscilloscope-project",
    executableUrl: "/projects/oscilloscope-project",
    verdict: "Grilla de precisión de osciloscopio analógico de laboratorio."
  },
  {
    id: "nuevaonda",
    num: "10",
    name: "nuevaonda",
    status: "CORE DSP",
    category: "python",
    tags: ["Python 3.12", "unittest", "Gráficas"],
    description: "Iteración limpia de generación senoidal con soporte para exportación gráfica y análisis de fase.",
    repo: "Blackmvmba88/nuevaonda",
    executableUrl: "/projects/nuevaonda",
    verdict: "Comparador de desfase angular y fases duales."
  },
  {
    id: "Analizador",
    num: "11",
    name: "Analizador de Onda",
    status: "ESPECTRO",
    category: "dsp",
    tags: ["FFT", "Frecuencia", "Espectrograma", "Audio"],
    description: "Analizador de forma de onda completo con transformación de Fourier y mapa espectral.",
    repo: "Blackmvmba88/Analizador",
    executableUrl: "/projects/Analizador",
    verdict: "Análisis espectral y descomposición de frecuencias."
  },
  {
    id: "rainbow-wave-visualizer",
    num: "12",
    name: "rainbow-wave-visualizer",
    status: "AUDIO VISUAL",
    category: "web",
    tags: ["WebGL", "Shaders", "Rainbow Wave", "Ritmo"],
    description: "Renderizador de ondas en tiempo real con degradados dinámicos y reactivos al ritmo.",
    repo: "Blackmvmba88/rainbow-wave-visualizer",
    executableUrl: "/projects/rainbow-wave-visualizer",
    verdict: "Efectos visuales reactivos mediante gradientes en tiempo real."
  },
  {
    id: "onda3d-ondadspai",
    num: "13",
    name: "onda3d & ondadspai",
    status: "AUDIO 3D & IA",
    category: "dsp",
    tags: ["TypeScript", "Node.js", "Audio 3D", "IA DSP"],
    description: "Monorepo local de procesamiento espacial de audio 3D e integración de modelos DSP con IA.",
    repo: "Projects/02-Audio-DSP/onda3d",
    executableUrl: "/projects/onda3d-ondadspai",
    verdict: "Procesamiento espacial 3D y modelos generativos de audio."
  }
];

export function CatalogGrid() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "web" | "python" | "dsp">("all");
  const [activeModal, setActiveModal] = useState<ProjectItem | null>(null);

  const filteredProjects = useMemo(() => {
    return PROJECTS_DATA.filter((p) => {
      const matchCat = filter === "all" || p.category === filter;
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.repo.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [query, filter]);

  return (
    <section className="catalogSection">
      <div className="sectionHeading">
        <div>
          <span className="eyebrow">Catálogo 100% Ejecutable</span>
          <h2>Todos los proyectos de ondas ({PROJECTS_DATA.length})</h2>
        </div>
        <span className="count">
          {String(filteredProjects.length).padStart(2, "0")} / {PROJECTS_DATA.length}
        </span>
      </div>

      <div className="filterBar">
        <input
          type="text"
          placeholder="Buscar por nombre, tecnología o repositorio..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="searchInput"
        />
        <div className="filterChips">
          <button
            className={`chip ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Todos ({PROJECTS_DATA.length})
          </button>
          <button
            className={`chip ${filter === "web" ? "active" : ""}`}
            onClick={() => setFilter("web")}
          >
            Web & Micrófono
          </button>
          <button
            className={`chip ${filter === "python" ? "active" : ""}`}
            onClick={() => setFilter("python")}
          >
            Python & Motores
          </button>
          <button
            className={`chip ${filter === "dsp" ? "active" : ""}`}
            onClick={() => setFilter("dsp")}
          >
            DSP & Hardware
          </button>
        </div>
      </div>

      <div className="projectGrid">
        {filteredProjects.map((project) => (
          <article
            key={project.id}
            className="projectCard candidate"
          >
            <div className="cardTop">
              <span>{project.num}</span>
              <span className="reviewBadge">{project.status}</span>
            </div>

            <div className="miniScope">
              <span />
            </div>

            <h3>{project.name}</h3>
            <p>{project.description}</p>

            <div className="cardMeta">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className="cardFooter">
              <button
                className="detailButton"
                onClick={() => setActiveModal(project)}
              >
                Ficha info
              </button>
              <Link href={project.executableUrl} className="launchLink">
                Abrir y ejecutar <span>↗</span>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {activeModal && (
        <div className="modalOverlay" onClick={() => setActiveModal(null)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div>
                <span className="indexTag">PROYECTO {activeModal.num}</span>
                <h2>{activeModal.name}</h2>
              </div>
              <button className="closeModal" onClick={() => setActiveModal(null)}>
                ✕
              </button>
            </div>

            <div className="modalBody">
              <p><strong>Descripción:</strong> {activeModal.description}</p>
              <p><strong>Repositorio / Ruta:</strong> <code>{activeModal.repo}</code></p>
              <p><strong>Estado en catálogo:</strong> {activeModal.status}</p>
              <p><strong>Veredicto técnico:</strong> {activeModal.verdict}</p>

              <div className="cardMeta">
                {activeModal.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>

            <div className="modalFooter" style={{ gap: "10px" }}>
              <button className="secondaryButton" onClick={() => setActiveModal(null)}>
                Cerrar
              </button>
              <Link
                href={activeModal.executableUrl}
                className="primaryButton"
                onClick={() => setActiveModal(null)}
              >
                Ejecutar ahora ↗
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
