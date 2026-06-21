import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { LogOut, Search, MessageSquare, CheckCircle, XCircle, DollarSign, Clock, ListTodo } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';
import { MinorsSection } from './MinorsSection';
import { ChecklistTareas } from './ChecklistTareas';

type Solicitud = {
  Id: number; FechaServicio: string; TotalHoras: number; TarifaHora: number;
  Total: number; Estado: string; EstadoNegociacion?: string; HoraInicio: string; HoraFin: string;
  CuidadoraId: number; CuidadoraNombres: string; CuidadoraApellidos: string;
  MenorNombre: string | null; MenorDiagnostico: string | null;
  TareaIds?: number[];
};

type PropuestaNegociacion = {
  Id: number;
  IdOrden: number;
  IdPropuestoPor: number;
  TarifaHora: number | null;
  TotalHoras: number | null;
  HoraInicio: string | null;
  HoraFin: string | null;
  Mensaje: string | null;
  Estado: string;
  FechaCreacion: string;
  PropuestoPorNombres?: string;
  PropuestoPorApellidos?: string;
};

const statusLabel: Record<string, string> = {
  Pendiente: 'Pendiente',
  Confirmada: 'Confirmada',
  'En curso': 'En curso',
  Finalizada: 'Pagado',
  Completada: 'Pagado',
  Pagada: 'Pagado',
  Cancelada: 'Cancelada',
};

const badgeClass: Record<string, string> = {
  Pendiente: 'bg-[#f6a5c0] text-white',
  Confirmada: 'bg-[#cc8db3] text-white',
  'En curso': 'bg-[#9d85b6] text-white',
  Finalizada: 'bg-emerald-500 text-white',
  Completada: 'bg-emerald-500 text-white',
  Pagada: 'bg-emerald-500 text-white',
  Cancelada: 'bg-[#cc8db3] text-white',
};

const negLabel: Record<string, string> = {
  Pendiente: 'Esperando respuesta',
  Aceptada: 'Aceptada',
  Negociacion: 'En negociación',
  Reunion: 'Acordado',
  Acordado: 'Acordado',
  Cancelada: 'Cancelada',
};

export function FamilyPanel({ onNavigate, onViewContract, onReview }: { onNavigate?: (v: string) => void; onViewContract?: (id: number) => void; onReview?: (id: number) => void }) {
  const { user, logout } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [negModal, setNegModal] = useState<{ open: boolean; ordenId: number }>({ open: false, ordenId: 0 });
  const [propuestas, setPropuestas] = useState<PropuestaNegociacion[]>([]);
  const [responding, setResponding] = useState(false);
  const [counterForm, setCounterForm] = useState({ tarifaHora: 0, totalHoras: 0, horaInicio: '', horaFin: '', mensaje: '' });
  const [showCounter, setShowCounter] = useState(false);
  const [tareasModal, setTareasModal] = useState<{ open: boolean; ordenId: number; tareasIds: number[] }>({ open: false, ordenId: 0, tareasIds: [] });

  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };

  useEffect(() => {
    fetch('/api/familia/solicitudes', { headers })
      .then(r => r.json())
      .then(data => { setSolicitudes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadPropuestas = async (ordenId: number) => {
    const r = await fetch(`/api/cuidadora/orden/${ordenId}/propuestas`, { headers });
    if (r.ok) setPropuestas(await r.json());
  };

  const openNeg = (ordenId: number) => {
    setNegModal({ open: true, ordenId });
    setShowCounter(false);
    loadPropuestas(ordenId);
  };

  const respondNeg = async (accion: string) => {
    if (!propuestas.length) return;
    const active = propuestas.find(p => p.Estado === 'activa');
    if (!active) return;
    setResponding(true);
    const body: any = { accion };
    if (accion === 'contrapropuesta') {
      body.tarifaHora = counterForm.tarifaHora;
      body.totalHoras = counterForm.totalHoras;
      body.horaInicio = counterForm.horaInicio || null;
      body.horaFin = counterForm.horaFin || null;
      body.mensaje = counterForm.mensaje || null;
    }
    const r = await fetch(`/api/familia/negociacion/${active.Id}/responder`, {
      method: 'POST', headers, body: JSON.stringify(body),
    });
    setResponding(false);
    if (r.ok) {
      setNegModal({ open: false, ordenId: 0 });
      setShowCounter(false);
      setCounterForm({ tarifaHora: 0, totalHoras: 0, horaInicio: '', horaFin: '', mensaje: '' });
      fetch('/api/familia/solicitudes', { headers })
        .then(rr => rr.json()).then(data => setSolicitudes(data));
    }
  };

  const formatFecha = (f: string) => {
    const d = new Date(f + 'T00:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
      {/* Navbar */}
      <header className="bg-[#210635]/80 backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.1)] text-white sticky top-0 z-40 shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 overflow-hidden rounded">
                  <img src="/logo.png" alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-lg font-extrabold text-[#f6a5c0] tracking-tight">CERTINANAS</span>
              </div>
              <span className="text-white/40 text-xl font-light hidden sm:inline">|</span>
              <span className="text-[#6667AB] text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
            </div>
            <nav className="flex items-center gap-6">
              <button onClick={() => onNavigate?.('search')} className="text-sm text-[#F5D5E0]/70 hover:text-white transition-colors">Inicio</button>
              <button onClick={() => onNavigate?.('familia')} className="text-sm font-bold text-[#f6a5c0] border-b-2 border-[#f6a5c0] pb-0.5">Mis Servicios</button>
              <button onClick={() => onNavigate?.('messages')} className="text-sm text-[#F5D5E0]/70 hover:text-white transition-colors">Mensajes</button>
              <ProfileAvatar size={36} className="ml-2" />
              <button onClick={logout} className="p-2 hover:bg-[rgba(33,6,53,0.4)] rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-[#6667AB]" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <MinorsSection />

        <section>
          <h1 className="text-2xl font-bold text-white mb-6">Mis solicitudes de servicio</h1>

          {loading ? (
            <p className="text-[#6667AB] text-sm">Cargando...</p>
          ) : solicitudes.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-[#6667AB] mx-auto mb-3" />
              <p className="text-[#6667AB]">No tienes solicitudes de servicio aún.</p>
            </div>
          ) : (
            <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[rgba(33,6,53,0.4)] border-b border-[rgba(255,255,255,0.1)]">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[#6667AB] uppercase tracking-wider">Cuidadora</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[#6667AB] uppercase tracking-wider">Menor</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[#6667AB] uppercase tracking-wider">Fecha</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[#6667AB] uppercase tracking-wider">Horario</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[#6667AB] uppercase tracking-wider">Monto</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[#6667AB] uppercase tracking-wider">Negociación</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[#6667AB] uppercase tracking-wider">Estado</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-[#6667AB] uppercase tracking-wider">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((s) => (
                      <motion.tr
                        key={s.Id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-[rgba(255,255,255,0.1)] transition-colors hover:bg-[rgba(33,6,53,0.3)]"
                      >
                        <td className="px-6 py-4">
                          <span className="font-semibold text-white">{s.CuidadoraNombres} {s.CuidadoraApellidos?.charAt(0)}.</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#F5D5E0]/70">
                          {s.MenorNombre}
                          {s.MenorDiagnostico && <span className="text-[#6667AB]"> ({s.MenorDiagnostico})</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#F5D5E0]/70">{formatFecha(s.FechaServicio)}</td>
                        <td className="px-6 py-4 text-sm text-[#F5D5E0]/70 font-mono">{s.HoraInicio || '--'}-{s.HoraFin || '--'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-white">S/ {s.Total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold ${
                          s.EstadoNegociacion === 'Pendiente' ? 'bg-amber-500/20 text-amber-200' :
                          s.EstadoNegociacion === 'Negociacion' ? 'bg-purple-500/20 text-purple-200' :
                          s.EstadoNegociacion === 'Reunion' || s.EstadoNegociacion === 'Acordado' ? 'bg-emerald-500/20 text-emerald-200' :
                          s.EstadoNegociacion === 'Aceptada' ? 'bg-emerald-500/20 text-emerald-200' :
                          'bg-[rgba(33,6,53,0.5)] text-[#6667AB]'
                        }`}>
                          {negLabel[s.EstadoNegociacion || ''] || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${badgeClass[s.Estado] || 'bg-[#f6a5c0] text-white'}`}>
                          {statusLabel[s.Estado] || s.Estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {s.EstadoNegociacion === 'Negociacion' && (
                            <button onClick={() => openNeg(s.Id)}
                              className="text-xs font-semibold text-purple-300 hover:text-purple-200 transition-colors">
                              Responder
                            </button>
                          )}
                          <button onClick={() => setTareasModal({ open: true, ordenId: s.Id, tareasIds: s.TareaIds || [] })}
                            className="text-xs font-semibold text-[#F5D5E0]/70 hover:text-white transition-colors flex items-center gap-1">
                            <ListTodo className="w-3 h-3" />Tareas{s.TareaIds?.length ? ` (${s.TareaIds.length})` : ''}
                          </button>
                          {s.Estado === 'Finalizada' && (
                              <button onClick={() => onReview?.(s.Id)}
                                className="text-xs font-semibold text-[#F5D5E0]/70 hover:text-white transition-colors">
                                Evaluar
                              </button>
                            )}
                            <button onClick={() => onViewContract?.(s.Id)}
                              className="text-xs font-semibold text-[#F6A5C0] hover:text-[#CC8DB3] transition-colors">
                              Ver contrato
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Negotiation response dialog */}
      <AnimatePresence>
        {negModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#210635] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-4">Propuesta de la cuidadora</h3>

              {propuestas.filter(p => p.Estado === 'activa').map(p => (
                <div key={p.Id} className="space-y-4">
                  <div className="bg-[rgba(33,6,53,0.5)] rounded-xl p-4 space-y-2">
                    {p.TarifaHora && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-[#F6A5C0]" />
                        <span className="text-[#6667AB]">Tarifa:</span>
                        <span className="text-white font-bold">S/ {p.TarifaHora}/hora</span>
                      </div>
                    )}
                    {p.TotalHoras && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-[#F6A5C0]" />
                        <span className="text-[#6667AB]">Horas:</span>
                        <span className="text-white font-bold">{p.TotalHoras}h</span>
                      </div>
                    )}
                    {p.HoraInicio && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-[#F6A5C0]" />
                        <span className="text-[#6667AB]">Horario:</span>
                        <span className="text-white font-bold">{p.HoraInicio} - {p.HoraFin}</span>
                      </div>
                    )}
                    {p.Mensaje && (
                      <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                        <p className="text-xs text-[#6667AB] mb-1">Mensaje:</p>
                        <p className="text-sm text-[#F5D5E0]">{p.Mensaje}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => respondNeg('aceptar')} disabled={responding}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    ><CheckCircle className="w-4 h-4 inline mr-1.5" />Aceptar</button>
                    <button onClick={() => setShowCounter(!showCounter)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[#F6A5C0] text-[#F6A5C0] text-sm font-bold hover:bg-[rgba(246,165,192,0.1)] transition-colors"
                    ><MessageSquare className="w-4 h-4 inline mr-1.5" />Contraproponer</button>
                    <button onClick={() => respondNeg('rechazar')} disabled={responding}
                      className="px-4 py-2.5 rounded-xl border border-red-400 text-red-400 text-sm font-bold hover:bg-[rgba(200,40,40,0.1)] transition-colors disabled:opacity-50"
                    ><XCircle className="w-4 h-4 inline mr-1.5" />Rechazar</button>
                  </div>

                  {/* Counter-proposal form */}
                  {showCounter && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 pt-2">
                      <p className="text-xs font-bold text-[#F6A5C0]">Tu contrapropuesta</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-[#6667AB] block mb-1">Tarifa</label>
                          <input type="number" value={counterForm.tarifaHora} onChange={e => setCounterForm(c => ({ ...c, tarifaHora: +e.target.value }))}
                            className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#6667AB] block mb-1">Horas</label>
                          <input type="number" value={counterForm.totalHoras} onChange={e => setCounterForm(c => ({ ...c, totalHoras: +e.target.value }))}
                            className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#6667AB] block mb-1">Inicio</label>
                          <input type="time" value={counterForm.horaInicio} onChange={e => setCounterForm(c => ({ ...c, horaInicio: e.target.value }))}
                            className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs [color-scheme:dark]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#6667AB] block mb-1">Fin</label>
                          <input type="time" value={counterForm.horaFin} onChange={e => setCounterForm(c => ({ ...c, horaFin: e.target.value }))}
                            className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs [color-scheme:dark]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#6667AB] block mb-1">Mensaje</label>
                        <textarea value={counterForm.mensaje} onChange={e => setCounterForm(c => ({ ...c, mensaje: e.target.value }))} rows={2}
                          className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs resize-none"
                          placeholder="Ej: Prefiero mantener la tarifa original pero podemos ajustar el horario..."
                        />
                      </div>
                      <button onClick={() => respondNeg('contrapropuesta')} disabled={responding}
                        className="w-full px-4 py-2 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:bg-[#F6A5C0]/80 transition-colors disabled:opacity-50"
                      >Enviar contrapropuesta</button>
                    </motion.div>
                  )}
                </div>
              ))}

              {propuestas.filter(p => p.Estado === 'activa').length === 0 && (
                <p className="text-[#6667AB] text-sm text-center py-6">No hay propuestas activas</p>
              )}

              <button onClick={() => setNegModal({ open: false, ordenId: 0 })}
                className="w-full mt-4 px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.15)] text-[#6667AB] text-sm hover:text-white transition-colors"
              >Cerrar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tareas checklist modal */}
      <AnimatePresence>
        {tareasModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#210635] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-1">Tareas y necesidades del menor</h3>
              <p className="text-xs text-[#6667AB] mb-4">Selecciona las tareas que necesita este servicio</p>

              <ChecklistTareas selected={tareasModal.tareasIds} onChange={ids => setTareasModal(m => ({ ...m, tareasIds: ids }))} />

              <div className="flex gap-2 mt-6">
                <button onClick={async () => {
                  await fetch(`/api/ordenes/${tareasModal.ordenId}/tareas`, {
                    method: 'POST', headers, body: JSON.stringify({ tareasIds: tareasModal.tareasIds }),
                  });
                  setTareasModal({ open: false, ordenId: 0, tareasIds: [] });
                  fetch('/api/familia/solicitudes', { headers })
                    .then(r => r.json()).then(data => setSolicitudes(data));
                }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:bg-[#F6A5C0]/80 transition-colors"
                >Guardar tareas</button>
                <button onClick={() => setTareasModal({ open: false, ordenId: 0, tareasIds: [] })}
                  className="px-4 py-2.5 rounded-xl border border-[rgba(255,255,255,0.15)] text-[#6667AB] text-sm hover:text-white transition-colors"
                >Cancelar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
