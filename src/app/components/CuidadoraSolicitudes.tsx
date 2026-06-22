import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, MessageSquare, Clock, DollarSign, Calendar, User, Baby, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from './ui/Banner';

type TareaNegociacion = {
  Id: number;
  Descripcion: string;
  Categoria?: string;
};

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
  tareas?: TareaNegociacion[];
};

const DECISIONS = ['Aceptar', 'Rechazar', 'Negociar'] as const;
type Decision = typeof DECISIONS[number];

export function CuidadoraSolicitudes() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [solicitudes, setSolicitudes] = useState<SolicitudPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'warning' | 'danger'; text: string } | null>(null);
  const [responses, setResponses] = useState<Record<number, Record<number, Decision>>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/cuidadora/solicitudes-pendientes', { headers });
      if (r.ok) {
        const data: SolicitudPendiente[] = await r.json();
        setSolicitudes(data);
        const initial: Record<number, Record<number, Decision>> = {};
        for (const s of data) {
          if (s.tareas?.length) {
            initial[s.Id] = {};
          }
        }
        setResponses(prev => ({ ...prev, ...initial }));
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setDecision = (ordenId: number, tareaId: number, decision: Decision) => {
    setResponses(prev => ({
      ...prev,
      [ordenId]: { ...prev[ordenId], [tareaId]: decision },
    }));
  };

  const allResponded = (ordenId: number) => {
    const s = solicitudes.find(x => x.Id === ordenId);
    if (!s?.tareas?.length) return false;
    const resp = responses[ordenId] || {};
    return s.tareas.every(t => resp[t.Id] !== undefined);
  };

  const enviarRespuesta = async (ordenId: number) => {
    if (!allResponded(ordenId)) return;
    setSubmitting(ordenId);
    const resp = responses[ordenId] || {};
    const body = {
      ordenId,
      respuestas: Object.entries(resp).map(([tareaId, decision]) => ({
        tareaId: Number(tareaId),
        decision,
      })),
    };
    try {
      const r = await fetch('/api/negociacion', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (r.ok) {
        setMessage({ type: 'success', text: 'Respuestas enviadas correctamente' });
        load();
        setResponses(prev => {
          const next = { ...prev };
          delete next[ordenId];
          return next;
        });
      } else {
        const e = await r.json();
        setMessage({ type: 'danger', text: e.error || 'Error al enviar respuestas' });
      }
    } catch {
      setMessage({ type: 'danger', text: 'Error de conexión' });
    }
    setSubmitting(null);
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
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 space-y-3">
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

                  <div className="text-sm font-bold text-white">
                    Total: S/ {(s.TarifaHora * s.TotalHoras).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Task Negotiation Matrix */}
              {s.tareas && s.tareas.length > 0 ? (
                <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
                  <p className="text-xs font-bold text-[#F6A5C0] mb-3 uppercase tracking-wider">Matriz de Tareas</p>
                  <div className="space-y-2">
                    {s.tareas.map(t => {
                      const selected = responses[s.Id]?.[t.Id];
                      return (
                        <div key={t.Id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[rgba(33,6,53,0.4)] border border-[rgba(255,255,255,0.06)]">
                          <span className="text-xs text-[#F5D5E0] flex-1">{t.Descripcion}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            {DECISIONS.map(d => {
                              const colors: Record<string, string> = {
                                Aceptar: 'data-[selected=true]:bg-[rgba(16,185,129,0.2)] data-[selected=true]:text-[#6EE7B7] data-[selected=true]:border-[#6EE7B7]',
                                Rechazar: 'data-[selected=true]:bg-[rgba(239,68,68,0.2)] data-[selected=true]:text-red-400 data-[selected=true]:border-red-400',
                                Negociar: 'data-[selected=true]:bg-[rgba(246,165,192,0.2)] data-[selected=true]:text-[#F6A5C0] data-[selected=true]:border-[#F6A5C0]',
                              };
                              return (
                                <button
                                  key={d}
                                  onClick={() => setDecision(s.Id, t.Id, d)}
                                  data-selected={selected === d}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                    selected === d
                                      ? 'border text-white'
                                      : 'border-[rgba(255,255,255,0.1)] text-[#6667AB] hover:text-[#F5D5E0] hover:border-[rgba(255,255,255,0.2)]'
                                  } ${selected === d ? colors[d] : ''}`}
                                >
                                  {d}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end mt-4">
                    <motion.button
                      whileHover={allResponded(s.Id) ? { scale: 1.02 } : {}}
                      whileTap={allResponded(s.Id) ? { scale: 0.98 } : {}}
                      onClick={() => enviarRespuesta(s.Id)}
                      disabled={!allResponded(s.Id) || submitting === s.Id}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#F6A5C0] text-[#210635] rounded-xl text-xs font-bold transition-colors disabled:opacity-40"
                    >
                      {submitting === s.Id ? 'Enviando...' : (
                        <><Send className="w-3.5 h-3.5" /> Enviar Respuesta</>
                      )}
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-2 border-t border-[rgba(255,255,255,0.06)] pt-4">
                  <button
                    onClick={async () => {
                      await fetch(`/api/cuidadora/orden/${s.Id}/aceptar-negociacion`, { method: 'POST', headers });
                      setMessage({ type: 'success', text: 'Solicitud aceptada' });
                      load();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Aceptar
                  </button>
                  <button
                    onClick={async () => {
                      await fetch(`/api/cuidadora/orden/${s.Id}/rechazar-negociacion`, { method: 'POST', headers });
                      setMessage({ type: 'warning', text: 'Solicitud rechazada' });
                      load();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-400 text-red-400 text-xs font-bold hover:bg-[rgba(200,40,40,0.1)] transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Rechazar
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
