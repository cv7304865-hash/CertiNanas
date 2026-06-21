import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, MessageSquare, Clock, DollarSign, Calendar, User, Baby } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from './ui/Banner';

type SolicitudPendiente = {
  Id: number;
  FechaServicio: string;
  TotalHoras: number;
  TarifaHora: number;
  Total: number;
  Subtotal: number;
  Estado: string;
  EstadoNegociacion: string;
  HoraInicio: string | null;
  HoraFin: string | null;
  TipoServicio: string;
  FechaCreacion: string;
  FamiliaNombres: string;
  FamiliaApellidos: string;
  MenorNombre: string | null;
  MenorDiagnostico: string | null;
  TotalPropuestas: number;
};

export function CuidadoraSolicitudes() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [solicitudes, setSolicitudes] = useState<SolicitudPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'warning' | 'danger'; text: string } | null>(null);
  const [proposing, setProposing] = useState<number | null>(null);
  const [propForm, setPropForm] = useState({ tarifaHora: 0, totalHoras: 0, horaInicio: '', horaFin: '', mensaje: '' });

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/cuidadora/solicitudes-pendientes', { headers });
      if (r.ok) setSolicitudes(await r.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const accept = async (id: number) => {
    const r = await fetch(`/api/cuidadora/orden/${id}/aceptar-negociacion`, { method: 'POST', headers });
    if (r.ok) {
      setMessage({ type: 'success', text: 'Solicitud aceptada' });
      load();
    } else {
      const e = await r.json();
      setMessage({ type: 'danger', text: e.error || 'Error al aceptar' });
    }
  };

  const reject = async (id: number) => {
    const r = await fetch(`/api/cuidadora/orden/${id}/rechazar-negociacion`, { method: 'POST', headers });
    if (r.ok) {
      setMessage({ type: 'warning', text: 'Solicitud rechazada' });
      load();
    }
  };

  const propose = async (id: number) => {
    const r = await fetch(`/api/cuidadora/orden/${id}/proponer`, {
      method: 'POST',
      headers,
      body: JSON.stringify(propForm),
    });
    if (r.ok) {
      setMessage({ type: 'success', text: 'Contrapropuesta enviada' });
      setProposing(null);
      setPropForm({ tarifaHora: 0, totalHoras: 0, horaInicio: '', horaFin: '', mensaje: '' });
      load();
    } else {
      const e = await r.json();
      setMessage({ type: 'danger', text: e.error || 'Error al proponer' });
    }
  };

  const formatFecha = (f: string) => new Date(f + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const estadoLabel: Record<string, string> = {
    Pendiente: 'Esperando respuesta',
    Negociacion: 'En negociación',
    Reunion: 'Acordado - Pendiente de reunión',
  };

  return (
    <div className="max-w-5xl mx-auto pb-8">
      <h2 className="text-xl font-bold text-white mb-1">Solicitudes de servicio</h2>
      <p className="text-sm text-[#6667AB] mb-6">Revisa y responde a las solicitudes de las familias</p>

      {message && (
        <div className="mb-4">
          <Banner variant={message.type} onClose={() => setMessage(null)}>{message.text}</Banner>
        </div>
      )}

      {loading ? (
        <p className="text-[#6667AB] text-sm">Cargando...</p>
      ) : solicitudes.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 text-[#6667AB] mx-auto mb-3" />
          <p className="text-[#6667AB]">No tienes solicitudes pendientes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map(s => (
            <motion.div key={s.Id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#CC8DB3] font-bold text-sm">
                      {s.FamiliaNombres.charAt(0)}{s.FamiliaApellidos.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{s.FamiliaNombres} {s.FamiliaApellidos}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        s.EstadoNegociacion === 'Pendiente' ? 'bg-amber-500/20 text-amber-200' :
                        s.EstadoNegociacion === 'Negociacion' ? 'bg-purple-500/20 text-purple-200' :
                        'bg-emerald-500/20 text-emerald-200'
                      }`}>
                        {estadoLabel[s.EstadoNegociacion] || s.EstadoNegociacion}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#F5D5E0]/70">
                      <Calendar className="w-3.5 h-3.5 text-[#6667AB]" /> {formatFecha(s.FechaServicio)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#F5D5E0]/70">
                      <Clock className="w-3.5 h-3.5 text-[#6667AB]" /> {s.HoraInicio || '--'} - {s.HoraFin || '--'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#F5D5E0]/70">
                      <DollarSign className="w-3.5 h-3.5 text-[#6667AB]" /> S/ {s.TarifaHora}/hora
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#F5D5E0]/70">
                      <User className="w-3.5 h-3.5 text-[#6667AB]" /> {s.TotalHoras}h
                    </div>
                  </div>

                  {s.MenorNombre && (
                    <div className="flex items-center gap-1.5 text-xs text-[#F5D5E0]/70">
                      <Baby className="w-3.5 h-3.5 text-[#6667AB]" /> {s.MenorNombre}
                      {s.MenorDiagnostico && <span className="text-[#6667AB]">({s.MenorDiagnostico})</span>}
                    </div>
                  )}

                  {/* Total display */}
                  <div className="text-sm font-bold text-white">
                    Total: S/ {(s.TarifaHora * s.TotalHoras).toFixed(2)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => accept(s.Id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all">
                    <CheckCircle className="w-3.5 h-3.5" /> Aceptar
                  </button>
                  <button onClick={() => { setProposing(s.Id); setPropForm({ tarifaHora: s.TarifaHora, totalHoras: s.TotalHoras, horaInicio: s.HoraInicio || '', horaFin: s.HoraFin || '', mensaje: '' }); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#F6A5C0] text-[#F6A5C0] text-xs font-bold hover:bg-[rgba(246,165,192,0.1)] transition-all">
                    <MessageSquare className="w-3.5 h-3.5" /> Proponer
                  </button>
                  <button onClick={() => reject(s.Id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-400 text-red-400 text-xs font-bold hover:bg-[rgba(200,40,40,0.1)] transition-all">
                    <XCircle className="w-3.5 h-3.5" /> Rechazar
                  </button>
                </div>
              </div>

              {/* Proposal form */}
              {proposing === s.Id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <p className="text-xs font-bold text-[#F6A5C0] mb-3">Proponer cambios</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] text-[#6667AB] block mb-1">Tarifa por hora</label>
                      <input type="number" value={propForm.tarifaHora} onChange={e => setPropForm(p => ({ ...p, tarifaHora: +e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#6667AB] block mb-1">Total horas</label>
                      <input type="number" value={propForm.totalHoras} onChange={e => setPropForm(p => ({ ...p, totalHoras: +e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#6667AB] block mb-1">Hora inicio</label>
                      <input type="time" value={propForm.horaInicio} onChange={e => setPropForm(p => ({ ...p, horaInicio: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#6667AB] block mb-1">Hora fin</label>
                      <input type="time" value={propForm.horaFin} onChange={e => setPropForm(p => ({ ...p, horaFin: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="text-[10px] text-[#6667AB] block mb-1">Mensaje para la familia</label>
                    <textarea value={propForm.mensaje} onChange={e => setPropForm(p => ({ ...p, mensaje: e.target.value }))} rows={2}
                      className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs placeholder:text-[#6667AB] resize-none"
                      placeholder="Ej: Podría ajustar mi tarifa si reducimos las horas..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => propose(s.Id)}
                      className="px-4 py-1.5 rounded-lg bg-[#F6A5C0] text-[#210635] text-xs font-bold hover:bg-[#F6A5C0]/80 transition-colors"
                    >Enviar propuesta</button>
                    <button onClick={() => setProposing(null)}
                      className="px-4 py-1.5 rounded-lg border border-[rgba(255,255,255,0.15)] text-[#6667AB] text-xs hover:text-white transition-colors"
                    >Cancelar</button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
