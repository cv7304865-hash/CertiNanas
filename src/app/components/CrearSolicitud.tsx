import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Send, ArrowLeft, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ChecklistTareas } from './ChecklistTareas';

type Cuidadora = { Id: number; Nombres: string; Apellidos: string; TarifaHora: number; CalificacionPromedio: number; TotalResenas: number; Especialidades: string | null };
type Menor = { Id: number; Nombre: string; Diagnostico: string | null; FechaNacimiento: string | null };

export function CrearSolicitud({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };

  const [cuidadoras, setCuidadoras] = useState<Cuidadora[]>([]);
  const [menores, setMenores] = useState<Menor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [idCuidadora, setIdCuidadora] = useState<number | null>(null);
  const [idMenor, setIdMenor] = useState<number | null>(null);
  const [fechaServicio, setFechaServicio] = useState(new Date().toISOString().slice(0, 10));
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('12:00');
  const [totalHoras, setTotalHoras] = useState(4);
  const [tareaIds, setTareaIds] = useState<number[]>([]);
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/familia/cuidadoras-disponibles', { headers }).then(r => r.json()),
      fetch('/api/familia/menores', { headers }).then(r => r.json()),
    ]).then(([c, m]) => {
      setCuidadoras(c);
      setMenores(m);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const selectedC = cuidadoras.find(c => c.Id === idCuidadora);
  useEffect(() => {
    if (selectedC && horaInicio && horaFin) {
      const [h1, m1] = horaInicio.split(':').map(Number);
      const [h2, m2] = horaFin.split(':').map(Number);
      const diff = ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
      setTotalHoras(diff > 0 ? diff : 4);
    }
  }, [selectedC, horaInicio, horaFin]);

  const handleSubmit = async () => {
    if (!idCuidadora) return;
    setSubmitting(true);
    try {
      const r = await fetch('/api/familia/crear-solicitud', {
        method: 'POST', headers,
        body: JSON.stringify({ idCuidadora, idMenor, fechaServicio, horaInicio, horaFin, totalHoras, tareaIds, observaciones }),
      });
      if (r.ok) onSuccess();
    } finally { setSubmitting(false); }
  };

  if (loading) return <p className="text-[#6667AB] text-sm text-center py-12">Cargando...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={onBack} className="text-sm text-[#6667AB] hover:text-white transition-colors flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a mis servicios
      </button>

      <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-[#F6A5C0]" /> Nueva solicitud de servicio
        </h2>

        {/* Seleccionar cuidadora */}
        <div>
          <label className="text-xs font-bold text-[#6667AB] uppercase tracking-wider block mb-3">Cuidadora</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
            {cuidadoras.map(c => (
              <button key={c.Id} type="button" onClick={() => setIdCuidadora(c.Id)}
                className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                  idCuidadora === c.Id
                    ? 'border-[#F6A5C0] bg-[rgba(246,165,192,0.1)] text-white'
                    : 'border-[rgba(255,255,255,0.08)] bg-[rgba(33,6,53,0.3)] text-[#F5D5E0]/70 hover:border-[rgba(255,255,255,0.2)]'
                }`}
              >
                <span className="font-bold block">{c.Nombres} {c.Apellidos}</span>
                <span className="text-[10px] flex items-center gap-2 mt-0.5">
                  <span>S/ {c.TarifaHora}/h</span>
                  {c.CalificacionPromedio > 0 && (
                    <span className="flex items-center gap-0.5 text-amber-300">
                      <Star className="w-3 h-3 fill-amber-300" />{c.CalificacionPromedio.toFixed(1)}
                    </span>
                  )}
                </span>
                {c.Especialidades && <span className="text-[10px] text-[#6667AB] block mt-0.5 truncate">{c.Especialidades}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Seleccionar menor */}
        <div>
          <label className="text-xs font-bold text-[#6667AB] uppercase tracking-wider block mb-3">Menor (opcional)</label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setIdMenor(null)}
              className={`px-4 py-2 rounded-xl border text-xs transition-all ${
                idMenor === null ? 'border-[#F6A5C0] bg-[rgba(246,165,192,0.1)] text-white' : 'border-[rgba(255,255,255,0.08)] text-[#6667AB]'
              }`}
            >Sin especificar</button>
            {menores.map(m => (
              <button key={m.Id} type="button" onClick={() => setIdMenor(m.Id)}
                className={`px-4 py-2 rounded-xl border text-xs transition-all ${
                  idMenor === m.Id ? 'border-[#F6A5C0] bg-[rgba(246,165,192,0.1)] text-white' : 'border-[rgba(255,255,255,0.08)] text-[#F5D5E0]/70 hover:border-[rgba(255,255,255,0.2)]'
                }`}
              >
                {m.Nombre}{m.Diagnostico ? <span className="text-[#6667AB]"> ({m.Diagnostico})</span> : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Fecha y horario */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-bold text-[#6667AB] uppercase block mb-1.5">Fecha</label>
            <input type="date" value={fechaServicio} onChange={e => setFechaServicio(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#6667AB] uppercase block mb-1.5">Inicio</label>
            <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#6667AB] uppercase block mb-1.5">Fin</label>
            <input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#6667AB] uppercase block mb-1.5">Horas</label>
            <div className="px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs flex items-center h-full">
              {totalHoras}h{selectedC && <span className="text-[#6667AB] ml-1">· S/ {(selectedC.TarifaHora * totalHoras).toFixed(2)}</span>}
            </div>
          </div>
        </div>

        {/* Checklist de tareas */}
        <div>
          <label className="text-xs font-bold text-[#6667AB] uppercase tracking-wider block mb-3">Tareas y necesidades</label>
          <ChecklistTareas selected={tareaIds} onChange={setTareaIds} />
        </div>

        {/* Observaciones */}
        <div>
          <label className="text-xs font-bold text-[#6667AB] uppercase tracking-wider block mb-3">Observaciones especiales</label>
          <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={3}
            className="w-full px-4 py-3 rounded-xl bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm resize-none"
            placeholder="Ej: Menor diagnosticado con TEA nivel 1. Requiere apoyo en regulación emocional y seguimiento de rutina visual."
          />
        </div>

        {/* Resumen y enviar */}
        {selectedC && (
          <div className="bg-[rgba(246,165,192,0.1)] border border-[rgba(246,165,192,0.25)] rounded-xl p-4 space-y-1 text-sm">
            <p className="text-[#F6A5C0] font-bold">Resumen de la solicitud</p>
            <p className="text-[#F5D5E0]/70">Cuidadora: <span className="text-white font-semibold">{selectedC.Nombres} {selectedC.Apellidos}</span></p>
            <p className="text-[#F5D5E0]/70">Fecha: <span className="text-white font-semibold">{new Date(fechaServicio + 'T00:00:00').toLocaleDateString('es-PE')}</span></p>
            <p className="text-[#F5D5E0]/70">Horario: <span className="text-white font-semibold">{horaInicio} - {horaFin} ({totalHoras}h)</span></p>
            <p className="text-[#F5D5E0]/70">Tareas seleccionadas: <span className="text-white font-semibold">{tareaIds.length}</span></p>
            <p className="text-[#F5D5E0]/70">Tarifa: <span className="text-white font-semibold">S/ {selectedC.TarifaHora}/hora</span></p>
            <p className="text-[#F5D5E0]/70">Total estimado: <span className="text-white font-bold">S/ {(selectedC.TarifaHora * totalHoras * 1.15).toFixed(2)}</span></p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={!idCuidadora || submitting}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
            idCuidadora && !submitting
              ? 'bg-[#F6A5C0] text-[#210635] hover:bg-[#F6A5C0]/80'
              : 'bg-[rgba(33,6,53,0.5)] text-[#6667AB] cursor-not-allowed'
          }`}
        >{submitting ? 'Enviando...' : 'Enviar solicitud a la cuidadora'}</button>
      </div>
    </div>
  );
}
