import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Star, MessageSquare, Briefcase, LogOut, CheckCircle, ChevronDown, ChevronRight, Clock, User, DollarSign,
  Calendar, Upload, File, RefreshCw, Award, BookOpen, MapPin, Shield, AlertTriangle, Send,
  TrendingUp, Users, Search, X, Play, Square, Activity, HelpCircle, Eye, FileText, ThumbsUp, ThumbsDown, AlertCircle, ListTodo, Ban, MessageCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';
import { UserMenu } from './UserMenu';
import { CuidadoraSolicitudes } from './CuidadoraSolicitudes';
import { PanicButton } from './PanicButton';
import { CentroCapacitacion } from './CentroCapacitacion';
import { HistorialSalud } from './HistorialSalud';
import { ReporteDiarioForm } from './ReporteDiarioForm';
import { ReemplazoTracker } from './ReemplazoTracker';
import { ContractFormat } from './ContractFormat';

type Servicio = {
  Id: number;
  FechaServicio: string;
  TotalHoras: number;
  TarifaHora: number;
  Total: number;
  Subtotal: number;
  TarifaPlataforma: number;
  Estado: string;
  HoraInicio: string;
  HoraFin: string;
  TipoServicio: string;
  FamiliaNombres: string;
  FamiliaApellidos: string;
  MenorNombre: string;
  MenorDiagnostico: string;
};

type PerfilCuidadora = {
  user: { Id: number; Nombres: string; Apellidos: string; Email: string; Telefono: string };
  cuidadora: { Id: number; AniosExperiencia: number; TarifaHora: number; DescripcionCorta: string; CalificacionPromedio: number; TotalResenas: number };
  especialidades: string[];
  areas: string[];
  documentos: { TipoRequisito: string; NombreArchivo: string; Peso: string; Estado: string }[];
  stats: { CalificacionPromedio: number; TotalResenas: number };
  postulacion: { Id: number; Estado: string } | null;
  tiposRequeridos: string[];
};

type ReputacionData = {
  nivel: string;
  puntaje: number;
  siguienteNivel: string;
  progreso: number;
};

type CapacitacionData = {
  totalModulos: number;
  completados: number;
  progreso: number;
};

type StatsData = {
  serviciosCompletados: number;
  calificacionPromedio: number;
  recontrataciones: number;
  nivelReputacion: string;
  ingresosTotales: number;
};

type CaregiverPanelProps = {
  onNavigate?: (view: string) => void;
};

type Tab = 'perfil' | 'servicios' | 'solicitudes' | 'panel' | 'mensajes' | 'pagos' | 'capacitacion' | 'reportes' | 'reemplazo';

export function CaregiverPanel({ onNavigate }: CaregiverPanelProps) {
  const { user, logout } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };

  const [tab, setTab] = useState<Tab>('perfil');

  // -- Perfil state --
  const [perfil, setPerfil] = useState<PerfilCuidadora | null>(null);
  const [bio, setBio] = useState('');
  const [tarifa, setTarifa] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // -- Servicios state --
  const [servicios, setServicios] = useState<Servicio[]>([]);

  // -- Check-in/Check-out state --
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState('00:00:00');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  // -- Reputacion / Capacitacion state --
  const [reputacion, setReputacion] = useState<ReputacionData | null>(null);
  const [capacitacion, setCapacitacion] = useState<CapacitacionData | null>(null);

  // -- Stats for Dashboard tab --
  const [stats, setStats] = useState<StatsData | null>(null);

  // -- Emergency replacement --
  const [reemplazos, setReemplazos] = useState<any[]>([]);

  // -- Pagos --
  const [pagos, setPagos] = useState<any[]>([]);
  const [totalesPagos, setTotalesPagos] = useState({ ganado: 0, pendiente: 0, liberado: 0 });

  // -- Detalle modal --
  const [detalleServicio, setDetalleServicio] = useState<any>(null);
  const [detalleData, setDetalleData] = useState<any>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // -- Contrato format modal --
  const [showContractFormat, setShowContractFormat] = useState(false);
  const [contractViewData, setContractViewData] = useState<any>(null);
  const [showContractPreview, setShowContractPreview] = useState(false);

  const abrirDetalle = async (servicioId: number) => {
    setCargandoDetalle(true);
    setDetalleServicio(servicios.find(s => s.Id === servicioId));
    setDetalleData(null);
    try {
      const r = await fetch(`/api/cuidadora/servicios/${servicioId}/detalle`, { headers });
      if (r.ok) setDetalleData(await r.json());
    } catch {}
    setCargandoDetalle(false);
  };

  const activeService = servicios.find(s => s.Estado === 'En Curso');

  // -- Fetch perfil --
  useEffect(() => {
    fetch('/api/cuidadora/perfil', { headers })
      .then(r => r.json())
      .then(data => {
        setPerfil(data);
        setBio(data.cuidadora.DescripcionCorta || '');
        setTarifa(String(data.cuidadora.TarifaHora || ''));
        setExperiencia(String(data.cuidadora.AniosExperiencia || ''));
      })
      .catch(() => {});
  }, []);

  // -- Fetch servicios --
  const fetchServicios = useCallback(() => {
    fetch('/api/cuidadora/servicios', { headers })
      .then(r => r.json())
      .then(setServicios)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === 'servicios' || tab === 'panel') fetchServicios();
  }, [tab, fetchServicios]);

  // -- Fetch reputacion --
  useEffect(() => {
    if (tab !== 'perfil') return;
    fetch(`/api/reputacion/cuidadora/${user?.id}`, { headers })
      .then(r => r.json())
      .then(setReputacion)
      .catch(() => {});
    fetch(`/api/capacitacion/progreso/${user?.id}`, { headers })
      .then(r => r.json())
      .then(setCapacitacion)
      .catch(() => {});
  }, [tab]);

  // -- Fetch reemplazos --
  useEffect(() => {
    if (tab !== 'panel') return;
    fetch('/api/cuidadora/reemplazos', { headers })
      .then(r => r.json())
      .then(setReemplazos)
      .catch(() => {});
  }, [tab]);

  // -- Fetch stats for dashboard --
  useEffect(() => {
    if (tab !== 'panel') return;
    fetch('/api/cuidadora/stats', { headers })
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, [tab]);

  // -- Fetch pagos --
  useEffect(() => {
    if (tab !== 'pagos') return;
    fetch('/api/cuidadora/pagos', { headers })
      .then(r => r.json())
      .then(d => { setPagos(d.pagos ?? []); setTotalesPagos(d.totales ?? { ganado: 0, pendiente: 0, liberado: 0 }); })
      .catch(() => {});
  }, [tab]);

  // -- Elapsed timer --
  useEffect(() => {
    if (!checkedIn || !checkInTime) return;
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - checkInTime.getTime()) / 1000);
      const h = Math.floor(diff / 3600).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [checkedIn, checkInTime]);

  // -- Servicios polling for En Curso --
  useEffect(() => {
    if (tab !== 'panel') return;
    const interval = setInterval(fetchServicios, 10000);
    return () => clearInterval(interval);
  }, [tab, fetchServicios]);

  // -- Guardar perfil --
  const guardar = async () => {
    setSaving(true);
    try {
      await fetch('/api/cuidadora/perfil', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ bio, tarifaHora: parseFloat(tarifa) || 0, aniosExperiencia: parseInt(experiencia) || 0 }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  // -- Check-in --
  const handleCheckIn = async () => {
    if (!activeService) return;
    setGeoLoading(true);
    setGeoError('');
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const r = await fetch('/api/geolocalizacion/checkin', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderId: activeService.Id,
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude,
        }),
      });
      if (r.ok) {
        setCheckedIn(true);
        setCheckInTime(new Date());
        setElapsed('00:00:00');
      } else {
        const data = await r.json();
        setGeoError(data.error || 'Error al registrar check-in');
      }
    } catch {
      setGeoError('No se pudo obtener la ubicación');
    }
    setGeoLoading(false);
  };

  // -- Check-out --
  const handleCheckOut = async () => {
    if (!activeService) return;
    setGeoLoading(true);
    setGeoError('');
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const r = await fetch('/api/geolocalizacion/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderId: activeService.Id,
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude,
        }),
      });
      if (r.ok) {
        setCheckedIn(false);
        setCheckInTime(null);
        fetchServicios();
      } else {
        const data = await r.json();
        setGeoError(data.error || 'Error al registrar check-out');
      }
    } catch {
      setGeoError('No se pudo obtener la ubicación');
    }
    setGeoLoading(false);
  };

  const getColorForEspecialidad = (e: string) => {
    if (['TEA', 'TDAH'].includes(e)) return 'bg-[#F6A5C0] text-[#210635] border-0';
    if (e === 'Primeros Auxilios') return 'bg-[#CC8DB3] text-[#210635] border-0';
    return 'bg-[#CC8DB3] text-[#210635] border-0';
  };

  const badgeStyle = (estado: string) => {
    const map: Record<string, string> = {
      Pendiente: 'bg-[#F6A5C0] text-[#210635]',
      Confirmada: 'bg-[#CC8DB3] text-[#210635]',
      'En Curso': 'bg-[rgba(16,185,129,0.2)] text-[#10B981] border border-[rgba(16,185,129,0.3)]',
      Completado: 'bg-[rgba(110,231,183,0.2)] text-[#6EE7B7] border border-[rgba(110,231,183,0.3)]',
      Cancelado: 'bg-red-500/80 text-white',
    };
    return map[estado] || 'bg-[rgba(33,6,53,0.5)] text-[#F5D5E0]';
  };

  const glassCard = 'bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl';

  return (
    <div className="min-h-screen bg-linear-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
      <header className="bg-[#210635]/80 backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.1)] text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 overflow-hidden rounded">
                  <img src="/logo.png" alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-lg font-extrabold text-[#F6A5C0] tracking-tight">CERTINANAS</span>
              </div>
              <span className="text-[#6667AB] text-xl font-light hidden sm:inline">|</span>
              <span className="text-[#6667AB] text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
            </div>
            <nav className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-1 scrollbar-none">
              {(['perfil', 'servicios', 'solicitudes', 'panel', 'mensajes', 'pagos', 'capacitacion', 'reportes', 'reemplazo'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => t === 'mensajes' ? onNavigate?.('messages') : setTab(t)}
                  className={`text-sm pb-0.5 whitespace-nowrap ${
                    tab === t
                      ? 'font-bold text-[#F6A5C0] border-b-2 border-[#F6A5C0]'
                      : 'text-[#F5D5E0]/70 hover:text-white transition-colors'
                  }`}
                >
                  {t === 'perfil' && 'Mi Perfil'}
                  {t === 'servicios' && 'Servicios'}
                  {t === 'solicitudes' && 'Solicitudes'}
                  {t === 'panel' && 'Mi Panel'}
                  {t === 'mensajes' && 'Mensajes'}
                  {t === 'pagos' && 'Mis Pagos'}
                  {t === 'capacitacion' && 'Capacitación'}
                  {t === 'reportes' && 'Reportes'}
                  {t === 'reemplazo' && 'Reemplazo'}
                </button>
              ))}
              <UserMenu onNavigate={(v) => { if (v === 'perfil') setTab('perfil'); }} />
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* ── Profile Header ── */}
        {perfil && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={glassCard + ' p-8'}>
            <div className="flex items-start gap-6">
              <ProfileAvatar size={80} />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{perfil.user.Nombres} {perfil.user.Apellidos}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[#6667AB]">Cuidadora Especializada</span>
                  {perfil.postulacion?.Estado === 'Aprobada' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[rgba(16,185,129,0.2)] text-[#6EE7B7] text-xs font-bold">
                      <CheckCircle className="w-3 h-3" /> Perfil Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[rgba(234,179,8,0.2)] text-[#FACC15] text-xs font-bold">
                      Pendiente de verificación
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(perfil.stats.CalificacionPromedio) ? 'text-[#CC8DB3] fill-[#CC8DB3]' : 'text-[#6667AB]'}`} />
                  ))}
                  <span className="text-sm text-[#6667AB] ml-2">
                    ({perfil.stats.CalificacionPromedio} · {perfil.stats.TotalResenas} reseñas)
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════════════ TAB: MI PERFIL ════════════════════ */}
        {tab === 'perfil' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Editar Perfil */}
            <div className={glassCard + ' p-8'}>
              <h2 className="text-xl font-bold text-white mb-6">Editar Perfil Profesional</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-[#F5D5E0] mb-2">Biografía</label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] px-4 py-3 text-sm text-white placeholder:text-[#6667AB] focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] resize-none"
                    placeholder="Especialista en TEA y TDAH con 5 años de experiencia..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#F5D5E0] mb-2">Tarifa por hora (S/)</label>
                  <input
                    type="number" step="0.01" value={tarifa}
                    onChange={e => setTarifa(e.target.value)}
                    className="w-full rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] px-4 py-3 text-sm text-white placeholder:text-[#6667AB] focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]"
                    placeholder="35.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#F5D5E0] mb-2">Años de experiencia</label>
                  <input
                    type="number" value={experiencia}
                    onChange={e => setExperiencia(e.target.value)}
                    className="w-full rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] px-4 py-3 text-sm text-white placeholder:text-[#6667AB] focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]"
                    placeholder="5"
                  />
                </div>
              </div>

              {perfil && perfil.especialidades.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-[#F5D5E0] mb-3">Especialidades</label>
                  <div className="flex flex-wrap gap-2">
                    {perfil.especialidades.map(e => (
                      <span key={e} className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${getColorForEspecialidad(e)}`}>{e}</span>
                    ))}
                    {perfil.areas.map(a => (
                      <span key={a} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-[#CC8DB3] text-[#210635]">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {perfil && (
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-[#F5D5E0] mb-3">
                    {perfil.postulacion?.Estado === 'Aprobada' ? 'Documentos aprobados' : 'Documentos de postulación'}
                  </label>
                  {perfil.documentos.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {perfil.documentos.map((d, i) => (
                        <div key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.2)] bg-[rgba(33,6,53,0.5)] backdrop-blur-sm text-sm">
                          <File className="w-4 h-4 text-[#6667AB]" />
                          <span className="text-[#F5D5E0] font-medium">{d.TipoRequisito}</span>
                          <span className="text-[#6667AB] text-xs">({d.Peso})</span>
                          {d.Estado === 'Aprobado' ? <CheckCircle className="w-4 h-4 text-[#6EE7B7]" />
                            : d.Estado === 'Rechazado' ? <span className="text-xs text-red-600 font-medium">Rechazado</span>
                            : <span className="text-xs text-amber-600 font-medium">Pendiente</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {perfil.postulacion?.Estado !== 'Aprobada' && (
                    <UploadDocs postulacionId={perfil.postulacion?.Id} tiposRequeridos={perfil.tiposRequeridos} headers={headers} />
                  )}
                </div>
              )}

              <div className="flex justify-end mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={guardar} disabled={saving}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#F6A5C0] text-[#210635] rounded-xl text-sm font-bold transition-colors shadow-lg disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : saved ? <><CheckCircle className="w-4 h-4" /> Guardado</>
                    : <>Guardar cambios <ChevronRight className="w-4 h-4" /></>}
                </motion.button>
              </div>
            </div>

            {/* Reputacion Gamification */}
            <div className={glassCard + ' p-8'}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#F6A5C0]" /> Reputación
              </h2>
              {reputacion ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#F5D5E0]">Nivel actual</p>
                      <p className="text-2xl font-bold text-white">{reputacion.nivel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#F5D5E0]">Puntaje</p>
                      <p className="text-2xl font-bold text-[#F6A5C0]">{reputacion.puntaje}</p>
                    </div>
                  </div>
                  <div className="relative h-3 rounded-full bg-[rgba(33,6,53,0.5)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${reputacion.progreso}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-linear-to-r from-[#7B337E] to-[#F6A5C0]"
                    />
                  </div>
                  <p className="text-xs text-[#6667AB]">Próximo nivel: {reputacion.siguienteNivel} ({Math.round(reputacion.progreso)}%)</p>
                </div>
              ) : (
                <p className="text-sm text-[#6667AB]">Cargando...</p>
              )}
            </div>

            {/* Capacitaciones Progress */}
            <div className={glassCard + ' p-8'}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#F6A5C0]" /> Capacitaciones
              </h2>
              {capacitacion ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#F5D5E0]">Módulos completados</p>
                    <p className="text-lg font-bold text-white">{capacitacion.completados} / {capacitacion.totalModulos}</p>
                  </div>
                  <div className="relative h-3 rounded-full bg-[rgba(33,6,53,0.5)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${capacitacion.progreso}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-linear-to-r from-[#7B337E] to-[#F6A5C0]"
                    />
                  </div>
                  <p className="text-xs text-[#6667AB]">{Math.round(capacitacion.progreso)}% completado</p>
                </div>
              ) : (
                <p className="text-sm text-[#6667AB]">Cargando...</p>
              )}
            </div>
          </motion.div>
        )}

        {/* ════════════════════ TAB: SERVICIOS ════════════════════ */}
        {tab === 'servicios' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h2 className="text-xl font-bold text-white">Mis Servicios</h2>
            {servicios.length === 0 ? (
              <div className={glassCard + ' p-12 text-center'}>
                <Briefcase className="w-12 h-12 text-[#6667AB] mx-auto mb-4" />
                <p className="text-[#F5D5E0] font-medium">No tienes servicios asignados aún</p>
                <p className="text-[#6667AB] text-sm mt-1">Los servicios aparecerán aquí cuando una familia te contrate</p>
              </div>
            ) : (
              <div className="space-y-3">
                {servicios.map(s => (
                  <div key={s.Id} className={glassCard + ' p-6'}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-white">{s.FamiliaNombres} {s.FamiliaApellidos}</span>
                          <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${badgeStyle(s.Estado)}`}>{s.Estado}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-[#6667AB]">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {s.FechaServicio}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.HoraInicio} - {s.HoraFin}</span>
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {s.MenorNombre}</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> S/ {s.Total.toFixed(2)}</span>
                        </div>
                        {s.MenorDiagnostico && (
                          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-[#CC8DB3] text-[#210635]">{s.MenorDiagnostico}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <button onClick={() => abrirDetalle(s.Id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.2)] text-[#F5D5E0] text-xs font-bold hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detalle
                        </button>
                        {s.Estado === 'En Curso' && (
                          <>
                            <button
                              disabled={checkedIn}
                              onClick={handleCheckIn}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10B981] text-white text-xs font-bold hover:bg-[#059669] transition-colors disabled:opacity-40"
                            >
                              <Play className="w-3.5 h-3.5" /> CHECK-IN
                            </button>
                            <button
                              disabled={!checkedIn}
                              onClick={handleCheckOut}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D14242] text-white text-xs font-bold hover:bg-[#b03838] transition-colors disabled:opacity-40"
                            >
                              <Square className="w-3.5 h-3.5" /> CHECK-OUT
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {checkedIn && s.Id === activeService?.Id && (
                      <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-[#10B981]" />
                          <span className="text-[#F5D5E0]">Tiempo transcurrido:</span>
                          <span className="text-lg font-bold text-[#10B981] font-mono">{elapsed}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ════════════════════ TAB: SOLICITUDES ════════════════════ */}
        {tab === 'solicitudes' && (
          <CuidadoraSolicitudes />
        )}

        {/* ════════════════════ TAB: MI PANEL ════════════════════ */}
        {tab === 'panel' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-xl font-bold text-white">Mi Panel de Operaciones</h2>

            {/* a) Check-In/Check-Out Widget */}
            {activeService ? (
              <div className={glassCard + ' p-8'}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(246,165,192,0.15)] flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#F6A5C0]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Control de Turno</h3>
                    <p className="text-xs text-[#6667AB]">Servicio activo con {activeService.FamiliaNombres} {activeService.FamiliaApellidos}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    disabled={checkedIn || geoLoading}
                    onClick={handleCheckIn}
                    className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 transition-all ${
                      checkedIn
                        ? 'border-[#10B981] bg-[rgba(16,185,129,0.1)] cursor-default'
                        : 'border-[rgba(255,255,255,0.2)] bg-[rgba(33,6,53,0.4)] hover:border-[#10B981] hover:bg-[rgba(16,185,129,0.05)] disabled:opacity-40'
                    }`}
                  >
                    <Play className={`w-10 h-10 ${checkedIn ? 'text-[#6EE7B7]' : 'text-white'}`} />
                    <span className={`text-sm font-bold ${checkedIn ? 'text-[#6EE7B7]' : 'text-white'}`}>
                      {geoLoading ? 'Obteniendo ubicación...' : checkedIn ? 'Turno Iniciado' : 'Iniciar Turno (Check-In)'}
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    disabled={!checkedIn || geoLoading}
                    onClick={handleCheckOut}
                    className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 transition-all ${
                      !checkedIn
                        ? 'border-[rgba(255,255,255,0.1)] bg-[rgba(33,6,53,0.3)] opacity-40 cursor-not-allowed'
                        : 'border-[rgba(255,255,255,0.2)] bg-[rgba(33,6,53,0.4)] hover:border-[#D14242] hover:bg-[rgba(209,66,66,0.05)]'
                    }`}
                  >
                    <Square className={`w-10 h-10 ${checkedIn ? 'text-[#D14242]' : 'text-[#6667AB]'}`} />
                    <span className="text-sm font-bold text-white">Finalizar Turno (Check-Out)</span>
                  </motion.button>
                </div>

                {geoError && (
                  <p className="text-xs text-red-400 mt-3">{geoError}</p>
                )}

                {checkedIn && (
                  <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[#10B981]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6667AB]">Hora de inicio</p>
                        <p className="text-sm font-bold text-white">{checkInTime?.toLocaleTimeString('es-PE')}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-xs text-[#6667AB]">Tiempo transcurrido</p>
                        <p className="text-2xl font-bold text-[#10B981] font-mono">{elapsed}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={glassCard + ' p-8 text-center'}>
                <MapPin className="w-10 h-10 text-[#6667AB] mx-auto mb-3" />
                <p className="text-[#F5D5E0] font-medium">No hay servicio activo</p>
                <p className="text-xs text-[#6667AB] mt-1">El control de turno estará disponible cuando inicies un servicio</p>
              </div>
            )}

            {/* b) Emergency Replacement Tracker */}
            {reemplazos.length > 0 && (
              <div className={glassCard + ' p-6'}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(246,165,192,0.15)] flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-[#F6A5C0]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Reemplazo de Emergencia</h3>
                    <p className="text-xs text-[#6667AB]">Se está gestionando un reemplazo</p>
                  </div>
                </div>
                {reemplazos.map((r, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl bg-[rgba(33,6,53,0.4)] border border-[rgba(255,255,255,0.06)] p-4 text-center">
                      <p className="text-xs text-[#6667AB]">Tiempo estimado</p>
                      <p className="text-lg font-bold text-white">{r.tiempoEstimado || '30 min'}</p>
                    </div>
                    <div className="rounded-xl bg-[rgba(33,6,53,0.4)] border border-[rgba(255,255,255,0.06)] p-4 text-center">
                      <p className="text-xs text-[#6667AB]">Candidatas contactadas</p>
                      <p className="text-lg font-bold text-[#F6A5C0]">{r.candidatasContactadas || 3}</p>
                    </div>
                    <div className="rounded-xl bg-[rgba(33,6,53,0.4)] border border-[rgba(255,255,255,0.06)] p-4 text-center">
                      <p className="text-xs text-[#6667AB]">Compatibilidad</p>
                      <p className="text-lg font-bold text-[#10B981]">{r.nivelCompatibilidad || '85%'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* c) Stats Dashboard Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Servicios Completados', value: stats.serviciosCompletados.toString(), icon: Briefcase },
                  { label: 'Calificación Promedio', value: stats.calificacionPromedio.toFixed(1), icon: Star },
                  { label: 'Recontrataciones', value: stats.recontrataciones.toString(), icon: RefreshCw },
                  { label: 'Nivel de Reputación', value: stats.nivelReputacion, icon: Award },
                  { label: 'Ingresos Totales', value: `S/ ${stats.ingresosTotales.toFixed(2)}`, icon: Wallet },
                ].map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={glassCard + ' p-5'}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[rgba(246,165,192,0.15)] flex items-center justify-center mb-3">
                      <card.icon className="w-5 h-5 text-[#F6A5C0]" />
                    </div>
                    <p className="text-xs text-[#F5D5E0]/60 uppercase tracking-wider">{card.label}</p>
                    <p className="text-xl font-bold text-white mt-1">{card.value}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* d) Health Records */}
            {activeService && (
              <div className={glassCard + ' p-6'}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(102,103,171,0.15)] flex items-center justify-center">
                    <Activity className="w-5 h-5 text-[#6667AB]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Historial de Salud</h3>
                    <p className="text-xs text-[#6667AB]">Registros médicos del menor a cargo</p>
                  </div>
                </div>
                <HistorialSalud ordenId={activeService.Id} />
              </div>
            )}

            {/* e) Panic Button */}
            {activeService && (
              <div className={glassCard + ' p-6'}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(209,66,66,0.15)] flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#D14242]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Botón de Pánico</h3>
                    <p className="text-xs text-[#6667AB]">Mantén presionado 3 segundos para reportar una emergencia</p>
                  </div>
                </div>
                <div className="flex justify-center py-4">
                  <PanicButton orderId={activeService.Id} />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ════════════════════ TAB: MENSAJES ════════════════════ */}
        {tab === 'mensajes' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={glassCard + ' p-12 text-center'}>
            <MessageSquare className="w-16 h-16 text-[#6667AB] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Mensajes</h2>
            <p className="text-[#F5D5E0]/70 mb-6 max-w-md mx-auto">
              Accede a tu bandeja de mensajes desde el botón <strong className="text-white">"Mensajes"</strong> en el encabezado de la página.
            </p>
          </motion.div>
        )}

        {/* ════════════════════ TAB: PAGOS ════════════════════ */}
        {tab === 'pagos' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
                <p className="text-xs text-[#6667AB]">Total ganado</p>
                <p className="text-2xl font-extrabold text-[#F6A5C0]">S/ {totalesPagos.ganado.toFixed(2)}</p>
              </div>
              <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
                <p className="text-xs text-[#6667AB]">Liberado</p>
                <p className="text-2xl font-extrabold text-emerald-400">S/ {totalesPagos.liberado.toFixed(2)}</p>
              </div>
              <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
                <p className="text-xs text-[#6667AB]">Pendiente (en Escrow)</p>
                <p className="text-2xl font-extrabold text-amber-400">S/ {totalesPagos.pendiente.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Historial de Pagos</h3>
              {pagos.length === 0 ? (
                <p className="text-sm text-[#6667AB] text-center py-8">Aún no tienes pagos registrados</p>
              ) : (
                <div className="space-y-3">
                  {pagos.map((p, i) => (
                    <div key={p.escrowId} className="flex items-center justify-between bg-[rgba(33,6,53,0.4)] rounded-xl px-4 py-3 border border-[rgba(255,255,255,0.06)]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#F6A5C0]/20 flex items-center justify-center flex-shrink-0">
                          <DollarSign className="w-4 h-4 text-[#F6A5C0]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{p.familiaNombres} {p.familiaApellidos}</p>
                          <p className="text-xs text-[#6667AB]">{p.menorNombre ? `👶 ${p.menorNombre} · ` : ''}{p.TotalHoras}h × S/ {p.TarifaHora.toFixed(2)}</p>
                          <p className="text-[10px] text-[#6667AB] mt-0.5">{p.FechaServicio}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm font-bold text-white">S/ {p.MontoCuidadora.toFixed(2)}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.escrowEstado === 'Liberado' ? 'bg-emerald-500/20 text-emerald-200' :
                          p.escrowEstado === 'Retenido' ? 'bg-amber-500/20 text-amber-200' :
                          'bg-red-500/20 text-red-200'
                        }`}>
                          {p.escrowEstado === 'Liberado' ? 'Pagado' : p.escrowEstado === 'Retenido' ? 'En Escrow' : p.escrowEstado}
                        </span>
                        {p.FechaLiberacion && (
                          <p className="text-[10px] text-[#6667AB] mt-1">Liberado: {new Date(p.FechaLiberacion).toLocaleDateString('es-PE')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ════════════════════ TAB: CAPACITACION ════════════════════ */}
        {tab === 'capacitacion' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <CentroCapacitacion />
          </motion.div>
        )}

        {/* ════════════════════ TAB: REPORTES ════════════════════ */}
        {tab === 'reportes' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ReporteDiarioForm onBack={() => setTab('panel')} />
          </motion.div>
        )}

        {/* ════════════════════ TAB: REEMPLAZO ════════════════════ */}
        {tab === 'reemplazo' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ReemplazoTracker />
          </motion.div>
        )}
      </div>
      {/* ════════════════════ DETALLE DEL SERVICIO MODAL ════════════════════ */}
      <AnimatePresence>
        {detalleServicio && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { setDetalleServicio(null); setDetalleData(null); }}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[rgba(33,6,53,0.95)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.12)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <button onClick={() => { setDetalleServicio(null); setDetalleData(null); }}
                  className="float-right p-1.5 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
                ><X className="w-4 h-4 text-[#6667AB]" /></button>

                <h3 className="text-lg font-bold text-white mb-2">Detalle del Servicio</h3>
                <p className="text-sm text-[#6667AB] mb-6">
                  {detalleServicio.FamiliaNombres} {detalleServicio.FamiliaApellidos} · {detalleServicio.FechaServicio}
                </p>

                {cargandoDetalle ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 text-[#6667AB] mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-[#6667AB]">Cargando detalle...</p>
                  </div>
                ) : detalleData ? (
                  <div className="space-y-6">

                    {/* Info general */}
                    <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                      <h4 className="text-xs font-bold text-[#F6A5C0] uppercase mb-3">Información del Servicio</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-[#6667AB]">Estado:</span> <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${badgeStyle(detalleData.Estado)}`}>{detalleData.Estado}</span></div>
                        <div><span className="text-[#6667AB]">Fecha:</span> <span className="text-white ml-1">{detalleData.FechaServicio}</span></div>
                        <div><span className="text-[#6667AB]">Horario:</span> <span className="text-white ml-1">{detalleData.HoraInicio} - {detalleData.HoraFin}</span></div>
                        <div><span className="text-[#6667AB]">Horas:</span> <span className="text-white ml-1">{detalleData.TotalHoras}h</span></div>
                        <div><span className="text-[#6667AB]">Tarifa:</span> <span className="text-white ml-1">S/ {detalleData.TarifaHora}/h</span></div>
                        <div><span className="text-[#6667AB]">Total:</span> <span className="text-white ml-1 font-bold">S/ {detalleData.Total?.toFixed(2)}</span></div>
                        {detalleData.MenorNombre && (
                          <div className="col-span-2"><span className="text-[#6667AB]">Menor:</span> <span className="text-white ml-1">{detalleData.MenorNombre}{detalleData.MenorDiagnostico ? ` (${detalleData.MenorDiagnostico})` : ''}</span></div>
                        )}
                      </div>
                    </div>

                    {/* Motivo de cancelación */}
                    {(detalleData.Estado === 'Cancelado' || detalleData.Estado === 'Cancelada') && detalleData.motivoCancelacion && (
                      <div className="bg-[rgba(239,68,68,0.1)] border border-red-500/30 rounded-xl p-4">
                        <div className="flex items-start gap-2">
                          <Ban className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-red-300 mb-1">Motivo de Cancelación</h4>
                            <p className="text-xs text-red-200/80">{detalleData.motivoCancelacion}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tareas del contrato */}
                    {detalleData.tareas?.length > 0 && (
                      <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                        <h4 className="text-xs font-bold text-[#F6A5C0] uppercase mb-3 flex items-center gap-2">
                          <ListTodo className="w-4 h-4" /> Tareas del Contrato
                        </h4>
                        <div className="space-y-2">
                          {detalleData.tareas.map((t: any) => (
                            <div key={t.Id} className="flex items-center justify-between bg-[rgba(33,6,53,0.3)] rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                {t.Decision === 'Aceptar' && <ThumbsUp className="w-3.5 h-3.5 text-[#6EE7B7]" />}
                                {t.Decision === 'Rechazar' && <ThumbsDown className="w-3.5 h-3.5 text-red-400" />}
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
                            Familia: {detalleData.contrato.AceptadoFamilia ? 'Aceptó' : 'Pendiente'}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${detalleData.contrato.AceptadoCuidadora ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'}`}>
                            {detalleData.contrato.AceptadoCuidadora ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            Tú: {detalleData.contrato.AceptadoCuidadora ? 'Aceptaste' : 'Pendiente'}
                          </span>
                        </div>
                        {detalleData.contrato.Terminos && (
                          <pre className="mt-3 text-[10px] text-[#6667AB] whitespace-pre-wrap max-h-40 overflow-y-auto bg-[rgba(33,6,53,0.3)] rounded-lg p-3">{detalleData.contrato.Terminos}</pre>
                        )}
                        <button onClick={() => setShowContractPreview(true)}
                          className="mt-3 w-full py-2 rounded-lg bg-[#F6A5C0]/10 text-[#F6A5C0] text-xs font-bold hover:bg-[#F6A5C0]/20 transition-colors border border-[#F6A5C0]/30"
                        >Ver Contrato Completo</button>
                      </div>
                    )}

                    {/* Reseñas y calificaciones */}
                    {detalleData.resenas?.length > 0 && (
                      <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                        <h4 className="text-xs font-bold text-[#F6A5C0] uppercase mb-3 flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" /> Reseñas de la Familia
                        </h4>
                        <div className="space-y-3">
                          {detalleData.resenas.map((r: any, i: number) => (
                            <div key={i} className="bg-[rgba(33,6,53,0.3)] rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-white">{r.Nombres} {r.Apellidos?.charAt(0)}.</span>
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map(j => (
                                    <Star key={j} className={`w-3 h-3 ${j <= r.Calificacion ? 'text-[#CC8DB3] fill-[#CC8DB3]' : 'text-[#6667AB]'}`} />
                                  ))}
                                </div>
                                <span className="text-xs text-[#6667AB]">({r.Calificacion}/5)</span>
                              </div>
                              {r.Comentario && <p className="text-xs text-[#6667AB] leading-relaxed">"{r.Comentario}"</p>}
                              <p className="text-[10px] text-[#6667AB]/60 mt-1">{r.FechaCreacion ? new Date(r.FechaCreacion).toLocaleDateString('es-PE') : ''}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Negociaciones */}
                    {detalleData.negociaciones?.length > 0 && (
                      <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                        <h4 className="text-xs font-bold text-[#F6A5C0] uppercase mb-3 flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" /> Historial de Negociación
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
                ) : (
                  <div className="text-center py-8 text-[#6667AB]">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No se pudo cargar el detalle</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTRACT PREVIEW MODAL ── */}
      {showContractPreview && detalleData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowContractPreview(false)}
        >
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <ContractFormat
              codigo={`CTN-2026-${String(detalleData.Id || 0).padStart(4, '0')}`}
              fechaEmision={new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
              familiaNombre={`${detalleData.FamiliaNombres || ''} ${detalleData.FamiliaApellidos || ''}`}
              cuidadoraNombre={`${user?.nombres || ''} ${user?.apellidos || ''}`}
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
            />
            <button onClick={() => setShowContractPreview(false)}
              className="mt-4 w-full py-3 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:opacity-90 transition-opacity"
            >Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadDocs({ postulacionId, tiposRequeridos, headers }: { postulacionId?: number; tiposRequeridos: string[]; headers: Record<string, string> }) {
  const [tipo, setTipo] = useState(tiposRequeridos[0] || 'DNI');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  const subir = async () => {
    if (!file) return setMsg('Selecciona un archivo');
    setUploading(true);
    setMsg('');
    const form = new FormData();
    form.append('archivo', file);
    form.append('tipo', tipo);
    try {
      const r = await fetch('/api/cuidadora/documentos', { method: 'POST', headers: { 'x-user-id': headers['x-user-id'] }, body: form });
      const data = await r.json();
      if (r.ok) { setMsg('Documento subido correctamente'); setFile(null); setTimeout(() => setMsg(''), 2500); }
      else setMsg(data.error || 'Error al subir');
    } catch { setMsg('Error de conexión'); }
    setUploading(false);
  };

  return (
    <div className="border-2 border-dashed border-[rgba(255,255,255,0.3)] bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
      <p className="text-sm font-semibold text-[#F5D5E0] mb-3">Subir documento</p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-[#6667AB] mb-1">Tipo</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)}
            className="rounded-lg bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]"
          >
            {tiposRequeridos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#6667AB] mb-1">Archivo (PDF, máx 10MB)</label>
          <input type="file" accept=".pdf,.jpg,.png" onChange={e => setFile(e.target.files?.[0] || null)}
            className="text-sm text-[#F5D5E0] file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[rgba(33,6,53,0.5)] file:text-[#F5D5E0] hover:file:bg-[rgba(33,6,53,0.4)]"
          />
        </div>
        <button onClick={subir} disabled={uploading || !file}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#CC8DB3] text-[#210635] rounded-lg text-sm font-bold hover:bg-[#b07a9a] transition-colors disabled:opacity-50"
        >
          {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Subiendo...' : 'Subir'}
        </button>
      </div>
      {msg && <p className={`text-xs mt-2 ${msg.includes('correctamente') ? 'text-[#6EE7B7]' : 'text-red-600'}`}>{msg}</p>}
    </div>
  );
}
