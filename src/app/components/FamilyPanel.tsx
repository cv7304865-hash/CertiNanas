import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  LogOut, Search, MessageSquare, CheckCircle, XCircle, DollarSign, Clock, ListTodo,
  Calendar, Briefcase, Shield, Wallet, Eye, Plus, Edit3, Trash2, AlertTriangle, X,
  Baby, Lock, CreditCard, HelpCircle, ChevronDown, ChevronUp, Star, Send, User,
  Phone, Mail, MapPin, Upload, FileText, Repeat, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';
import { SearchPage } from './SearchPage';
import { MinorsSection } from './MinorsSection';
import { CrearSolicitud } from './CrearSolicitud';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { PaymentEscrow } from './PaymentEscrow';

type Solicitud = {
  Id: number; FechaServicio: string; TotalHoras: number; TarifaHora: number;
  Subtotal: number; TarifaPlataforma: number; Total: number;
  Estado: string; EstadoNegociacion?: string; HoraInicio: string; HoraFin: string;
  CuidadoraId: number; CuidadoraNombres: string; CuidadoraApellidos: string;
  MenorNombre: string | null; MenorDiagnostico: string | null;
  TareaIds?: number[]; FamiliaNombres?: string; FamiliaApellidos?: string;
  TipoServicio?: string; MenorFechaNac?: string | null; IdEscrow?: number;
};

type Miembro = {
  Id: number; Nombre: string; Email: string; Telefono: string;
  Rol: string; FechaCreacion?: string;
};

type Minor = {
  Id: number; Nombre: string; Diagnostico: string | null; FechaNacimiento: string | null;
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

const incidenciaCategorias = [
  'Incumplimiento de horario',
  'Trato inadecuado',
  'Incumplimiento de tareas',
  'Negligencia',
  'Problemas de comunicación',
  'Otros',
];

type Tab = 'buscar' | 'servicios' | 'perfil' | 'familia';

export function FamilyPanel({ onNavigate, onViewContract, onReview }: {
  onNavigate?: (v: string) => void;
  onViewContract?: (id: number) => void;
  onReview?: (id: number) => void;
}) {
  const { user, logout } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [activeTab, setActiveTab] = useState<Tab>('servicios');
  const [loading, setLoading] = useState(true);

  // Data
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [menores, setMenores] = useState<Minor[]>([]);
  const [resultadosCompatibilidad, setResultadosCompatibilidad] = useState<any[]>([]);

  // Tab - Servicios
  const [filtroEstado, setFiltroEstado] = useState('');
  const [detalleModal, setDetalleModal] = useState<{ open: boolean; item: Solicitud | null }>({ open: false, item: null });

  // Tab - Perfil
  const [perfilForm, setPerfilForm] = useState({
    nombres: user?.nombres || '',
    apellidos: user?.apellidos || '',
    email: user?.email || '',
    telefono: '',
    direccion: '',
    latitud: '',
    longitud: '',
  });
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [savingPerfil, setSavingPerfil] = useState(false);

  // Tab - Familia miembros
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [miembroForm, setMiembroForm] = useState({ nombre: '', email: '', telefono: '', rol: 'Observador' });
  const [editMiembroId, setEditMiembroId] = useState<number | null>(null);
  const [showMiembroForm, setShowMiembroForm] = useState(false);

  // Escrow / Incidencia
  const [incidenciaModal, setIncidenciaModal] = useState<{ open: boolean; ordenId: number | null }>({ open: false, ordenId: null });
  const [incidenciaForm, setIncidenciaForm] = useState({ categoria: '', descripcion: '', archivo: null as File | null });
  const [submittingIncidencia, setSubmittingIncidencia] = useState(false);

  // Create solicitud
  const [showCrearSolicitud, setShowCrearSolicitud] = useState(false);

  // Document preview
  const [docPreviewCuidadoraId, setDocPreviewCuidadoraId] = useState<number | null>(null);

  const fetchAll = async () => {
    try {
      const [sol] = await Promise.all([
        fetch('/api/familia/solicitudes', { headers }).then(r => r.json()),
      ]);
      setSolicitudes(sol);
    } catch {}
    setLoading(false);
  };

  const fetchMiembros = async () => {
    try {
      const r = await fetch('/api/familiares/miembros', { headers });
      if (r.ok) setMiembros(await r.json());
    } catch {}
  };

  const fetchCompatibilidad = async () => {
    try {
      const r = await fetch(`/api/matching/resultados/${user?.id}`, { headers });
      if (r.ok) setResultadosCompatibilidad(await r.json());
    } catch {}
  };

  useEffect(() => {
    fetchAll();
    fetchMiembros();
    if (activeTab === 'buscar') fetchCompatibilidad();
    if (localStorage.getItem('showCreateSolicitud') === 'true') {
      localStorage.removeItem('showCreateSolicitud');
      setShowCrearSolicitud(true);
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setPerfilForm(prev => ({
        ...prev,
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const formatFecha = (f: string) => {
    if (!f) return '--';
    const d = new Date(f + 'T00:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatHora = (h: string) => {
    if (!h) return '--';
    const [hh, mm] = h.split(':');
    const hhN = parseInt(hh);
    return `${hhN > 12 ? hhN - 12 : hhN}:${mm} ${hhN >= 12 ? 'PM' : 'AM'}`;
  };

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 9);
    if (d.length > 6) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
    if (d.length > 3) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return d;
  };

  const savePerfil = async () => {
    setSavingPerfil(true);
    try {
      await fetch('/api/familia/perfil', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          nombres: perfilForm.nombres,
          apellidos: perfilForm.apellidos,
          telefono: perfilForm.telefono,
          direccion: perfilForm.direccion,
          latitud: parseFloat(perfilForm.latitud) || null,
          longitud: parseFloat(perfilForm.longitud) || null,
        }),
      });
      if (fotoPreview && fotoPreview.startsWith('data:')) {
        await fetch('/api/familia/perfil/foto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) },
          body: JSON.stringify({ fotoPerfil: fotoPreview }),
        });
      }
    } catch {}
    setSavingPerfil(false);
  };

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Miembros CRUD
  const saveMiembro = async () => {
    if (!miembroForm.nombre.trim() || !miembroForm.email.trim()) return;
    const url = editMiembroId
      ? `/api/familiares/miembros/${editMiembroId}`
      : '/api/familiares/miembros';
    await fetch(url, {
      method: editMiembroId ? 'PUT' : 'POST',
      headers,
      body: JSON.stringify(miembroForm),
    });
    setMiembroForm({ nombre: '', email: '', telefono: '', rol: 'Observador' });
    setEditMiembroId(null);
    setShowMiembroForm(false);
    fetchMiembros();
  };

  const deleteMiembro = async (id: number) => {
    await fetch(`/api/familiares/miembros/${id}`, { method: 'DELETE', headers });
    setMiembros(prev => prev.filter(m => m.Id !== id));
  };

  // Incidencia
  const submitIncidencia = async () => {
    if (!incidenciaForm.categoria || !incidenciaForm.descripcion || !incidenciaForm.archivo) return;
    setSubmittingIncidencia(true);
    try {
      const formData = new FormData();
      formData.append('categoria', incidenciaForm.categoria);
      formData.append('descripcion', incidenciaForm.descripcion);
      formData.append('archivo', incidenciaForm.archivo);
      await fetch(`/api/familia/reportar-incidencia`, {
        method: 'POST',
        headers: { 'x-user-id': String(user?.id) },
        body: formData,
      });
      setIncidenciaModal({ open: false, ordenId: null });
      setIncidenciaForm({ categoria: '', descripcion: '', archivo: null });
    } catch {}
    setSubmittingIncidencia(false);
  };

  const completarServicio = async (id: number) => {
    await fetch(`/api/familia/completar-servicio/${id}`, { method: 'PUT', headers });
    fetchAll();
  };

  const contratarDeNuevo = async (s: Solicitud) => {
    localStorage.setItem('preselectCuidadoraId', String(s.CuidadoraId));
    localStorage.setItem('showCreateSolicitud', 'true');
    onNavigate?.('search');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#210635] via-[#420D4B] to-[#7B337E] flex items-center justify-center">
        <div className="text-[#6667AB] text-sm">Cargando...</div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'buscar', label: 'Buscar', icon: Search },
    { key: 'servicios', label: 'Mis Servicios', icon: Briefcase },
    { key: 'perfil', label: 'Mi Perfil', icon: User },
    { key: 'familia', label: 'Mi Familia', icon: Baby },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
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
            <div className="flex items-center gap-2">
              <ProfileAvatar size={36} className="ml-2" />
              <button onClick={logout} className="p-2 hover:bg-[rgba(33,6,53,0.4)] rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-[#6667AB]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-[rgba(33,6,53,0.5)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-1.5 overflow-x-auto">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === t.key
                    ? 'bg-[#F6A5C0] text-[#210635] shadow-md'
                    : 'text-[#F5D5E0]/60 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ═══ TAB 1: BUSCAR ═══ */}
        {activeTab === 'buscar' && (
          <div className="space-y-6">
            <SearchPage onNavigate={(v) => {
              if (v === 'familia') setActiveTab('servicios');
              else onNavigate?.(v);
            }} />
          </div>
        )}

        {/* ═══ TAB 2: MIS SERVICIOS ═══ */}
        {activeTab === 'servicios' && (
          <div className="space-y-6">
            {showCrearSolicitud ? (
              <CrearSolicitud
                onBack={() => setShowCrearSolicitud(false)}
                onSuccess={() => { setShowCrearSolicitud(false); fetchAll(); }}
              />
            ) : (
            <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Mis Servicios</h2>
              <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] text-white text-xs appearance-none cursor-pointer"
              >
                <option value="">Todos</option>
                {Object.keys(statusPill).map(k => (
                  <option key={k} value={k}>{statusText[k] || k}</option>
                ))}
              </select>
            </div>

            {solicitudes.filter(s => !filtroEstado || s.Estado === filtroEstado).length === 0 ? (
              <div className="text-center py-16 bg-[rgba(33,6,53,0.3)] rounded-2xl">
                <Briefcase className="w-12 h-12 text-[#6667AB] mx-auto mb-3 opacity-50" />
                <p className="text-white font-semibold">No hay servicios registrados</p>
                <p className="text-[#F5D5E0]/60 text-sm mt-1">
                  Busca cuidadoras y contrata un servicio para comenzar
                </p>
                <button onClick={() => setActiveTab('buscar')}
                  className="mt-5 px-6 py-2.5 rounded-full bg-linear-to-r from-[#7B337E] to-[#F6A5C0] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Buscar cuidadoras
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {solicitudes.filter(s => !filtroEstado || s.Estado === filtroEstado).map(s => (
                  <motion.div key={s.Id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-white font-bold">{s.CuidadoraNombres} {s.CuidadoraApellidos}</p>
                          <p className="text-[#F5D5E0]/60 text-xs mt-0.5">
                            {formatFecha(s.FechaServicio)} · {formatHora(s.HoraInicio)} - {formatHora(s.HoraFin)}
                          </p>
                        </div>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusPill[s.Estado] || 'bg-[rgba(33,6,53,0.5)] text-[#6667AB] border-transparent'}`}>
                          {statusText[s.Estado] || s.Estado}
                        </span>
                      </div>

                      {s.MenorNombre && (
                        <div className="text-xs text-[#F5D5E0]/60 mb-3">
                          Menor: <span className="text-white">{s.MenorNombre}</span>
                          {s.MenorDiagnostico && <span className="text-[#CC8DB3]"> ({s.MenorDiagnostico})</span>}
                        </div>
                      )}

                      <div className="flex items-center justify-between bg-[rgba(255,255,255,0.04)] rounded-xl px-4 py-3 mb-3">
                        <span className="text-xs text-[#F5D5E0]/60">{s.TotalHoras}h × S/ {s.TarifaHora}/h</span>
                        <span className="text-lg font-bold text-white">S/ {(s.Total ?? 0).toFixed(2)}</span>
                      </div>

                      {/* Escrow Lifecycle */}
                      {s.Estado === 'Pagada' && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <button onClick={() => completarServicio(s.Id)}
                              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition-all"
                            >
                              <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                              Completar Servicio
                            </button>
                            <button onClick={() => setIncidenciaModal({ open: true, ordenId: s.Id })}
                              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold hover:bg-red-500/30 transition-all"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                              Reportar Incidencia
                            </button>
                          </div>
                        </div>
                      )}

                      {(s.Estado === 'Completada' || s.Estado === 'Finalizada') && (
                        <div className="flex gap-2">
                          <button onClick={() => onReview?.(s.Id)}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-[#F6A5C0]/20 border border-[#F6A5C0]/30 text-[#F6A5C0] text-xs font-bold hover:bg-[#F6A5C0]/30 transition-all"
                          >
                            <Star className="w-3.5 h-3.5 inline mr-1" />
                            Dejar Reseña
                          </button>
                          <button onClick={() => contratarDeNuevo(s)}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-[#F5D5E0]/80 text-xs font-bold hover:bg-[rgba(255,255,255,0.15)] transition-all"
                          >
                            <Repeat className="w-3.5 h-3.5 inline mr-1" />
                            Volver a contratar
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                        <button onClick={() => setDetalleModal({ open: true, item: s })}
                          className="text-[10px] text-[#F6A5C0] hover:text-[#CC8DB3] transition-colors font-semibold"
                        >
                          <Eye className="w-3 h-3 inline mr-1" /> Ver Detalle
                        </button>
                        <button onClick={() => setDocPreviewCuidadoraId(s.CuidadoraId)}
                          className="text-[10px] text-[#F5D5E0]/60 hover:text-white transition-colors font-semibold"
                        >
                          <FileText className="w-3 h-3 inline mr-1" /> Ver Documentos
                        </button>
                        <button onClick={() => onViewContract?.(s.Id)}
                          className="text-[10px] text-[#6667AB] hover:text-white transition-colors font-semibold"
                        >
                          Contrato
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            </>
            )}
          </div>
        )}

        {/* ═══ TAB 3: MI PERFIL ═══ */}
        {activeTab === 'perfil' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6 sm:p-8"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#F6A5C0]" /> Información Personal
              </h2>

              {/* Foto */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-[#F6A5C0]" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#CC8DB3]/20 flex items-center justify-center text-2xl font-bold text-[#CC8DB3] border-2 border-dashed border-[rgba(255,255,255,0.2)]">
                      {user?.nombres?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Foto de perfil</p>
                  <p className="text-[#6667AB] text-xs mb-2">PNG, JPG. Máx 2MB</p>
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[rgba(246,165,192,0.15)] border border-[#F6A5C0]/30 text-[#F6A5C0] text-xs font-bold cursor-pointer hover:bg-[rgba(246,165,192,0.25)] transition-all">
                    <Upload className="w-3.5 h-3.5" /> Subir foto
                    <input type="file" accept="image/*" className="hidden" onChange={handleFotoUpload} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Nombres</label>
                  <input type="text" value={perfilForm.nombres} onChange={e => setPerfilForm(f => ({ ...f, nombres: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Apellidos</label>
                  <input type="text" value={perfilForm.apellidos} onChange={e => setPerfilForm(f => ({ ...f, apellidos: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Email</label>
                  <input type="email" value={perfilForm.email} disabled
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.3)] border border-[rgba(255,255,255,0.1)] text-white/50 text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Teléfono</label>
                  <input type="text" value={perfilForm.telefono} onChange={e => setPerfilForm(f => ({ ...f, telefono: formatPhone(e.target.value) }))}
                    placeholder="999 999 999"
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Dirección</label>
                  <input type="text" value={perfilForm.direccion} onChange={e => setPerfilForm(f => ({ ...f, direccion: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Latitud</label>
                  <input type="text" value={perfilForm.latitud} onChange={e => setPerfilForm(f => ({ ...f, latitud: e.target.value }))}
                    placeholder="-8.115"
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Longitud</label>
                  <input type="text" value={perfilForm.longitud} onChange={e => setPerfilForm(f => ({ ...f, longitud: e.target.value }))}
                    placeholder="-79.028"
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm font-mono"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button onClick={savePerfil} disabled={savingPerfil}
                  className="px-6 py-2.5 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:bg-[#F6A5C0]/80 transition-all disabled:opacity-50"
                >{savingPerfil ? 'Guardando...' : 'Guardar cambios'}</button>
              </div>
            </motion.div>

            <MinorsSection />
          </div>
        )}

        {/* ═══ TAB 4: MI FAMILIA ═══ */}
        {activeTab === 'familia' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Baby className="w-5 h-5 text-[#F6A5C0]" /> Miembros de la Familia
                </h2>
                <button onClick={() => { setShowMiembroForm(true); setEditMiembroId(null); setMiembroForm({ nombre: '', email: '', telefono: '', rol: 'Observador' }); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F6A5C0] text-[#210635] text-xs font-bold hover:bg-[#F6A5C0]/80 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>

              {miembros.length === 0 && !showMiembroForm ? (
                <div className="text-center py-10">
                  <User className="w-10 h-10 text-[#6667AB] mx-auto mb-2" />
                  <p className="text-[#6667AB] text-sm">Aún no has agregado miembros familiares</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {miembros.map(m => (
                    <div key={m.Id} className="bg-[rgba(255,255,255,0.04)] rounded-xl p-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#CC8DB3]/20 flex items-center justify-center text-sm font-bold text-[#CC8DB3]">
                          {m.Nombre.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{m.Nombre}</p>
                          <p className="text-[#F5D5E0]/60 text-xs">{m.Email}</p>
                          {m.Telefono && <p className="text-[#F5D5E0]/40 text-[10px]">{m.Telefono}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          m.Rol === 'Administrador' ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30' : 'bg-[rgba(102,103,171,0.2)] text-[#6667AB] border border-[rgba(102,103,171,0.3)]'
                        }`}>
                          {m.Rol}
                        </span>
                        <button onClick={() => { setEditMiembroId(m.Id); setMiembroForm({ nombre: m.Nombre, email: m.Email, telefono: m.Telefono || '', rol: m.Rol }); setShowMiembroForm(true); }}
                          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-all"
                        ><Edit3 className="w-3.5 h-3.5 text-[#6667AB]" /></button>
                        <button onClick={() => deleteMiembro(m.Id)}
                          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-all"
                        ><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add/Edit Form */}
              <AnimatePresence>
                {showMiembroForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)] space-y-3">
                      <div>
                        <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Nombre completo</label>
                        <input type="text" value={miembroForm.nombre} onChange={e => setMiembroForm(f => ({ ...f, nombre: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm"
                          placeholder="Nombre del miembro"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Email</label>
                          <input type="email" value={miembroForm.email} onChange={e => setMiembroForm(f => ({ ...f, email: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm"
                            placeholder="correo@ejemplo.com"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Teléfono</label>
                          <input type="text" value={miembroForm.telefono} onChange={e => setMiembroForm(f => ({ ...f, telefono: formatPhone(e.target.value) }))}
                            className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm"
                            placeholder="999 999 999"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Rol</label>
                        <select value={miembroForm.rol} onChange={e => setMiembroForm(f => ({ ...f, rol: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm"
                        >
                          <option value="Administrador">Administrador</option>
                          <option value="Observador">Observador</option>
                        </select>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={saveMiembro}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:bg-[#F6A5C0]/80 transition-all"
                        >{editMiembroId ? 'Guardar cambios' : 'Agregar miembro'}</button>
                        <button onClick={() => { setShowMiembroForm(false); setEditMiembroId(null); }}
                          className="px-4 py-2.5 rounded-xl border border-[rgba(255,255,255,0.15)] text-[#6667AB] text-sm hover:text-white transition-colors"
                        >Cancelar</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      <AnimatePresence>
        {detalleModal.open && detalleModal.item && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[rgba(33,6,53,0.95)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.12)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6">
                <button onClick={() => setDetalleModal({ open: false, item: null })}
                  className="float-right p-1.5 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
                ><X className="w-4 h-4 text-[#6667AB]" /></button>
                <h3 className="text-lg font-bold text-white mb-4">Detalle del Servicio</h3>
                {detalleModal.item && (
                  <div className="space-y-4">
                    <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-[#CC8DB3]/20 flex items-center justify-center text-sm font-bold text-[#CC8DB3]">
                          {(detalleModal.item.CuidadoraNombres?.charAt(0) || '') + (detalleModal.item.CuidadoraApellidos?.charAt(0) || '')}
                        </div>
                        <div>
                          <p className="text-white font-bold">{detalleModal.item.CuidadoraNombres} {detalleModal.item.CuidadoraApellidos}</p>
                          <p className="text-[#F5D5E0]/60 text-xs">{formatFecha(detalleModal.item.FechaServicio)} · {formatHora(detalleModal.item.HoraInicio)} - {formatHora(detalleModal.item.HoraFin)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-[#6667AB]">Horas:</span> <span className="text-white">{detalleModal.item.TotalHoras}h</span></div>
                        <div><span className="text-[#6667AB]">Tarifa:</span> <span className="text-white">S/ {detalleModal.item.TarifaHora}/h</span></div>
                        <div><span className="text-[#6667AB]">Subtotal:</span> <span className="text-white">S/ {(detalleModal.item.Subtotal ?? 0).toFixed(2)}</span></div>
                        <div><span className="text-[#6667AB]">Comisión:</span> <span className="text-white">S/ {(detalleModal.item.TarifaPlataforma ?? 0).toFixed(2)}</span></div>
                        <div className="col-span-2"><span className="text-[#6667AB]">Total:</span> <span className="text-white font-bold">S/ {(detalleModal.item.Total ?? 0).toFixed(2)}</span></div>
                      </div>
                      {detalleModal.item.MenorNombre && (
                        <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] text-xs">
                          <span className="text-[#6667AB]">Menor: </span><span className="text-white">{detalleModal.item.MenorNombre}</span>
                          {detalleModal.item.MenorDiagnostico && <span className="text-[#CC8DB3]"> ({detalleModal.item.MenorDiagnostico})</span>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── INCIDENCIA MODAL ── */}
      <AnimatePresence>
        {incidenciaModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[rgba(33,6,53,0.95)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.12)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" /> Reportar Incidencia
                </h3>
                <button onClick={() => setIncidenciaModal({ open: false, ordenId: null })}
                  className="p-1.5 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
                ><X className="w-4 h-4 text-[#6667AB]" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Categoría de la falta</label>
                  <select value={incidenciaForm.categoria} onChange={e => setIncidenciaForm(f => ({ ...f, categoria: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm"
                  >
                    <option value="">Selecciona una categoría</option>
                    {incidenciaCategorias.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Descripción detallada</label>
                  <textarea value={incidenciaForm.descripcion} onChange={e => setIncidenciaForm(f => ({ ...f, descripcion: e.target.value }))} rows={4}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm resize-none"
                    placeholder="Describe lo sucedido con el mayor detalle posible..."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Archivo de evidencia (obligatorio)</label>
                  <div className="border-2 border-dashed border-[rgba(255,255,255,0.15)] rounded-xl p-4 text-center hover:border-[#F6A5C0]/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('incidencia-file')?.click()}
                  >
                    {incidenciaForm.archivo ? (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-[#F6A5C0]" />
                        <span className="text-white">{incidenciaForm.archivo.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); setIncidenciaForm(f => ({ ...f, archivo: null })); }}
                          className="text-red-400 hover:text-red-300"
                        ><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-[#6667AB] mx-auto mb-1" />
                        <p className="text-xs text-[#6667AB]">Haz clic para seleccionar un archivo</p>
                        <p className="text-[10px] text-[#6667AB]/60">PDF, JPG, PNG (máx 10MB)</p>
                      </>
                    )}
                    <input id="incidencia-file" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                      onChange={e => setIncidenciaForm(f => ({ ...f, archivo: e.target.files?.[0] || null }))}
                    />
                  </div>
                </div>

                <button onClick={submitIncidencia} disabled={submittingIncidencia || !incidenciaForm.categoria || !incidenciaForm.descripcion || !incidenciaForm.archivo}
                  className="w-full py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {submittingIncidencia ? 'Enviando...' : 'Enviar Reporte'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DOCUMENT PREVIEW MODAL ── */}
      <AnimatePresence>
        {docPreviewCuidadoraId && (
          <DocumentPreviewModal
            isOpen={true}
            onClose={() => setDocPreviewCuidadoraId(null)}
            cuidadoraId={docPreviewCuidadoraId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
