import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Star, MessageSquare, Briefcase, LogOut, CheckCircle, ChevronRight, Clock, User, DollarSign,
  Calendar, Upload, File, RefreshCw, Award, BookOpen, MapPin, Shield, AlertTriangle, Send,
  TrendingUp, Users, Search, X, Play, Square, Activity, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';
import { CuidadoraSolicitudes } from './CuidadoraSolicitudes';
import { PanicButton } from './PanicButton';

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

type Tab = 'perfil' | 'servicios' | 'solicitudes' | 'panel' | 'mensajes';

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
    <div className="min-h-screen bg-gradient-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
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
            <nav className="flex items-center gap-4 sm:gap-6">
              {(['perfil', 'servicios', 'solicitudes', 'panel', 'mensajes'] as Tab[]).map(t => (
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
                </button>
              ))}
              <ProfileAvatar size={36} className="ml-2" />
              <button onClick={logout} className="p-2 hover:bg-[rgba(33,6,53,0.4)] rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-[#6667AB]" />
              </button>
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
                      className="h-full rounded-full bg-gradient-to-r from-[#7B337E] to-[#F6A5C0]"
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
                      className="h-full rounded-full bg-gradient-to-r from-[#7B337E] to-[#F6A5C0]"
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
                      {s.Estado === 'En Curso' && (
                        <div className="flex items-center gap-2 shrink-0 ml-4">
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
                        </div>
                      )}
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

            {/* c) Panic Button */}
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
              Accede a tu bandeja de mensajes para comunicarte con las familias y el equipo CERTINANAS.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate?.('messages')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#F6A5C0] text-[#210635] rounded-xl text-sm font-bold"
            >
              <MessageSquare className="w-4 h-4" /> Ir a Mensajes
            </motion.button>
          </motion.div>
        )}
      </div>
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
