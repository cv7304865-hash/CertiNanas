import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from './ui/Banner';

type Reemplazo = {
  Id: number; IdOrden: number; IdCuidadoraOriginal: number;
  IdCuidadoraReemplazo: number | null; Motivo: string;
  Estado: string; FechaSolicitud: string; FechaAprobacion: string | null;
  CuidadoraReemplazoNombre: string | null; CuidadoraReemplazoTelefono: string | null;
  Urgencia: string;
};

type Servicio = {
  Id: number; MenorNombre: string; FechaServicio: string;
  FamiliaNombres: string; FamiliaApellidos: string; Estado: string;
};

export function ReemplazoTracker() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [reemplazos, setReemplazos] = useState<Reemplazo[]>([]);
  const [idOrden, setIdOrden] = useState<number | null>(null);
  const [motivo, setMotivo] = useState('');
  const [urgencia, setUrgencia] = useState('Normal');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/cuidadora/servicios', { headers })
      .then(r => r.json())
      .then((data: any[]) => setServicios(data.filter(s => s.Estado === 'Activa' || s.Estado === 'En Curso')))
      .catch(() => {});
    fetch('/api/reemplazo/mis-solicitudes', { headers })
      .then(r => r.json())
      .then((data: any[]) => setReemplazos(data))
      .catch(() => {});
  }, []);

  const handleSolicitar = async () => {
    if (!idOrden || !motivo.trim()) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const r = await fetch('/api/reemplazo/solicitar', {
        method: 'POST',
        headers,
        body: JSON.stringify({ IdOrden: idOrden, motivo: motivo.trim(), urgencia }),
      });
      if (r.ok) {
        setMessage({ type: 'success', text: 'Solicitud de reemplazo enviada' });
        setIdOrden(null);
        setMotivo('');
        const reload = await fetch('/api/reemplazo/mis-solicitudes', { headers }).then(r => r.json());
        setReemplazos(reload);
      } else {
        const data = await r.json();
        setMessage({ type: 'danger', text: data.error || 'Error al solicitar' });
      }
    } catch {
      setMessage({ type: 'danger', text: 'Error de conexión' });
    }
    setSubmitting(false);
  };

  const estadoColor: Record<string, string> = {
    Pendiente: 'text-yellow-400 bg-[rgba(250,204,21,0.1)]',
    Aprobado: 'text-[#6EE7B7] bg-[rgba(16,185,129,0.1)]',
    Rechazado: 'text-red-400 bg-[rgba(239,68,68,0.1)]',
    Buscando: 'text-blue-400 bg-[rgba(59,130,246,0.1)]',
    Completado: 'text-[#6EE7B7] bg-[rgba(16,185,129,0.1)]',
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Reemplazo por Emergencia</h2>
      <p className="text-sm text-[#6667AB] mb-6">Solicita reemplazo urgente si no puedes asistir a un servicio asignado</p>

      {message && (
        <div className="mb-4">
          <Banner variant={message.type} onClose={() => setMessage(null)}>{message.text}</Banner>
        </div>
      )}

      <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-bold text-white mb-4">Nueva solicitud de reemplazo</h3>
        <div className="space-y-4">
          <select value={idOrden ?? ''} onChange={e => setIdOrden(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-4 py-2.5 rounded-xl bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm"
          >
            <option value="">Seleccionar servicio</option>
            {servicios.map(s => (
              <option key={s.Id} value={s.Id}>
                {s.MenorNombre} - {s.FechaServicio}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            {['Normal', 'Urgente', 'Critico'].map(u => (
              <button key={u} onClick={() => setUrgencia(u)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  urgencia === u
                    ? 'bg-[rgba(246,165,192,0.2)] border-[#F6A5C0] text-[#F6A5C0]'
                    : 'bg-[rgba(33,6,53,0.4)] border-[rgba(255,255,255,0.1)] text-[#6667AB] hover:text-white'
                }`}
              >{u}</button>
            ))}
          </div>

          <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm resize-none"
            placeholder="Motivo del reemplazo (ej: emergencia médica, familiar, etc.)"
          />

          <button onClick={handleSolicitar} disabled={!idOrden || !motivo.trim() || submitting}
            className="w-full px-6 py-3 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:bg-[#F6A5C0]/80 transition-colors disabled:opacity-50"
          >{submitting ? 'Enviando...' : 'Solicitar Reemplazo'}</button>
        </div>
      </div>

      {reemplazos.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-[#F6A5C0] uppercase tracking-wider mb-3">Historial de solicitudes</h3>
          <div className="space-y-3">
            {reemplazos.map(r => (
              <motion.div key={r.Id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-semibold">{r.Motivo}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${estadoColor[r.Estado] || 'text-[#6667AB]'}`}>
                    {r.Estado}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-[#6667AB]">
                  <span>{new Date(r.FechaSolicitud).toLocaleDateString()}</span>
                  <span>Urgencia: {r.Urgencia}</span>
                  {r.CuidadoraReemplazoNombre && <span>Reemplazo: {r.CuidadoraReemplazoNombre}</span>}
                  {r.CuidadoraReemplazoTelefono && <span>Tel: {r.CuidadoraReemplazoTelefono}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
