import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  LogOut, Search, MessageSquare, CheckCircle, XCircle, DollarSign, Clock, ListTodo,
  Calendar, Briefcase, Shield, Wallet, Eye, Plus, Edit3, Trash2, AlertTriangle, X,
  Baby, Lock, CreditCard, HelpCircle, ChevronDown, ChevronUp, Star, Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';
import { ChecklistTareas } from './ChecklistTareas';
import { CrearSolicitud } from './CrearSolicitud';

type Solicitud = {
  Id: number; FechaServicio: string; TotalHoras: number; TarifaHora: number;
  Subtotal: number; TarifaPlataforma: number; Total: number;
  Estado: string; EstadoNegociacion?: string; HoraInicio: string; HoraFin: string;
  CuidadoraId: number; CuidadoraNombres: string; CuidadoraApellidos: string;
  MenorNombre: string | null; MenorDiagnostico: string | null;
  TareaIds?: number[];
};

type Minor = {
  Id: number; Nombre: string; Diagnostico: string | null; FechaNacimiento: string | null;
};

type Cita = {
  Id: number; FechaCita: string; HoraCita: string; Modalidad: string;
  Estado: string; DuracionMinutos: number; CuidadoraId: number;
  CuidadoraNombres: string; CuidadoraApellidos: string;
};

type PropuestaNegociacion = {
  Id: number; IdOrden: number; IdPropuestoPor: number;
  TarifaHora: number | null; TotalHoras: number | null;
  HoraInicio: string | null; HoraFin: string | null;
  Mensaje: string | null; Estado: string; FechaCreacion: string;
  PropuestoPorNombres?: string; PropuestoPorApellidos?: string;
};

type SolicitudDetalle = Solicitud & {
  FamiliaNombres: string; FamiliaApellidos: string;
  TipoServicio: string; MenorFechaNac: string | null;
  IdEscrow?: number;
};

const statusPill: Record<string, string> = {
  Pendiente: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Confirmada: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Pagada: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Completada: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
  Finalizada: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
  Cancelada: 'bg-red-500/15 text-red-300 border-red-500/30',
  'En curso': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
};

const statusText: Record<string, string> = {
  Pendiente: 'Pendiente',
  Confirmada: 'Confirmado - Pago retenido',
  Pagada: 'Pagado - En curso',
  Completada: 'Finalizado',
  Finalizada: 'Finalizado',
  Cancelada: 'Cancelada',
  'En curso': 'En curso',
};

const negState: Record<string, string> = {
  Pendiente: 'Esperando respuesta',
  Aceptada: 'Aceptada',
  Negociacion: 'En negociación',
  Reunion: 'Acordado',
  Acordado: 'Acordado',
  Cancelada: 'Cancelada',
};

const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function FamilyPanel({ onNavigate, onViewContract, onReview }: {
  onNavigate?: (v: string) => void;
  onViewContract?: (id: number) => void;
  onReview?: (id: number) => void;
}) {
  const { user, logout } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };

  // Data
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [menores, setMenores] = useState<Minor[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroMes, setFiltroMes] = useState('');

  // Modals
  const [detalle, setDetalle] = useState<{ open: boolean; id: number }>({ open: false, id: 0 });
  const [detalleData, setDetalleData] = useState<SolicitudDetalle | null>(null);
  const [negModal, setNegModal] = useState<{ open: boolean; ordenId: number }>({ open: false, ordenId: 0 });
  const [propuestas, setPropuestas] = useState<PropuestaNegociacion[]>([]);
  const [responding, setResponding] = useState(false);
  const [counterForm, setCounterForm] = useState({ tarifaHora: 0, totalHoras: 0, horaInicio: '', horaFin: '', mensaje: '' });
  const [showCounter, setShowCounter] = useState(false);
  const [tareasModal, setTareasModal] = useState<{ open: boolean; ordenId: number; tareasIds: number[] }>({ open: false, ordenId: 0, tareasIds: [] });

  // Hijos
  const [hijosModal, setHijosModal] = useState(false);
  const [minorForm, setMinorForm] = useState({ nombre: '', diagnostico: '', fechaNacimiento: '' });
  const [editMinorId, setEditMinorId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchAll = () => {
    Promise.all([
      fetch('/api/familia/solicitudes', { headers }).then(r => r.json()),
      fetch('/api/familia/menores', { headers }).then(r => r.json()),
      fetch('/api/familia/citas', { headers }).then(r => r.json()),
    ]).then(([sol, men, cit]) => {
      setSolicitudes(sol);
      setMenores(men);
      setCitas(cit);
      setLoading(false);
    }).catch(() => setLoading(false));
    if (localStorage.getItem('showCreateSolicitud') === 'true') {
      localStorage.removeItem('showCreateSolicitud');
      setShowCreate(true);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // --- KPIs ---
  const filtrados = solicitudes.filter(s => {
    if (filtroEstado && s.Estado !== filtroEstado) return false;
    if (filtroMes) {
      const m = new Date(s.FechaServicio + 'T00:00:00').getMonth();
      if (meses[m] !== filtroMes) return false;
    }
    return true;
  });

  const contratados = solicitudes.filter(s =>
    s.Estado === 'Pagada' || s.Estado === 'Completada' || s.Estado === 'Finalizada'
  );
  const retenidoEscrow = solicitudes
    .filter(s => s.Estado === 'Pagada')
    .reduce((sum, s) => sum + s.Total, 0);
  const totalInvertido = contratados.reduce((sum, s) => sum + s.Total, 0);

  // --- Menores CRUD ---
  const saveMinor = async () => {
    if (!minorForm.nombre.trim()) return;
    const url = editMinorId
      ? `/api/familia/menores/${editMinorId}`
      : '/api/familia/menores';
    await fetch(url, {
      method: editMinorId ? 'PUT' : 'POST',
      headers, body: JSON.stringify(minorForm),
    });
    setMinorForm({ nombre: '', diagnostico: '', fechaNacimiento: '' });
    setEditMinorId(null);
    const r = await fetch('/api/familia/menores', { headers });
    setMenores(await r.json());
  };

  const deleteMinor = async (id: number) => {
    await fetch(`/api/familia/menores/${id}`, { method: 'DELETE', headers });
    setMenores(prev => prev.filter(m => m.Id !== id));
  };

  // --- Negotiation ---
  const loadPropuestas = async (ordenId: number) => {
    const r = await fetch(`/api/familia/orden/${ordenId}/propuestas`, { headers });
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
      fetchAll();
    }
  };

  // --- Detail ---
  const openDetalle = async (id: number) => {
    setDetalle({ open: true, id });
    const r = await fetch(`/api/familia/solicitudes/${id}`, { headers });
    if (r.ok) setDetalleData(await r.json());
  };

  const confirmarFin = async (id: number) => {
    await fetch(`/api/familia/orden/${id}/confirmar-finalizacion`, { method: 'POST', headers });
    fetchAll();
    if (detalle.open && detalleData?.Id === id) {
      const r = await fetch(`/api/familia/solicitudes/${id}`, { headers });
      if (r.ok) setDetalleData(await r.json());
    }
  };

  const formatFecha = (f: string) => {
    const d = new Date(f + 'T00:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatHora = (h: string) => {
    if (!h) return '--';
    const [hh, mm] = h.split(':');
    const hhN = parseInt(hh);
    return `${hhN > 12 ? hhN - 12 : hhN}:${mm} ${hhN >= 12 ? 'PM' : 'AM'}`;
  };

  const getIniciales = (n: string, a: string) => {
    const names = n?.split(' ');
    return `${names?.[0]?.charAt(0) || ''}${a?.charAt(0) || ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#210635] via-[#420D4B] to-[#7B337E] flex items-center justify-center">
        <div className="text-[#6667AB] text-sm">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
      {/* ── NAVBAR ── */}
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
              <button onClick={() => onNavigate?.('familia')} className="text-sm font-bold text-[#f6a5c0] border-b-2 border-[#f6a5c0] pb-0.5">Mi Panel</button>
              <button onClick={() => onNavigate?.('messages')} className="text-sm text-[#F5D5E0]/70 hover:text-white transition-colors">Mensajes</button>
              <ProfileAvatar size={36} className="ml-2" />
              <button onClick={logout} className="p-2 hover:bg-[rgba(33,6,53,0.4)] rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-[#6667AB]" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── GREETING ── */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Hola, {user?.nombres?.split(' ')[0] || 'Familia'}
          </h1>
          <p className="text-[#F5D5E0] text-sm mt-1">Gestiona tus servicios, pagos y mucho más</p>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: 'Entrevistas agendadas', value: String(citas.length), bg: 'bg-[rgba(102,103,171,0.2)]' },
            { icon: Briefcase, label: 'Servicios contratados', value: String(contratados.length), bg: 'bg-[rgba(102,103,171,0.2)]' },
            { icon: Lock, label: 'Retenido en Escrow', value: `S/ ${retenidoEscrow.toFixed(2)}`, bg: 'bg-[rgba(251,191,36,0.15)]' },
            { icon: Wallet, label: 'Total invertido', value: `S/ ${totalInvertido.toFixed(2)}`, bg: 'bg-[rgba(246,165,192,0.15)]' },
          ].map((kpi, i) => (
            <motion.div
              key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.1)] rounded-2xl p-5"
            >
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{kpi.value}</p>
              <p className="text-xs text-[#F5D5E0]/70 mt-1">{kpi.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── CREAR SOLICITUD INLINE ── */}
        {showCreate && (
          <CrearSolicitud onBack={() => setShowCreate(false)} onSuccess={() => {
            setShowCreate(false);
            fetchAll();
          }} />
        )}

        {!showCreate && (
        <>
        {/* ── TWO COLUMNS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ═══ LEFT COLUMN (2/3) ═══ */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── MIS ENTREVISTAS ── */}
            <div className="bg-[rgba(33,6,53,0.5)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#F6A5C0]" />
                  Mis entrevistas agendadas
                </h2>
              </div>
              {citas.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="w-12 h-12 text-[#6667AB] mx-auto mb-3 opacity-50" />
                  <p className="text-white font-semibold text-sm">Aún no has agendado entrevistas</p>
                  <p className="text-[#F5D5E0] text-xs mt-1 mb-5">
                    Busca cuidadoras especializadas y agenda una entrevista virtual
                  </p>
                  <button onClick={() => onNavigate?.('search')}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#7B337E] to-[#F6A5C0] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Buscar cuidadoras
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {citas.map(c => (
                    <div key={c.Id} className="bg-[rgba(255,255,255,0.04)] rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#CC8DB3]/20 flex items-center justify-center text-sm font-bold text-[#CC8DB3]">
                          {getIniciales(c.CuidadoraNombres, c.CuidadoraApellidos)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{c.CuidadoraNombres} {c.CuidadoraApellidos}</p>
                          <p className="text-[#F5D5E0]/60 text-xs">{formatFecha(c.FechaCita)} · {formatHora(c.HoraCita)} · {c.Modalidad}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {c.Estado}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── MIS SOLICITUDES ── */}
            <div className="bg-[rgba(33,6,53,0.5)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#F6A5C0]" />
                  Mis solicitudes de servicio
                </h2>
                <button onClick={() => setShowCreate(true)}
                  className="px-4 py-2 rounded-full bg-[#F6A5C0] text-[#210635] text-xs font-bold hover:bg-[#F6A5C0]/80 transition-all flex items-center gap-1.5"
                ><Plus className="w-3.5 h-3.5" /> Nueva solicitud</button>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap gap-3 mb-5">
                <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] text-white text-xs appearance-none cursor-pointer"
                >
                  <option value="">Todos los estados</option>
                  {Object.keys(statusPill).map(k => (
                    <option key={k} value={k}>{statusText[k] || k}</option>
                  ))}
                </select>
                <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] text-white text-xs appearance-none cursor-pointer"
                >
                  <option value="">Todos los meses</option>
                  {meses.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Tabla */}
              {filtrados.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-10 h-10 text-[#6667AB] mx-auto mb-2" />
                  <p className="text-[#6667AB] text-sm">No hay solicitudes con estos filtros</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.06)]">
                        <th className="text-left pb-3 text-[10px] font-semibold text-[#6667AB] uppercase tracking-wider">Cuidadora</th>
                        <th className="text-left pb-3 text-[10px] font-semibold text-[#6667AB] uppercase tracking-wider">Menor</th>
                        <th className="text-left pb-3 text-[10px] font-semibold text-[#6667AB] uppercase tracking-wider">Monto</th>
                        <th className="text-left pb-3 text-[10px] font-semibold text-[#6667AB] uppercase tracking-wider">Estado</th>
                        <th className="text-right pb-3 text-[10px] font-semibold text-[#6667AB] uppercase tracking-wider">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtrados.map(s => (
                        <motion.tr
                          key={s.Id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                        >
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#CC8DB3]/20 flex items-center justify-center text-xs font-bold text-[#CC8DB3] ring-2 ring-[#CC8DB3]/30">
                                {getIniciales(s.CuidadoraNombres, s.CuidadoraApellidos)}
                              </div>
                              <span className="text-white text-sm font-semibold">
                                {s.CuidadoraNombres.split(' ')[0]} {s.CuidadoraApellidos.split(' ')[0]}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            <p className="text-white text-sm">{s.MenorNombre || 'No especificado'}</p>
                            {s.MenorDiagnostico && (
                              <p className="text-[#F5D5E0] text-[10px]">({s.MenorDiagnostico})</p>
                            )}
                          </td>
                          <td className="py-4 pr-4 text-sm font-bold text-white">S/ {s.Total.toFixed(2)}</td>
                          <td className="py-4 pr-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusPill[s.Estado] || 'bg-[rgba(33,6,53,0.5)] text-[#6667AB] border-transparent'}`}>
                              {statusText[s.Estado] || s.Estado}
                            </span>
                            {s.EstadoNegociacion === 'Negociacion' && (
                              <span className="ml-1.5 inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-200 border border-purple-500/30">
                                Negociando
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {s.EstadoNegociacion === 'Negociacion' && (
                                <button onClick={() => openNeg(s.Id)}
                                  className="px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-200 text-[10px] font-bold hover:bg-purple-500/30 transition-all"
                                >Responder</button>
                              )}
                              <button onClick={() => openDetalle(s.Id)}
                                className="px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.15)] text-[#F5D5E0]/80 text-[10px] font-bold hover:text-white hover:border-white/30 transition-all"
                              >Detalle</button>
                              {s.Estado === 'Pendiente' && !s.EstadoNegociacion?.match(/Negociacion|Acordado/) && (
                                <button onClick={async () => {
                                  await fetch(`/api/familia/orden/${s.Id}/aceptar`, { method: 'POST', headers });
                                  fetchAll();
                                }}
                                  className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold hover:bg-emerald-500/30 transition-all"
                                >Aceptar</button>
                              )}
                              {s.Estado === 'Pagada' && (
                                <button onClick={() => confirmarFin(s.Id)}
                                  className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold hover:bg-emerald-500/30 transition-all"
                                >Finalizar</button>
                              )}
                              {(s.Estado === 'Completada' || s.Estado === 'Finalizada') && (
                                <button onClick={() => onReview?.(s.Id)}
                                  className="px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.15)] text-[#F5D5E0]/60 text-[10px] font-bold hover:text-white hover:border-white/30 transition-all"
                                >Evaluar</button>
                              )}
                              <button onClick={() => onViewContract?.(s.Id)}
                                className="text-[10px] text-[#F6A5C0] hover:text-[#CC8DB3] transition-colors font-semibold"
                              >Contrato</button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ═══ RIGHT COLUMN (1/3) ═══ */}
          <div className="space-y-6">

            {/* ── ESTADO DE PAGOS ── */}
            <div className="bg-[rgba(45,12,68,0.75)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-[#F6A5C0]" />
                Estado de Pagos
              </h2>
              <div className="space-y-3">
                <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#F5D5E0]/70">Retenido</span>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">S/ {retenidoEscrow.toFixed(2)}</p>
                  <p className="text-[10px] text-[#F5D5E0]/50 mt-1">Se libera al completar el servicio</p>
                </div>
                <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#F5D5E0]/70">Total liberado</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">S/ {totalInvertido.toFixed(2)}</p>
                  <p className="text-[10px] text-[#F5D5E0]/50 mt-1">Transferido a las cuidadoras</p>
                </div>
              </div>
            </div>

            {/* ── MIS HIJOS ── */}
            <div className="bg-[rgba(33,6,53,0.5)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Baby className="w-4 h-4 text-[#F6A5C0]" />
                  Mis hijos registrados
                </h2>
                <button onClick={() => setHijosModal(true)}
                  className="px-3 py-1.5 rounded-full bg-[#F6A5C0] text-[#210635] text-[10px] font-bold hover:bg-[#F6A5C0]/80 transition-all flex items-center gap-1"
                ><Plus className="w-3 h-3" /> Agregar</button>
              </div>
              {menores.length === 0 ? (
                <p className="text-[#6667AB] text-xs text-center py-6">Aún no has registrado hijos</p>
              ) : (
                <div className="space-y-3">
                  {menores.map(m => (
                    <div key={m.Id} className="bg-[rgba(255,255,255,0.04)] rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-semibold">{m.Nombre}</p>
                          {m.Diagnostico && (
                            <p className="text-[#CC8DB3] text-[10px] mt-0.5">{m.Diagnostico}</p>
                          )}
                          {m.FechaNacimiento && (
                            <p className="text-[#F5D5E0]/40 text-[10px] mt-0.5">
                              {new Date(m.FechaNacimiento).toLocaleDateString('es-PE')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => {
                            setMinorForm({ nombre: m.Nombre, diagnostico: m.Diagnostico || '', fechaNacimiento: m.FechaNacimiento || '' });
                            setEditMinorId(m.Id);
                            setHijosModal(true);
                          }}
                            className="p-1.5 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
                          ><Edit3 className="w-3.5 h-3.5 text-[#6667AB]" /></button>
                          <button onClick={() => deleteMinor(m.Id)}
                            className="p-1.5 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
                          ><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── CÓMO TE PROTEGEMOS ── */}
            <div className="bg-[rgba(33,6,53,0.5)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-[#F6A5C0]" />
                ¿Cómo te protegemos?
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Lock, text: 'El pago se retiene en una cuenta protegida hasta que confirmes que el servicio se completó correctamente.' },
                  { icon: CheckCircle, text: 'Todas nuestras cuidadoras pasan por un proceso de validación de identidad y antecedentes.' },
                  { icon: MessageSquare, text: 'Soporte directo vía chat y mediación del administrador ante cualquier inconveniente.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[rgba(246,165,192,0.15)] flex items-center justify-center shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-[#F6A5C0]" />
                    </div>
                    <p className="text-xs text-[#F5D5E0]/80 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      <AnimatePresence>
        {detalle.open && detalleData && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[rgba(33,6,53,0.95)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.12)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 pb-0">
                <button onClick={() => setDetalle({ open: false, id: 0 })}
                  className="float-right p-1.5 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
                ><X className="w-4 h-4 text-[#6667AB]" /></button>

                {/* Caregiver card */}
                <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#CC8DB3]/20 flex items-center justify-center text-lg font-bold text-[#CC8DB3] ring-2 ring-[#CC8DB3]/30">
                      {getIniciales(detalleData.CuidadoraNombres, detalleData.CuidadoraApellidos)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-base">{detalleData.CuidadoraNombres} {detalleData.CuidadoraApellidos}</p>
                      <p className="text-[#F5D5E0]/60 text-xs">
                        {formatFecha(detalleData.FechaServicio)} · {formatHora(detalleData.HoraInicio)} - {formatHora(detalleData.HoraFin)}
                      </p>
                      <p className="text-[#F5D5E0]/40 text-[10px] mt-0.5">{detalleData.TipoServicio}</p>
                    </div>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusPill[detalleData.Estado] || 'bg-[rgba(33,6,53,0.5)] text-[#6667AB] border-transparent'}`}>
                      {statusText[detalleData.Estado] || detalleData.Estado}
                    </span>
                  </div>
                  {detalleData.MenorNombre && (
                    <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] text-xs text-[#F5D5E0]/70">
                      <span className="text-[#6667AB]">Menor: </span>
                      <span className="text-white">{detalleData.MenorNombre}</span>
                      {detalleData.MenorDiagnostico && (
                        <span className="text-[#CC8DB3]"> ({detalleData.MenorDiagnostico})</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Financial panels */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-[rgba(102,103,171,0.15)] rounded-xl p-4">
                    <p className="text-[10px] text-[#F5D5E0]/60 uppercase tracking-wider mb-1">Total pagado</p>
                    <p className="text-xl font-bold text-white">S/ {detalleData.Total.toFixed(2)}</p>
                    <p className="text-[10px] text-[#F5D5E0]/40 mt-1">
                      S/ {detalleData.Subtotal.toFixed(2)} servicio + S/ {detalleData.TarifaPlataforma.toFixed(2)} comisión
                    </p>
                  </div>
                  <div className="bg-[rgba(16,185,129,0.12)] rounded-xl p-4">
                    <p className="text-[10px] text-[#F5D5E0]/60 uppercase tracking-wider mb-1">Estado Escrow</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {detalleData.Estado === 'Pagada' ? 'Retenido' : detalleData.Estado === 'Completada' || detalleData.Estado === 'Finalizada' ? 'Liberado' : '—'}
                    </p>
                    <p className="text-[10px] text-[#F5D5E0]/40 mt-1">
                      {detalleData.Estado === 'Pagada' ? 'Esperando confirmación de finalización' : detalleData.Estado === 'Completada' ? 'Transferido a la cuidadora' : ''}
                    </p>
                  </div>
                </div>

                {/* Negociación info */}
                {detalleData.EstadoNegociacion && detalleData.EstadoNegociacion !== 'Pendiente' && (
                  <div className="mb-5">
                    <p className="text-[10px] text-[#6667AB] uppercase tracking-wider mb-2 font-semibold">Negociación</p>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      detalleData.EstadoNegociacion === 'Negociacion' ? 'bg-purple-500/20 text-purple-200 border-purple-500/30' :
                      detalleData.EstadoNegociacion === 'Acordado' || detalleData.EstadoNegociacion === 'Reunion' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' :
                      'bg-[rgba(33,6,53,0.5)] text-[#6667AB] border-transparent'
                    }`}>
                      {negState[detalleData.EstadoNegociacion] || detalleData.EstadoNegociacion}
                    </span>
                  </div>
                )}
              </div>

              {/* ── Reportar incidencia ── */}
              <div className="mx-6 p-4 rounded-xl bg-[rgba(209,66,66,0.08)] border border-[rgba(209,66,66,0.15)] mb-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#F5D5E0] font-semibold">¿Problemas con el servicio?</p>
                    <p className="text-[10px] text-[#F5D5E0]/60 mt-0.5">
                      Si tienes algún inconveniente, puedes reportarlo y el administrador lo revisará.
                    </p>
                    <button onClick={() => onNavigate?.('messages')}
                      className="mt-2 px-3 py-1.5 rounded-full border border-[#D14242] text-[#D14242] text-[10px] font-bold hover:bg-[rgba(209,66,66,0.1)] transition-all"
                    ><Plus className="w-3 h-3 inline mr-1" />Reportar incidencia</button>
                  </div>
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="p-6 pt-0 flex gap-3">
                <button onClick={() => {
                  setDetalle({ open: false, id: 0 });
                  onNavigate?.('messages');
                }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all"
                ><MessageSquare className="w-4 h-4 inline mr-1.5" />Ir a mensajes</button>
                <button onClick={() => setDetalle({ open: false, id: 0 })}
                  className="px-4 py-2.5 rounded-xl text-[#6667AB] text-sm hover:text-white transition-colors"
                >Cerrar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NEGOTIATION MODAL ── */}
      <AnimatePresence>
        {negModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[rgba(33,6,53,0.95)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.12)] rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-4">Propuesta de la cuidadora</h3>
              {propuestas.filter(p => p.Estado === 'activa').map(p => (
                <div key={p.Id} className="space-y-4">
                  <div className="bg-[rgba(255,255,255,0.04)] rounded-xl p-4 space-y-2">
                    {p.TarifaHora && (
                      <div className="flex items-center gap-2 text-sm"><DollarSign className="w-4 h-4 text-[#F6A5C0]" />
                        <span className="text-[#6667AB]">Tarifa:</span><span className="text-white font-bold">S/ {p.TarifaHora}/hora</span>
                      </div>
                    )}
                    {p.TotalHoras && (
                      <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-[#F6A5C0]" />
                        <span className="text-[#6667AB]">Horas:</span><span className="text-white font-bold">{p.TotalHoras}h</span>
                      </div>
                    )}
                    {p.HoraInicio && (
                      <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-[#F6A5C0]" />
                        <span className="text-[#6667AB]">Horario:</span><span className="text-white font-bold">{p.HoraInicio} - {p.HoraFin}</span>
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

      {/* ── TAREAS MODAL ── */}
      <AnimatePresence>
        {tareasModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[rgba(33,6,53,0.95)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.12)] rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl"
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
                  fetchAll();
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

      {/* ── HIJOS MODAL ── */}
      <AnimatePresence>
        {hijosModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[rgba(33,6,53,0.95)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.12)] rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-4">{editMinorId ? 'Editar hijo' : 'Agregar hijo'}</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-[#6667AB] block mb-1">Nombre</label>
                  <input type="text" value={minorForm.nombre} onChange={e => setMinorForm(f => ({ ...f, nombre: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm"
                    placeholder="Nombre del menor"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6667AB] block mb-1">Diagnóstico (opcional)</label>
                  <input type="text" value={minorForm.diagnostico} onChange={e => setMinorForm(f => ({ ...f, diagnostico: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm"
                    placeholder="Ej: TEA, TDAH, Síndrome de Down"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6667AB] block mb-1">Fecha de nacimiento (opcional)</label>
                  <input type="date" value={minorForm.fechaNacimiento} onChange={e => setMinorForm(f => ({ ...f, fechaNacimiento: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm [color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={saveMinor}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:bg-[#F6A5C0]/80 transition-colors"
                >{editMinorId ? 'Guardar cambios' : 'Agregar'}</button>
                <button onClick={() => { setHijosModal(false); setEditMinorId(null); setMinorForm({ nombre: '', diagnostico: '', fechaNacimiento: '' }); }}
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
