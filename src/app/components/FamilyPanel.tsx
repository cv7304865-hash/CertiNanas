import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  LogOut, Search, MessageSquare, CheckCircle, XCircle, DollarSign, Clock, ListTodo,
  Calendar, Briefcase, Shield, Wallet, Eye, Plus, Edit3, Trash2, AlertTriangle, X,
  Baby, Lock, CreditCard, HelpCircle, ChevronDown, ChevronUp, Star, Send, User,
  Phone, Mail, MapPin, Upload, FileText, Repeat, AlertCircle, RefreshCw, Activity, BarChart3
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';
import { UserMenu } from './UserMenu';
import { SearchPage } from './SearchPage';
import { MinorsSection } from './MinorsSection';
import { CrearSolicitud } from './CrearSolicitud';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { PaymentEscrow } from './PaymentEscrow';
import { ContractFormat } from './ContractFormat';
import { ErrorBoundary } from './ErrorBoundary';

type Solicitud = {
  Id: number; FechaServicio: string; TotalHoras: number; TarifaHora: number;
  Subtotal: number; TarifaPlataforma: number; Total: number;
  Estado: string; EstadoNegociacion?: string; HoraInicio: string; HoraFin: string;
  CuidadoraId: number; CuidadoraNombres: string; CuidadoraApellidos: string;
  MenorNombre: string | null; MenorDiagnostico: string | null;
  TareaIds?: number[]; FamiliaNombres?: string; FamiliaApellidos?: string;
  TipoServicio?: string; MenorFechaNac?: string | null; IdEscrow?: number;
  ConfirmadaFamilia?: number; ConfirmadaCuidadora?: number;
  AceptadoAdmin?: number; AceptadoContratoCuidadora?: number;
};

type Miembro = {
  Id: number; Nombre: string; Email: string; Telefono: string;
  Rol: string; FechaCreacion?: string;
};

type Minor = {
  Id: number; Nombre: string; Diagnostico: string | null; FechaNacimiento: string | null;
};

type Cita = {
  Id: number; FechaCita: string; HoraCita: string; Modalidad: string; Estado: string;
  CuidadoraId: number; CuidadoraNombres: string; CuidadoraApellidos: string;
};

type StatsResumen = {
  totalEntrevistas: number; totalServicios: number; totalEscrow: number; totalInvertido: number;
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
  const [citas, setCitas] = useState<Cita[]>([]);
  const [stats, setStats] = useState<StatsResumen>({ totalEntrevistas: 0, totalServicios: 0, totalEscrow: 0, totalInvertido: 0 });

  // Tab - Servicios
  const [filtroEstado, setFiltroEstado] = useState('');
  const [detalleModal, setDetalleModal] = useState<{ open: boolean; item: Solicitud | null }>({ open: false, item: null });
  const [detalleData, setDetalleData] = useState<any>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [showContractFormat, setShowContractFormat] = useState(false);
  const [contractViewData, setContractViewData] = useState<any>(null);
  const [loadingContract, setLoadingContract] = useState(false);
  const [showContractPreview, setShowContractPreview] = useState(false);

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
      const [sol, citasData] = await Promise.all([
        fetch('/api/familia/solicitudes', { headers }).then(r => r.json()),
        fetch('/api/familia/citas', { headers }).then(r => r.json().catch(() => [])),
      ]);
      setSolicitudes(sol);
      setCitas(citasData);
      const totalEscrow = sol.reduce((sum: number, s: Solicitud) =>
        s.Estado === 'Pagada' || s.Estado === 'En curso' ? sum + (s.Total || 0) : sum, 0);
      const totalInvertido = sol.reduce((sum: number, s: Solicitud) =>
        s.Estado === 'Completada' || s.Estado === 'Finalizada' ? sum + (s.Total || 0) : sum, 0);
      setStats({
        totalEntrevistas: citasData.length,
        totalServicios: sol.length,
        totalEscrow,
        totalInvertido,
      });
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

  const fetchDetalleCompleto = async (ordenId: number) => {
    setCargandoDetalle(true);
    setDetalleData(null);
    try {
      const r = await fetch(`/api/familia/solicitudes/${ordenId}/detalle`, { headers });
      if (r.ok) {
        setDetalleData(await r.json());
      } else {
        let msg = `Error ${r.status}`;
        try { const e = await r.json(); msg = e.error || msg; } catch {}
        setDetalleData({ error: msg });
      }
    } catch {
      setDetalleData({ error: 'No se pudo conectar con el servidor' });
    }
    setCargandoDetalle(false);
  };

  const handleViewContract = async (s: Solicitud) => {
    setLoadingContract(true);
    setShowContractFormat(true);
    setContractViewData(null);
    try {
      const r = await fetch(`/api/familia/solicitudes/${s.Id}/detalle`, { headers });
      if (r.ok) {
        setContractViewData(await r.json());
      } else {
        let msg = `Error ${r.status}`;
        try { const e = await r.json(); msg = e.error || msg; } catch {}
        setContractViewData({ error: msg });
      }
    } catch {
      setContractViewData({ error: 'No se pudo conectar con el servidor' });
    }
    setLoadingContract(false);
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
    } catch {}
    setSavingPerfil(false);
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
      if (incidenciaModal.ordenId) formData.append('ordenId', String(incidenciaModal.ordenId));
      formData.append('categoria', incidenciaForm.categoria);
      formData.append('descripcion', incidenciaForm.descripcion);
      formData.append('archivo', incidenciaForm.archivo);
      formData.append('finalizar', '1');
      await fetch(`/api/familia/reportar-incidencia`, {
        method: 'POST',
        headers: { 'x-user-id': String(user?.id) },
        body: formData,
      });
      setIncidenciaModal({ open: false, ordenId: null });
      setIncidenciaForm({ categoria: '', descripcion: '', archivo: null });
      fetchAll();
    } catch {}
    setSubmittingIncidencia(false);
  };

  const iniciarServicio = async (id: number) => {
    await fetch(`/api/familia/orden/${id}/iniciar`, { method: 'POST', headers });
    fetchAll();
  };

  const finalizarServicio = async (id: number) => {
    await fetch(`/api/familia/orden/${id}/confirmar-finalizacion`, { method: 'POST', headers });
    fetchAll();
  };

  const pagarServicio = async (id: number) => {
    await fetch(`/api/familia/pagar/${id}`, { method: 'POST', headers, body: '{}' });
    fetchAll();
  };

  const contratarDeNuevo = async (s: Solicitud) => {
    localStorage.setItem('preselectCuidadoraId', String(s.CuidadoraId));
    setActiveTab('servicios');
    setShowCrearSolicitud(true);
  };

  const liberarPago = async (id: number) => {
    try {
      const r = await fetch(`/api/familia/orden/${id}/liberar-pago`, { method: 'POST', headers });
      if (r.ok) {
        alert('Pago liberado correctamente.');
        fetchAll();
      } else {
        const err = await r.json().catch(() => ({ error: 'Error al liberar pago' }));
        alert(err.error || 'Error al liberar pago');
      }
    } catch {
      alert('No se pudo conectar con el servidor');
    }
  };

  const finalizarConIncidencia = async (id: number) => {
    setIncidenciaModal({ open: true, ordenId: id });
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
              <UserMenu onNavigate={(v) => { if (v === 'perfil') setActiveTab('perfil'); }} />
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
            <ErrorBoundary>
              <SearchPage inline onNavigate={(v) => {
                if (v === 'familia') setActiveTab('servicios');
                else onNavigate?.(v);
              }} />
            </ErrorBoundary>
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
            {/* Welcome */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold text-white tracking-tight">Hola, {user?.nombres || 'Familia'}</h1>
              <p className="text-[#6667AB] mt-1">Este es el resumen de tu actividad en CERTINANAS.</p>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Entrevistas agendadas', value: stats.totalEntrevistas, icon: Calendar, color: 'text-[#F6A5C0]' },
                { label: 'Servicios contratados', value: stats.totalServicios, icon: Briefcase, color: 'text-[#CC8DB3]' },
                { label: 'Retenido en Escrow', value: `S/ ${stats.totalEscrow.toFixed(2)}`, icon: Shield, color: 'text-emerald-300' },
                { label: 'Total invertido', value: `S/ ${stats.totalInvertido.toFixed(2)}`, icon: DollarSign, color: 'text-amber-300' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <s.icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-[#6667AB] mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            {solicitudes.length > 0 && (() => {
              const estadoCount = solicitudes.reduce<Record<string, number>>((acc, s) => {
                acc[s.Estado] = (acc[s.Estado] || 0) + 1;
                return acc;
              }, {});
              const estadoData = Object.entries(estadoCount).map(([name, value]) => ({ name, value }));
              const estadoColors: Record<string, string> = {
                Pendiente: '#f59e0b', Confirmada: '#F6A5C0', Pagada: '#CC8DB3',
                'En curso': '#8b5cf6', Completada: '#10b981', Finalizada: '#059669',
                Cancelada: '#ef4444',
              };
              const completadas = (estadoCount['Completada'] || 0) + (estadoCount['Finalizada'] || 0);
              const totalServs = solicitudes.length;
              const pctCompletadas = totalServs > 0 ? Math.round((completadas / totalServs) * 100) : 0;
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-5 h-5 text-[#F6A5C0]" />
                      <h3 className="font-bold text-white text-sm">Distribución de Servicios</h3>
                    </div>
                    <p className="text-xs text-[#6667AB] mb-3">{totalServs} servicios · {pctCompletadas}% completados</p>
                    <div className="flex items-center gap-4">
                      <div className="w-36 h-36 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={estadoData} cx="50%" cy="50%" innerRadius={32} outerRadius={55} paddingAngle={3} dataKey="value">
                              {estadoData.map((e) => (
                                <Cell key={e.name} fill={estadoColors[e.name] || '#6667AB'} stroke="rgba(255,255,255,0.1)" />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: 'rgba(33,6,53,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, fontSize: 12 }}
                              formatter={(value: number, name: string) => [`${value} (${totalServs > 0 ? ((value / totalServs) * 100).toFixed(0) : 0}%)`, name]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {estadoData.map((e) => (
                          <div key={e.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: estadoColors[e.name] || '#6667AB' }} />
                              <span className="text-[#F5D5E0]">{e.name}</span>
                            </div>
                            <span className="text-white font-bold">{e.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-5 h-5 text-[#F6A5C0]" />
                      <h3 className="font-bold text-white text-sm">Resumen Financiero</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#6667AB]">Retenido en Escrow</span>
                          <span className="text-white font-bold">S/ {stats.totalEscrow.toFixed(2)}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((stats.totalEscrow / Math.max(stats.totalInvertido, 1)) * 100, 100)}%` }} transition={{ duration: 0.8 }}
                            className="h-full rounded-full bg-linear-to-r from-[#7B337E] to-[#CC8DB3]" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#6667AB]">Total invertido</span>
                          <span className="text-white font-bold">S/ {stats.totalInvertido.toFixed(2)}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.8 }}
                            className="h-full rounded-full bg-linear-to-r from-[#7B337E] to-[#F6A5C0]" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-2.5 text-center">
                          <p className="text-lg font-extrabold text-[#F6A5C0]">{stats.totalEntrevistas}</p>
                          <p className="text-[10px] text-[#6667AB]">Entrevistas</p>
                        </div>
                        <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-2.5 text-center">
                          <p className="text-lg font-extrabold text-[#CC8DB3]">{totalServs}</p>
                          <p className="text-[10px] text-[#6667AB]">Servicios</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })()}

            {/* Interviews Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6"
            >
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#F6A5C0]" /> Mis entrevistas agendadas (CUS-06)
              </h2>
              {citas.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-[#6667AB] mx-auto mb-2 opacity-50" />
                  <p className="text-white font-semibold">Aun no has agendado entrevistas</p>
                  <p className="text-[#F5D5E0]/60 text-sm mt-1">Explora nuestras cuidadoras y agenda tu primera consulta.</p>
                  <button onClick={() => setActiveTab('buscar')}
                    className="mt-4 px-6 py-2.5 rounded-full bg-linear-to-r from-[#7B337E] to-[#F6A5C0] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Buscar cuidadoras
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {citas.map(c => (
                    <div key={c.Id} className="flex items-center justify-between bg-[rgba(255,255,255,0.04)] rounded-xl p-4">
                      <div>
                        <p className="text-white font-semibold text-sm">{c.CuidadoraNombres} {c.CuidadoraApellidos}</p>
                        <p className="text-xs text-[#6667AB] mt-0.5">{formatFecha(c.FechaCita)} · {formatHora(c.HoraCita)} · {c.Modalidad}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${c.Estado === 'Completada' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                        {c.Estado || 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Services Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#CC8DB3]" /> Mis solicitudes de servicio (CUS-07)
                </h2>
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
                <div className="text-center py-12">
                  <Briefcase className="w-10 h-10 text-[#6667AB] mx-auto mb-2 opacity-50" />
                  <p className="text-white font-semibold">No hay solicitudes de servicio</p>
                  <p className="text-[#F5D5E0]/60 text-sm mt-1">Busca cuidadoras y crea tu primera solicitud</p>
                  <button onClick={() => setActiveTab('buscar')}
                    className="mt-4 px-6 py-2.5 rounded-full bg-linear-to-r from-[#7B337E] to-[#F6A5C0] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Buscar cuidadoras
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[#6667AB] mb-4">
                    {solicitudes.filter(s => !filtroEstado || s.Estado === filtroEstado).length} resultado(s)
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.1)] text-[#6667AB] text-xs uppercase tracking-wider">
                          <th className="text-left py-3 pr-4 font-semibold">Cuidadora</th>
                          <th className="text-left py-3 pr-4 font-semibold">Menor</th>
                          <th className="text-left py-3 pr-4 font-semibold">Fecha</th>
                          <th className="text-left py-3 pr-4 font-semibold">Horario</th>
                          <th className="text-right py-3 pr-4 font-semibold">Monto</th>
                          <th className="text-center py-3 pr-4 font-semibold">Estado</th>
                          <th className="text-right py-3 font-semibold">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {solicitudes.filter(s => !filtroEstado || s.Estado === filtroEstado).map(s => (
                          <tr key={s.Id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#CC8DB3]/20 flex items-center justify-center text-[10px] font-bold text-[#CC8DB3] flex-shrink-0">
                                  {s.CuidadoraNombres?.charAt(0)}{s.CuidadoraApellidos?.charAt(0)}
                                </div>
                                <span className="text-white font-medium text-xs whitespace-nowrap">{s.CuidadoraNombres} {s.CuidadoraApellidos}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-xs text-[#F5D5E0]/80">
                              {s.MenorNombre || '--'}
                              {s.MenorDiagnostico && <span className="text-[#CC8DB3] text-[10px] block">({s.MenorDiagnostico})</span>}
                            </td>
                            <td className="py-3 pr-4 text-xs text-white whitespace-nowrap">{formatFecha(s.FechaServicio)}</td>
                            <td className="py-3 pr-4 text-xs text-[#F5D5E0]/60 whitespace-nowrap">{formatHora(s.HoraInicio)} ({s.TotalHoras}h)</td>
                            <td className="py-3 pr-4 text-xs text-right text-white font-semibold whitespace-nowrap">S/ {(s.Total ?? 0).toFixed(2)}</td>
                            <td className="py-3 pr-4 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${statusPill[s.Estado] || 'bg-[rgba(33,6,53,0.5)] text-[#6667AB] border-transparent'}`}>
                                {statusText[s.Estado] || s.Estado}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {s.Estado === 'Pendiente' && (
                                  s.ConfirmadaFamilia ? (
                                    <button onClick={() => pagarServicio(s.Id)}
                                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                                    >Pagar</button>
                                  ) : (
                                    <button onClick={() => onViewContract?.(s.Id)}
                                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#F6A5C0] hover:bg-[#F6A5C0]/10 transition-colors"
                                    >Firmar Contrato</button>
                                  )
                                )}
                                {s.Estado === 'Confirmada' && (
                                  <button onClick={() => iniciarServicio(s.Id)}
                                    className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                                  >Iniciar</button>
                                )}
                                {s.Estado === 'Pagada' && (
                                  <>
                                    <button onClick={() => iniciarServicio(s.Id)}
                                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                                    >Iniciar</button>
                                    <button onClick={() => setIncidenciaModal({ open: true, ordenId: s.Id })}
                                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-red-300 hover:bg-red-500/10 transition-colors"
                                    >Reportar</button>
                                  </>
                                )}
                                {s.Estado === 'En curso' && (
                                  <>
                                    <button onClick={() => setDetalleModal({ open: true, item: s })}
                                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-purple-300 hover:bg-purple-500/10 transition-colors"
                                    >Monitorear</button>
                                    <button onClick={() => finalizarServicio(s.Id)}
                                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                                    >Finalizar</button>
                                    <button onClick={() => finalizarConIncidencia(s.Id)}
                                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-red-300 hover:bg-red-500/10 transition-colors"
                                    >Finalizar con incidencia</button>
                                  </>
                                )}
                                {(s.Estado === 'Completada' || s.Estado === 'Finalizada') && (
                                  <>
                                    <button onClick={() => liberarPago(s.Id)}
                                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                                    >Liberar Pago</button>
                                    <button onClick={() => onReview?.(s.Id)}
                                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#F6A5C0] hover:bg-[#F6A5C0]/10 transition-colors"
                                    >Ver reseña</button>
                                    <button onClick={() => contratarDeNuevo(s)}
                                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-purple-300 hover:bg-purple-500/10 transition-colors"
                                    >Contratar de nuevo</button>
                                  </>
                                )}
                                {s.Estado !== 'Completada' && s.Estado !== 'Finalizada' && s.Estado !== 'Cancelada' && (
                                  <button onClick={() => setIncidenciaModal({ open: true, ordenId: s.Id })}
                                    className="px-2 py-1 rounded-lg text-[10px] font-bold text-red-300 hover:bg-red-500/10 transition-colors"
                                  >Reportar incidencia</button>
                                )}
                                <button onClick={() => { setDetalleModal({ open: true, item: s }); fetchDetalleCompleto(s.Id); }}
                                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#F6A5C0] hover:bg-[#F6A5C0]/10 transition-colors"
                                >Detalle</button>
                                <button onClick={() => handleViewContract(s)}
                                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#6667AB] hover:text-white transition-colors"
                                >Contrato</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </motion.div>
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
                <ProfileAvatar size={80} />
                <div>
                  <p className="text-white font-semibold text-sm">Foto de perfil</p>
                  <p className="text-[#6667AB] text-xs">Haz clic en la foto para cambiarla</p>
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
            onClick={() => { setDetalleModal({ open: false, item: null }); setDetalleData(null); }}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[rgba(33,6,53,0.95)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.12)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <button onClick={() => { setDetalleModal({ open: false, item: null }); setDetalleData(null); }}
                  className="float-right p-1.5 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
                ><X className="w-4 h-4 text-[#6667AB]" /></button>
                <h3 className="text-lg font-bold text-white mb-2">Detalle del Servicio</h3>
                <p className="text-sm text-[#6667AB] mb-6">
                  {detalleModal.item.CuidadoraNombres} {detalleModal.item.CuidadoraApellidos} · {formatFecha(detalleModal.item.FechaServicio)}
                </p>

                {/* Info básica siempre visible */}
                <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-[#6667AB]">Estado:</span> <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold text-white">{detalleModal.item.Estado}</span></div>
                    <div><span className="text-[#6667AB]">Fecha:</span> <span className="text-white ml-1">{formatFecha(detalleModal.item.FechaServicio)}</span></div>
                    <div><span className="text-[#6667AB]">Horario:</span> <span className="text-white ml-1">{formatHora(detalleModal.item.HoraInicio)} - {formatHora(detalleModal.item.HoraFin)}</span></div>
                    <div><span className="text-[#6667AB]">Horas:</span> <span className="text-white ml-1">{detalleModal.item.TotalHoras}h</span></div>
                    <div><span className="text-[#6667AB]">Tarifa:</span> <span className="text-white ml-1">S/ {detalleModal.item.TarifaHora}/h</span></div>
                    <div><span className="text-[#6667AB]">Subtotal:</span> <span className="text-white ml-1">S/ {(detalleModal.item.Subtotal ?? 0).toFixed(2)}</span></div>
                    <div><span className="text-[#6667AB]">Comisión:</span> <span className="text-white ml-1">S/ {(detalleModal.item.TarifaPlataforma ?? 0).toFixed(2)}</span></div>
                    <div className="col-span-2"><span className="text-[#6667AB]">Total:</span> <span className="text-white ml-1 font-bold">S/ {(detalleModal.item.Total ?? 0).toFixed(2)}</span></div>
                    {detalleModal.item.MenorNombre && (
                      <div className="col-span-2"><span className="text-[#6667AB]">Menor:</span> <span className="text-white ml-1">{detalleModal.item.MenorNombre}{detalleModal.item.MenorDiagnostico ? ` (${detalleModal.item.MenorDiagnostico})` : ''}</span></div>
                    )}
                  </div>
                </div>

                {/* Detalle cargado */}
                {cargandoDetalle ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 text-[#6667AB] mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-[#6667AB]">Cargando detalle...</p>
                  </div>
                ) : detalleData ? (
                  <div className="space-y-4">

                    {/* Motivo cancelación */}
                    {(detalleData.Estado === 'Cancelado' || detalleData.Estado === 'Cancelada') && detalleData.motivoCancelacion && (
                      <div className="bg-[rgba(239,68,68,0.1)] border border-red-500/30 rounded-xl p-4">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-red-300 mb-1">Motivo de Cancelación</h4>
                            <p className="text-xs text-red-200/80">{detalleData.motivoCancelacion}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tareas con decisiones */}
                    {detalleData.tareas?.length > 0 && (
                      <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                        <h4 className="text-xs font-bold text-[#F6A5C0] uppercase mb-3 flex items-center gap-2">
                          <ListTodo className="w-4 h-4" /> Tareas del Contrato
                        </h4>
                        <div className="space-y-2">
                          {detalleData.tareas.map((t: any) => (
                            <div key={t.Id} className="flex items-center justify-between bg-[rgba(33,6,53,0.3)] rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                {t.Decision === 'Aceptar' && <CheckCircle className="w-3.5 h-3.5 text-[#6EE7B7]" />}
                                {t.Decision === 'Rechazar' && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                                {(t.Decision === 'Negociar' || t.Decision === 'Pendiente' || !t.Decision) && <Clock className="w-3.5 h-3.5 text-[#F6A5C0]" />}
                                <span className="text-xs text-[#F5D5E0]">{t.Descripcion}</span>
                                {t.EsPersonalizada && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#7B337E]/30 text-[#CC8DB3]">Personalizada</span>
                                )}
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                t.Decision === 'Aceptar' ? 'bg-emerald-500/20 text-emerald-200' :
                                t.Decision === 'Rechazar' ? 'bg-red-500/20 text-red-200' :
                                'bg-amber-500/20 text-amber-200'
                              }`}>{t.Decision || 'Pendiente'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contrato */}
                    {detalleData.contrato && (
                      <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                        <h4 className="text-xs font-bold text-[#F6A5C0] uppercase mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Contrato #{detalleData.contrato.Id}
                        </h4>
                        <div className="flex items-center gap-3 text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${detalleData.contrato.AceptadoFamilia ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'}`}>
                            {detalleData.contrato.AceptadoFamilia ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            Tú: {detalleData.contrato.AceptadoFamilia ? 'Aceptaste' : 'Pendiente'}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${detalleData.contrato.AceptadoCuidadora ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'}`}>
                            {detalleData.contrato.AceptadoCuidadora ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            Cuidadora: {detalleData.contrato.AceptadoCuidadora ? 'Aceptó' : 'Pendiente'}
                          </span>
                        </div>
                        {detalleData.contrato.Terminos && (
                          <pre className="mt-3 text-[10px] text-[#6667AB] whitespace-pre-wrap max-h-32 overflow-y-auto bg-[rgba(33,6,53,0.3)] rounded-lg p-3">{detalleData.contrato.Terminos}</pre>
                        )}
                        <button onClick={() => setShowContractPreview(true)}
                          className="mt-3 w-full py-2 rounded-lg bg-[#F6A5C0]/10 text-[#F6A5C0] text-xs font-bold hover:bg-[#F6A5C0]/20 transition-colors border border-[#F6A5C0]/30"
                        >Ver Contrato Completo</button>
                      </div>
                    )}

                    {/* Reseñas */}
                    {detalleData.resenas?.length > 0 && (
                      <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                        <h4 className="text-xs font-bold text-[#F6A5C0] uppercase mb-3">Reseñas</h4>
                        <div className="space-y-3">
                          {detalleData.resenas.map((r: any, i: number) => (
                            <div key={i} className="bg-[rgba(33,6,53,0.3)] rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map(j => (
                                    <Star key={j} className={`w-3 h-3 ${j <= r.Calificacion ? 'text-[#CC8DB3] fill-[#CC8DB3]' : 'text-[#6667AB]'}`} />
                                  ))}
                                </div>
                                <span className="text-xs text-[#6667AB]">({r.Calificacion}/5)</span>
                              </div>
                              {r.Comentario && <p className="text-xs text-[#6667AB] leading-relaxed">"{r.Comentario}"</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Negociaciones */}
                    {detalleData.negociaciones?.length > 0 && (
                      <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                        <h4 className="text-xs font-bold text-[#F6A5C0] uppercase mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" /> Historial de Negociación
                        </h4>
                        <div className="space-y-2">
                          {detalleData.negociaciones.map((n: any, i: number) => (
                            <div key={i} className="bg-[rgba(33,6,53,0.3)] rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-white">{n.PropuestoPorNombres} {n.PropuestoPorApellidos}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  n.Estado === 'activa' ? 'bg-amber-500/20 text-amber-200' :
                                  n.Estado === 'aceptada' ? 'bg-emerald-500/20 text-emerald-200' :
                                  n.Estado === 'rechazada' ? 'bg-red-500/20 text-red-200' :
                                  'bg-[rgba(33,6,53,0.5)] text-[#6667AB]'
                                }`}>{n.Estado}</span>
                              </div>
                              {n.Mensaje && <p className="text-xs text-[#6667AB] mt-1">{n.Mensaje}</p>}
                              {n.TarifaHora && <p className="text-xs text-[#F5D5E0] mt-1">S/ {n.TarifaHora}/h · {n.TotalHoras}h</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : detalleModal.item && (
                  <p className="text-center text-[#6667AB] text-sm">Cargando información adicional...</p>
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

      {/* ── CONTRACT FORMAT MODAL ── */}
      <AnimatePresence>
        {showContractFormat && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => { setShowContractFormat(false); setContractViewData(null); }}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {loadingContract && !contractViewData ? (
                <div className="bg-[rgba(33,6,53,0.95)] backdrop-blur-[25px] rounded-2xl p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-[#F6A5C0] border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-sm text-[#6667AB]">Cargando contrato...</p>
                </div>
              ) : contractViewData?.error ? (
                <div className="bg-[rgba(33,6,53,0.95)] backdrop-blur-[25px] rounded-2xl p-12 text-center">
                  <p className="text-sm text-red-300 mb-4">{contractViewData.error}</p>
                  <button onClick={() => { setShowContractFormat(false); setContractViewData(null); }}
                    className="mt-2 px-6 py-2 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:opacity-90 transition-opacity"
                  >Cerrar</button>
                </div>
              ) : (
                <>
                  <ContractFormat
                    codigo={`CTN-2026-${String(contractViewData.orden?.Id || contractViewData.Id || 0).padStart(4, '0')}`}
                    fechaEmision={new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                    familiaNombre={`${user?.nombres || ''} ${user?.apellidos || ''}`}
                    cuidadoraNombre={`${contractViewData.orden?.CuidadoraNombres || contractViewData.CuidadoraNombres || ''} ${contractViewData.orden?.CuidadoraApellidos || contractViewData.CuidadoraApellidos || ''}`}
                    menorNombre={contractViewData.orden?.MenorNombre || contractViewData.MenorNombre || 'No especificado'}
                    menorDiagnostico={contractViewData.orden?.MenorDiagnostico || contractViewData.MenorDiagnostico || 'No especificado'}
                    fechaServicio={contractViewData.orden?.FechaServicio || contractViewData.FechaServicio || ''}
                    horaInicio={contractViewData.orden?.HoraInicio || contractViewData.HoraInicio || '--'}
                    horaFin={contractViewData.orden?.HoraFin || contractViewData.HoraFin || '--'}
                    duracionHoras={contractViewData.orden?.TotalHoras || contractViewData.TotalHoras || 0}
                    tarifaHora={contractViewData.orden?.TarifaHora || contractViewData.TarifaHora || 0}
                    montoTotal={contractViewData.orden?.Total || contractViewData.Total || 0}
                    subtotal={contractViewData.orden?.Subtotal || contractViewData.Subtotal || 0}
                    comision={contractViewData.orden?.TarifaPlataforma || contractViewData.TarifaPlataforma || 0}
                    tareas={contractViewData.tareas || []}
                    estado={contractViewData.orden?.Estado || contractViewData.Estado || ''}
                    firmadoFamilia={contractViewData.contrato?.AceptadoFamilia || false}
                    firmadoCuidadora={contractViewData.contrato?.AceptadoCuidadora || false}
                    negociaciones={contractViewData.negociaciones || []}
                  />
                  <button onClick={() => { setShowContractFormat(false); setContractViewData(null); }}
                    className="mt-4 w-full py-3 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:opacity-90 transition-opacity"
                  >Cerrar</button>
                </>
              )}
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

      {/* ── CONTRACT PREVIEW MODAL (independiente, usa detalleData directo) ── */}
      <AnimatePresence>
        {showContractPreview && detalleData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowContractPreview(false)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <ContractFormat
                codigo={`CTN-2026-${String(detalleData.Id || 0).padStart(4, '0')}`}
                fechaEmision={new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                familiaNombre={`${user?.nombres || ''} ${user?.apellidos || ''}`}
                cuidadoraNombre={`${detalleData.CuidadoraNombres || ''} ${detalleData.CuidadoraApellidos || ''}`}
                menorNombre={detalleData.MenorNombre || 'No especificado'}
                menorDiagnostico={detalleData.MenorDiagnostico || 'No especificado'}
                fechaServicio={detalleData.FechaServicio || ''}
                horaInicio={detalleData.HoraInicio || '--'}
                horaFin={detalleData.HoraFin || '--'}
                duracionHoras={detalleData.TotalHoras || 0}
                tarifaHora={detalleData.TarifaHora || 0}
                montoTotal={detalleData.Total || 0}
                subtotal={detalleData.Subtotal || 0}
                comision={detalleData.TarifaPlataforma || 0}
                tareas={detalleData.tareas || []}
                estado={detalleData.Estado || ''}
                firmadoFamilia={detalleData.contrato?.AceptadoFamilia || false}
                firmadoCuidadora={detalleData.contrato?.AceptadoCuidadora || false}
                negociaciones={detalleData.negociaciones || []}
              />
              <button onClick={() => setShowContractPreview(false)}
                className="mt-4 w-full py-3 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:opacity-90 transition-opacity"
              >Cerrar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
