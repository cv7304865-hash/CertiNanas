import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from './ui/Banner';

type Curso = {
  Id: number; Titulo: string; Descripcion: string; TipoContenido: string;
  UrlContenido: string; DuracionMinutos: number; Categoria: string;
  totalEvaluaciones: number;
};

type Evaluacion = {
  Id: number; Pregunta: string; TipoRespuesta: string;
  Opciones: string; RespuestaCorrecta: string; Orden: number;
};

type Progreso = {
  Id: number; IdCapacitacion: number; Titulo: string;
  PuntajeObtenido: number; Aprobado: number; CertificadoGenerado: number;
  FechaCompletado: string;
};

export function CentroCapacitacion() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [progreso, setProgreso] = useState<Progreso[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/capacitacion/cursos', { headers })
      .then(r => r.json()).then(setCursos).catch(() => {});
    fetch(`/api/capacitacion/progreso/1`, { headers })
      .then(r => r.json())
      .then(data => setProgreso(data.progreso || []))
      .catch(() => {});
  }, []);

  const abrirCurso = async (curso: Curso) => {
    setSelectedCurso(curso);
    setRespuestas({});
    setMessage(null);
    try {
      const r = await fetch(`/api/capacitacion/curso/${curso.Id}`, { headers });
      const data = await r.json();
      setEvaluaciones(data.evaluaciones || []);
    } catch {
      setEvaluaciones([]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCurso || evaluaciones.length === 0) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const respuestasArr = Object.entries(respuestas).map(([orden, respuesta]) => ({
        orden: Number(orden) + 1, respuesta,
      }));
      const r = await fetch('/api/capacitacion/evaluacion/responder', {
        method: 'POST',
        headers,
        body: JSON.stringify({ IdCapacitacion: selectedCurso.Id, respuestas: respuestasArr }),
      });
      const data = await r.json();
      if (r.ok) {
        setMessage({
          type: data.aprobado ? 'success' : 'danger',
          text: data.aprobado
            ? `¡Aprobado! Puntaje: ${data.puntaje}% (${data.aciertos}/${data.total})`
            : `No aprobado. Puntaje: ${data.puntaje}% (${data.aciertos}/${data.total}). Mínimo requerido: 70%`,
        });
        setSelectedCurso(null);
        const prog = await fetch(`/api/capacitacion/progreso/1`, { headers }).then(r => r.json());
        setProgreso(prog.progreso || []);
      } else {
        setMessage({ type: 'danger', text: data.error || 'Error al enviar evaluación' });
      }
    } catch {
      setMessage({ type: 'danger', text: 'Error de conexión' });
    }
    setSubmitting(false);
  };

  const allAnswered = evaluaciones.length > 0 && evaluaciones.every(e => respuestas[e.Orden - 1] !== undefined);

  const iconMap: Record<string, string> = { Video: '🎬', PDF: '📄', Manual: '📘', CasoPractico: '📋' };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Centro de Capacitación</h2>
      <p className="text-sm text-[#6667AB] mb-6">Mejora tus habilidades con nuestros cursos certificados</p>

      {message && (
        <div className="mb-4">
          <Banner variant={message.type} onClose={() => setMessage(null)}>{message.text}</Banner>
        </div>
      )}

      {progreso.length > 0 && (
        <div className="mb-6 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
          <h3 className="text-xs font-bold text-[#F6A5C0] uppercase tracking-wider mb-3">Mis Certificaciones</h3>
          <div className="space-y-2">
            {progreso.filter(p => p.Aprobado).map(p => (
              <div key={p.Id} className="flex items-center gap-3 bg-[rgba(16,185,129,0.1)] rounded-xl px-4 py-2.5">
                <span className="text-[#6EE7B7] text-sm">✓</span>
                <span className="text-white text-sm flex-1">{p.Titulo}</span>
                <span className="text-[#6EE7B7] text-[10px] font-bold">{p.PuntajeObtenido}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cursos.map(curso => {
          const completado = progreso.find(p => p.IdCapacitacion === curso.Id);
          return (
            <motion.div key={curso.Id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 cursor-pointer hover:border-[rgb(246,165,192,0.3)] transition-all"
              onClick={() => !completado && abrirCurso(curso)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(246,165,192,0.15)] flex items-center justify-center text-xl">
                  {iconMap[curso.TipoContenido] || '📚'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white text-sm font-bold">{curso.Titulo}</h3>
                    {completado && (
                      <span className="text-[#6EE7B7] text-[10px] font-bold bg-[rgba(16,185,129,0.15)] px-2 py-0.5 rounded-full">
                        {completado.Aprobado ? 'Certificado' : 'Completado'}
                      </span>
                    )}
                  </div>
                  <p className="text-[#6667AB] text-xs mt-1 line-clamp-2">{curso.Descripcion}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] text-[#6667AB]">{curso.DuracionMinutos} min</span>
                    <span className="text-[10px] text-[#6667AB]">{curso.totalEvaluaciones} preguntas</span>
                    <span className="text-[10px] text-[#F6A5C0]">{curso.Categoria}</span>
                  </div>
                </div>
                {!completado && <ChevronRight className="w-4 h-4 text-[#6667AB] shrink-0 mt-2" />}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Evaluación modal */}
      {selectedCurso && evaluaciones.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-12 overflow-y-auto"
        >
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[rgba(33,6,53,0.95)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.12)] rounded-2xl p-6 w-full max-w-lg shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white mb-1">{selectedCurso.Titulo} - Evaluación</h3>
            <p className="text-xs text-[#6667AB] mb-4">Responde todas las preguntas para completar el curso. Mínimo 70% para aprobar.</p>

            <div className="space-y-4">
              {evaluaciones.map(ev => {
                let opciones: string[] = [];
                try { opciones = JSON.parse(ev.Opciones); } catch {}
                return (
                  <div key={ev.Id} className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                    <p className="text-sm text-white font-semibold mb-3">{ev.Orden}. {ev.Pregunta}</p>
                    <div className="space-y-2">
                      {opciones.map(op => (
                        <label key={op} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.3)] cursor-pointer hover:bg-[rgba(33,6,53,0.5)] transition-colors">
                          <input type="radio" name={`q-${ev.Orden}`} value={op}
                            checked={respuestas[ev.Orden - 1] === op}
                            onChange={() => setRespuestas(r => ({ ...r, [ev.Orden - 1]: op }))}
                            className="accent-[#F6A5C0]"
                          />
                          <span className="text-xs text-[#F5D5E0]/80">{op}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} disabled={!allAnswered || submitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:bg-[#F6A5C0]/80 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Enviar respuestas'}
              </button>
              <button onClick={() => setSelectedCurso(null)}
                className="px-4 py-2.5 rounded-xl border border-[rgba(255,255,255,0.15)] text-[#6667AB] text-sm hover:text-white transition-colors"
              >Cancelar</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
