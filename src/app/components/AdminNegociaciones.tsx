import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, XCircle, Clock, Calendar, DollarSign, User, Baby, Shield, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from './ui/Banner';

type NegociacionAdmin = {
  OrdenId: number;
  FechaServicio: string;
  TipoServicio: string;
  EstadoNegociacion: string;
  TarifaHora: number;
  TotalHoras: number;
  HoraInicio: string | null;
  HoraFin: string | null;
  FamiliaNombres: string;
  FamiliaApellidos: string;
  CuidadoraNombres: string;
  CuidadoraApellidos: string;
  MenorNombre: string | null;
  PropuestasActivas: number;
  Propuestas: {
    id: number;
    propuestoPor: number;
    tarifa: number | null;
    horas: number | null;
    horaInicio: string | null;
    horaFin: string | null;
    mensaje: string | null;
    estado: string;
    fecha: string;
  }[];
};

export function AdminNegociaciones() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-admin-user': String(user?.id) };
  const [negociaciones, setNegociaciones] = useState<NegociacionAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'warning' | 'danger'; text: string } | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [suggestForm, setSuggestForm] = useState<{ ordenId: number; tarifaHora: number; totalHoras: number; mensaje: string } | null>(null);

  const headers_browser = headers;

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/negociaciones', { headers: headers_browser });
      if (r.ok) setNegociaciones(await r.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const mediar = async (ordenId: number, accion: string) => {
    const body: any = { accion };
    if (accion === 'sugerir' && suggestForm?.ordenId === ordenId) {
      body.tarifaHora = suggestForm.tarifaHora;
      body.totalHoras = suggestForm.totalHoras;
      body.mensaje = suggestForm.mensaje;
    }
    const r = await fetch(`/api/admin/negociaciones/${ordenId}/mediar`, {
      method: 'POST', headers: headers_browser, body: JSON.stringify(body),
    });
    if (r.ok) {
      setMessage({ type: 'success', text: accion === 'aprobar' ? 'Negociación aprobada' : accion === 'rechazar' ? 'Negociación rechazada' : 'Sugerencia enviada' });
      setSuggestForm(null);
      load();
    } else {
      const e = await r.json();
      setMessage({ type: 'danger', text: e.error || 'Error' });
    }
  };

  const formatFecha = (f: string) => new Date(f + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const estadoNegColor: Record<string, string> = {
    Pendiente: 'bg-amber-500/20 text-amber-200',
    Negociacion: 'bg-purple-500/20 text-purple-200',
    Reunion: 'bg-emerald-500/20 text-emerald-200',
  };

  return (
    <div className="max-w-6xl mx-auto pb-8">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="w-5 h-5 text-[#F6A5C0]" />
        <h2 className="text-xl font-bold text-white">Mediación de negociaciones</h2>
      </div>
      <p className="text-sm text-[#6667AB] mb-6">Supervisa y media en las negociaciones entre familias y cuidadoras</p>

      {message && (
        <div className="mb-4">
          <Banner variant={message.type} onClose={() => setMessage(null)}>{message.text}</Banner>
        </div>
      )}

      {loading ? (
        <p className="text-[#6667AB] text-sm">Cargando...</p>
      ) : negociaciones.length === 0 ? (
        <div className="text-center py-16">
          <Shield className="w-12 h-12 text-[#6667AB] mx-auto mb-3" />
          <p className="text-[#6667AB]">No hay negociaciones activas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {negociaciones.map(n => (
            <motion.div key={n.OrdenId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#6667AB]" />
                      <span className="text-white font-bold text-sm">{n.FamiliaNombres} {n.FamiliaApellidos}</span>
                      <span className="text-[#6667AB] text-xs">↔</span>
                      <span className="text-white font-bold text-sm">{n.CuidadoraNombres} {n.CuidadoraApellidos}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${estadoNegColor[n.EstadoNegociacion] || 'bg-[rgba(33,6,53,0.5)] text-[#6667AB]'}`}>
                      {n.EstadoNegociacion}
                    </span>
                    {n.PropuestasActivas > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F6A5C0]/20 text-[#F6A5C0]">
                        {n.PropuestasActivas} propuesta(s)
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#F5D5E0]/70">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#6667AB]" />{formatFecha(n.FechaServicio)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#6667AB]" />{n.HoraInicio || '--'} - {n.HoraFin || '--'}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-[#6667AB]" />S/ {n.TarifaHora}/hora</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3 text-[#6667AB]" />{n.TotalHoras}h</span>
                    {n.MenorNombre && <span className="flex items-center gap-1"><Baby className="w-3 h-3 text-[#6667AB]" />{n.MenorNombre}</span>}
                  </div>

                  {/* Propuestas */}
                  {n.Propuestas.length > 0 && (
                    <button onClick={() => setExpanded(expanded === n.OrdenId ? null : n.OrdenId)}
                      className="text-xs text-[#6667AB] hover:text-white transition-colors"
                    >
                      {expanded === n.OrdenId ? 'Ocultar propuestas' : `Ver ${n.Propuestas.length} propuesta(s)`}
                    </button>
                  )}

                  {expanded === n.OrdenId && n.Propuestas.map(p => (
                    <div key={p.id} className="bg-[rgba(33,6,53,0.4)] rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center gap-2 text-[#6667AB]">
                        <span className={`w-2 h-2 rounded-full ${p.estado === 'activa' ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                        {p.estado === 'activa' ? 'Activa' : p.estado} · {new Date(p.fecha).toLocaleString('es-PE')}
                      </div>
                      {p.tarifa && <p>Tarifa: <span className="text-white font-bold">S/ {p.tarifa}/hora</span></p>}
                      {p.horas && <p>Horas: <span className="text-white font-bold">{p.horas}h</span></p>}
                      {p.horaInicio && <p>Horario: {p.horaInicio} - {p.horaFin}</p>}
                      {p.mensaje && <p className="text-[#F5D5E0] mt-1">"{p.mensaje}"</p>}
                    </div>
                  ))}
                </div>

                {/* Admin actions */}
                {n.EstadoNegociacion === 'Negociacion' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => mediar(n.OrdenId, 'aprobar')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all"
                    ><CheckCircle className="w-3.5 h-3.5" />Aprobar</button>
                    <button onClick={() => mediar(n.OrdenId, 'rechazar')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-400 text-red-400 text-xs font-bold hover:bg-[rgba(200,40,40,0.1)] transition-all"
                    ><XCircle className="w-3.5 h-3.5" />Rechazar</button>
                    <button onClick={() => setSuggestForm(suggestForm?.ordenId === n.OrdenId ? null : { ordenId: n.OrdenId, tarifaHora: n.TarifaHora, totalHoras: n.TotalHoras, mensaje: '' })}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#F6A5C0] text-[#F6A5C0] text-xs font-bold hover:bg-[rgba(246,165,192,0.1)] transition-all"
                    ><MessageSquare className="w-3.5 h-3.5" />Sugerir</button>
                  </div>
                )}
              </div>

              {/* Suggest form */}
              {suggestForm?.ordenId === n.OrdenId && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <p className="text-xs font-bold text-[#F6A5C0] mb-3">Sugerir términos</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] text-[#6667AB] block mb-1">Tarifa por hora</label>
                      <input type="number" value={suggestForm.tarifaHora} onChange={e => setSuggestForm(s => ({ ...s!, tarifaHora: +e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#6667AB] block mb-1">Total horas</label>
                      <input type="number" value={suggestForm.totalHoras} onChange={e => setSuggestForm(s => ({ ...s!, totalHoras: +e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="text-[10px] text-[#6667AB] block mb-1">Mensaje</label>
                    <textarea value={suggestForm.mensaje} onChange={e => setSuggestForm(s => ({ ...s!, mensaje: e.target.value }))} rows={2}
                      className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs resize-none"
                      placeholder="Sugerencia del administrador..."
                    />
                  </div>
                  <button onClick={() => mediar(n.OrdenId, 'sugerir')}
                    className="px-4 py-1.5 rounded-lg bg-[#F6A5C0] text-[#210635] text-xs font-bold hover:bg-[#F6A5C0]/80 transition-colors"
                  >Enviar sugerencia</button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
