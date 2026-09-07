import Link from "next/link";
import { VgeDemo } from "../../components/VgeDemo";

export const metadata = {
  title: "VGE Engine · Onda Sinusoidal",
  description: "Evaluación ejecutable del proyecto ondasinu.",
};

export default function OndasinuPage() {
  return (
    <main className="projectPage">
      <nav className="topbar">
        <Link href="/" className="brand">ONDA <span>SINUSOIDAL</span></Link>
        <Link href="/" className="backLink">← Volver al catálogo</Link>
      </nav>
      <div className="projectIntro">
        <div>
          <span className="indexTag">PROYECTO 01 · EN EVALUACIÓN</span>
          <h1>VGE Engine</h1>
          <p>
            Simulador de estados y optimización ampliado con una onda de micrófono en tiempo real.
            Puedes alternar entre el motor VGE y la entrada de audio del dispositivo.
          </p>
        </div>
        <div className="verdict warning">
          <span>Compatibilidad con el catálogo</span>
          <strong>Media</strong>
          <p>Conservado como experimento híbrido VGE + micrófono.</p>
        </div>
      </div>
      <VgeDemo />
      <section className="evidencePanel">
        <div><span>Pruebas</span><strong>5 aprobadas</strong></div>
        <div><span>Motor original</span><strong>Python 3.10+</strong></div>
        <div><span>Entrada adicional</span><strong>Web Audio API</strong></div>
        <div><span>Procedencia</span><strong>Blackmvmba88/ondasinu</strong></div>
      </section>
    </main>
  );
}
