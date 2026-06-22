import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  UserCheck, Clock, Eye, CheckCircle, XCircle, Search, FileText,
  Download, AlertTriangle, ChevronDown, ChevronUp, Mail, Phone,
  Users, ThumbsUp, ThumbsDown, Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DocumentPreviewModal } from './DocumentPreviewModal';

type Documento = {
  Id: number;
  TipoRequisito: string;
  NombreArchivo: string;
  Estado: string;
  Peso?: string;
  MotivoRechazo?: string;
};

type Postulacion = {
  Id: number;
  IdUsuario: number;
  Nombres: string;
  Apellidos: string;
  Email: string;
  FechaPostulacion: string;
  Estado: string;
  HorasTranscurridas: number;
  TotalDocumentos: number;
  Documentos: Documento[];
  MotivoRechazo?: string;
};

const dummyPendientes: Postulacion[] = [
  { Id: 9991, IdUsuario: 91, Nombres: 'Lucía', Apellidos: 'Fernández', Email: 'lucia.fernandez@email.com', FechaPostulacion: new Date(Date.now() - 2 * 3600000).toISOString(), Estado: 'Pendiente', HorasTranscurridas: 2, TotalDocumentos: 5, Documentos: [{ Id: 1, TipoRequisito: 'DNI', NombreArchivo: 'dni.pdf', Estado: 'Aprobado', Peso: '0.8 MB' }, { Id: 2, TipoRequisito: 'Antecedentes penales', NombreArchivo: 'antecedentes_penales.pdf', Estado: 'Aprobado', Peso: '1.2 MB' }, { Id: 3, TipoRequisito: 'Certificado de salud', NombreArchivo: 'certificado_salud.pdf', Estado: 'Pendiente', Peso: '1.5 MB' }, { Id: 4, TipoRequisito: 'Título profesional', NombreArchivo: 'titulo_profesional.pdf', Estado: 'Pendiente', Peso: '2.1 MB' }, { Id: 5, TipoRequisito: 'Carta de presentación', NombreArchivo: 'carta_presentacion.pdf', Estado: 'Pendiente', Peso: '0.6 MB' }] },
  { Id: 9992, IdUsuario: 92, Nombres: 'Mariana', Apellidos: 'Gutiérrez', Email: 'mariana.gutierrez@email.com', FechaPostulacion: new Date(Date.now() - 12 * 3600000).toISOString(), Estado: 'Pendiente', HorasTranscurridas: 12, TotalDocumentos: 4, Documentos: [{ Id: 6, TipoRequisito: 'DNI', NombreArchivo: 'dni.pdf', Estado: 'Aprobado', Peso: '0.7 MB' }, { Id: 7, TipoRequisito: 'Antecedentes penales', NombreArchivo: 'antecedentes_penales.pdf', Estado: 'Aprobado', Peso: '1.1 MB' }, { Id: 8, TipoRequisito: 'Certificado de salud', NombreArchivo: 'certificado_salud.pdf', Estado: 'Aprobado', Peso: '1.3 MB' }, { Id: 9, TipoRequisito: 'Título profesional', NombreArchivo: 'titulo_profesional.pdf', Estado: 'Pendiente', Peso: '2.0 MB' }] },
  { Id: 9993, IdUsuario: 93, Nombres: 'Camila', Apellidos: 'Reyes', Email: 'camila.reyes@email.com', FechaPostulacion: new Date(Date.now() - 28 * 3600000).toISOString(), Estado: 'Pendiente', HorasTranscurridas: 28, TotalDocumentos: 5, Documentos: [{ Id: 10, TipoRequisito: 'DNI', NombreArchivo: 'dni.pdf', Estado: 'Aprobado', Peso: '0.9 MB' }, { Id: 11, TipoRequisito: 'Antecedentes penales', NombreArchivo: 'antecedentes_penales.pdf', Estado: 'Pendiente', Peso: '1.4 MB' }, { Id: 12, TipoRequisito: 'Certificado de salud', NombreArchivo: 'certificado_salud.pdf', Estado: 'Pendiente', Peso: '1.6 MB' }, { Id: 13, TipoRequisito: 'Título profesional', NombreArchivo: 'titulo_profesional.pdf', Estado: 'Rechazado', Peso: '2.2 MB', MotivoRechazo: 'Documento ilegible' }, { Id: 14, TipoRequisito: 'Carta de presentación', NombreArchivo: 'carta_presentacion.pdf', Estado: 'Pendiente', Peso: '0.5 MB' }] },
];

const dummyValidadas: Postulacion[] = [
  { Id: 9994, IdUsuario: 94, Nombres: 'Valeria', Apellidos: 'Mendoza', Email: 'valeria.mendoza@email.com', FechaPostulacion: new Date(Date.now() - 5 * 86400000).toISOString(), Estado: 'Aprobada', HorasTranscurridas: 120, TotalDocumentos: 5, Documentos: [{ Id: 15, TipoRequisito: 'DNI', NombreArchivo: 'dni.pdf', Estado: 'Aprobado', Peso: '0.8 MB' }, { Id: 16, TipoRequisito: 'Antecedentes penales', NombreArchivo: 'antecedentes_penales.pdf', Estado: 'Aprobado', Peso: '1.2 MB' }, { Id: 17, TipoRequisito: 'Certificado de salud', NombreArchivo: 'certificado_salud.pdf', Estado: 'Aprobado', Peso: '1.5 MB' }, { Id: 18, TipoRequisito: 'Título profesional', NombreArchivo: 'titulo_profesional.pdf', Estado: 'Aprobado', Peso: '2.1 MB' }, { Id: 19, TipoRequisito: 'Carta de presentación', NombreArchivo: 'carta_presentacion.pdf', Estado: 'Aprobado', Peso: '0.6 MB' }] },
  { Id: 9995, IdUsuario: 95, Nombres: 'Alejandra', Apellidos: 'Torres', Email: 'alejandra.torres@email.com', FechaPostulacion: new Date(Date.now() - 10 * 86400000).toISOString(), Estado: 'Aprobada', HorasTranscurridas: 240, TotalDocumentos: 4, Documentos: [{ Id: 20, TipoRequisito: 'DNI', NombreArchivo: 'dni.pdf', Estado: 'Aprobado', Peso: '0.7 MB' }, { Id: 21, TipoRequisito: 'Antecedentes penales', NombreArchivo: 'antecedentes_penales.pdf', Estado: 'Aprobado', Peso: '1.1 MB' }, { Id: 22, TipoRequisito: 'Certificado de salud', NombreArchivo: 'certificado_salud.pdf', Estado: 'Aprobado', Peso: '1.3 MB' }, { Id: 23, TipoRequisito: 'Título profesional', NombreArchivo: 'titulo_profesional.pdf', Estado: 'Aprobado', Peso: '2.0 MB' }] },
];

const dummyRechazadas: Postulacion[] = [
  { Id: 9996, IdUsuario: 96, Nombres: 'Daniela', Apellidos: 'Paredes', Email: 'daniela.paredes@email.com', FechaPostulacion: new Date(Date.now() - 7 * 86400000).toISOString(), Estado: 'Rechazada', HorasTranscurridas: 168, TotalDocumentos: 5, MotivoRechazo: 'Documentos incompletos: falta certificado de antecedentes penales', Documentos: [{ Id: 24, TipoRequisito: 'DNI', NombreArchivo: 'dni.pdf', Estado: 'Aprobado', Peso: '0.8 MB' }, { Id: 25, TipoRequisito: 'Antecedentes penales', NombreArchivo: 'antecedentes_penales.pdf', Estado: 'Rechazado', Peso: '1.2 MB', MotivoRechazo: 'Documento vencido' }, { Id: 26, TipoRequisito: 'Certificado de salud', NombreArchivo: 'certificado_salud.pdf', Estado: 'Rechazado', Peso: '1.5 MB', MotivoRechazo: 'No es legible' }, { Id: 27, TipoRequisito: 'Título profesional', NombreArchivo: 'titulo_profesional.pdf', Estado: 'Aprobado', Peso: '2.1 MB' }, { Id: 28, TipoRequisito: 'Carta de presentación', NombreArchivo: 'carta_presentacion.pdf', Estado: 'Aprobado', Peso: '0.6 MB' }] },
  { Id: 9997, IdUsuario: 97, Nombres: 'Gabriela', Apellidos: 'Huamán', Email: 'gabriela.huaman@email.com', FechaPostulacion: new Date(Date.now() - 14 * 86400000).toISOString(), Estado: 'Rechazada', HorasTranscurridas: 336, TotalDocumentos: 4, MotivoRechazo: 'No cumple con los requisitos mínimos de experiencia', Documentos: [{ Id: 29, TipoRequisito: 'DNI', NombreArchivo: 'dni.pdf', Estado: 'Aprobado', Peso: '0.7 MB' }, { Id: 30, TipoRequisito: 'Antecedentes penales', NombreArchivo: 'antecedentes_penales.pdf', Estado: 'Aprobado', Peso: '1.1 MB' }, { Id: 31, TipoRequisito: 'Certificado de salud', NombreArchivo: 'certificado_salud.pdf', Estado: 'Rechazado', Peso: '1.3 MB', MotivoRechazo: 'Fecha de emisión muy antigua' }, { Id: 32, TipoRequisito: 'Título profesional', NombreArchivo: 'titulo_profesional.pdf', Estado: 'Aprobado', Peso: '2.0 MB' }] },
];

const glassCard = 'bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl';

export function AdminPostulaciones() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pendientes' | 'validadas' | 'rechazadas'>('pendientes');
  const [previewDoc, setPreviewDoc] = useState<{ name: string; postulante: string } | null>(null);

  const tipoRequisitoToDocTitle: Record<string, string> = {
    'DNI': 'DNI Electrónico',
    'Antecedentes penales': 'Antecedentes Penales',
    'Certificado de salud': 'Certificado de Salud (MINSA)',
    'Título profesional': 'Título Profesional',
    'Carta de presentación': 'Carta de Presentación',
  };

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/postulaciones', { headers });
      if (r.ok) {
        const data = await r.json();
        const enriched = data.map((p: any) => ({
          Id: p.Id,
          IdUsuario: p.IdUsuario,
          Nombres: p.Nombres,
          Apellidos: p.Apellidos,
          Email: p.Email,
          FechaPostulacion: p.FechaPostulacion,
          Estado: p.Estado,
          HorasTranscurridas: Math.round((Date.now() - new Date(p.FechaPostulacion).getTime()) / 3600000 * 10) / 10,
          TotalDocumentos: p.TotalDocumentos || 0,
          Documentos: p.Documentos || [],
          MotivoRechazo: p.MotivoRechazo,
        }));
        setPostulaciones(enriched);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const allPostulaciones = postulaciones.length > 0 ? postulaciones : [];

  const pendientes = allPostulaciones.filter(p => p.Estado === 'Pendiente');
  const validadas = allPostulaciones.filter(p => p.Estado === 'Aprobada');
  const rechazadas = allPostulaciones.filter(p => p.Estado === 'Rechazada');

  const currentList = tab === 'pendientes'
    ? (pendientes.length > 0 ? pendientes : dummyPendientes)
    : tab === 'validadas'
    ? (validadas.length > 0 ? validadas : dummyValidadas)
    : (rechazadas.length > 0 ? rechazadas : dummyRechazadas);

  const filtered = currentList.filter(p => {
    const q = search.toLowerCase();
    return `${p.Nombres} ${p.Apellidos} ${p.Email}`.toLowerCase().includes(q);
  });

  const isUsingDummyData = (tab === 'pendientes' && pendientes.length === 0) ||
    (tab === 'validadas' && validadas.length === 0) ||
    (tab === 'rechazadas' && rechazadas.length === 0);

  const handleAprobarDocumento = async (postId: number, docId: number) => {
    const r = await fetch(`/api/admin/postulaciones/${postId}/documentos/${docId}/aprobar`, {
      method: 'POST', headers,
    });
    if (r.ok) load();
  };

  const handleRechazarDocumento = async (postId: number, docId: number) => {
    const r = await fetch(`/api/admin/postulaciones/${postId}/documentos/${docId}/rechazar`, {
      method: 'POST', headers,
    });
    if (r.ok) load();
  };

  const handleAprobarPostulacion = async (id: number) => {
    const r = await fetch(`/api/admin/postulaciones/${id}/aprobar`, { method: 'POST', headers });
    if (r.ok) load();
  };

  const handleRechazarPostulacion = async (id: number) => {
    const r = await fetch(`/api/admin/postulaciones/${id}/rechazar`, {
      method: 'POST', headers,
      body: JSON.stringify({ motivo: 'Documentos no cumplen requisitos' }),
    });
    if (r.ok) load();
  };

  const slaExceeded = (h: number) => h > 23;

  const badgeEstado = (est: string) => {
    if (est === 'Aprobado') return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30';
    if (est === 'Rechazado') return 'bg-red-500/20 text-red-200 border-red-500/30';
    return 'bg-amber-500/20 text-amber-200 border-amber-500/30';
  };

  const formatFecha = (f: string) => {
    const d = new Date(f);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const tabs = [
    { key: 'pendientes' as const, label: 'Pendientes', icon: Clock, count: pendientes.length || 3, color: 'text-amber-300' },
    { key: 'validadas' as const, label: 'Validadas', icon: ThumbsUp, count: validadas.length || 2, color: 'text-emerald-300' },
    { key: 'rechazadas' as const, label: 'Rechazadas', icon: ThumbsDown, count: rechazadas.length || 2, color: 'text-red-300' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Postulaciones</h1>
          <p className="text-sm text-[#6667AB] mt-1">Revisión, verificación y gestión de documentos</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6667AB]" />
          <input
            type="text" placeholder="Buscar postulante..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E]"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {tabs.map(t => (
          <div key={t.key} className={`${glassCard} p-5 cursor-pointer transition-all hover:border-[rgba(255,255,255,0.4)] ${tab === t.key ? 'ring-2 ring-[#F6A5C0]/50' : ''}`} onClick={() => setTab(t.key)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#6667AB] uppercase tracking-wider">{t.label}</p>
                <p className={`text-3xl font-bold mt-1 ${t.color}`}>{t.count}</p>
              </div>
              <t.icon className={`w-8 h-8 opacity-50 ${t.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 bg-[rgba(33,6,53,0.5)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-1.5">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 justify-center ${
                isActive ? 'bg-[#F6A5C0] text-[#210635] shadow-md' : 'text-[#F5D5E0]/60 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-[#210635]/20 text-[#210635]' : 'bg-[rgba(255,255,255,0.08)] text-[#F5D5E0]/60'}`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {isUsingDummyData && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Mostrando datos de ejemplo — el servidor no devolvió postulaciones reales
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <Clock className="w-8 h-8 text-[#6667AB] mx-auto mb-2 animate-spin" />
          <p className="text-sm text-[#6667AB]">Cargando postulaciones...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl">
          <UserCheck className="w-12 h-12 text-[#6667AB] mx-auto mb-3" />
          <p className="text-[#6667AB]">No hay postulaciones {tab === 'pendientes' ? 'pendientes' : tab === 'validadas' ? 'validadas' : 'rechazadas'}</p>
          {search && <p className="text-[#6667AB]/60 text-sm mt-1">Intenta con otros términos de búsqueda</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p, i) => {
            const isExpanded = expandedId === p.Id;
            const totalDocs = p.Documentos?.length || 0;
            const aprobados = p.Documentos?.filter(d => d.Estado === 'Aprobado').length || 0;
            const rechazados = p.Documentos?.filter(d => d.Estado === 'Rechazado').length || 0;
            const todosAprobados = totalDocs > 0 && aprobados === totalDocs;
            const isSlaExceeded = slaExceeded(p.HorasTranscurridas) && p.Estado === 'Pendiente';

            return (
              <motion.div
                key={p.Id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border shadow-lg shadow-black/30 rounded-2xl overflow-hidden ${
                  isSlaExceeded ? 'border-[#D14242] animate-pulse' : 'border-[rgba(255,255,255,0.2)]'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#CC8DB3] font-bold text-lg flex-shrink-0">
                      {p.Nombres?.charAt(0)}{p.Apellidos?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-white text-base">{p.Nombres} {p.Apellidos}</h3>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeEstado(p.Estado)}`}>
                          {p.Estado}
                        </span>
                        {isSlaExceeded && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D14242]/20 text-[#D14242] text-[10px] font-bold border border-[#D14242]/40">
                            <AlertTriangle className="w-3 h-3" /> SLA Excedido
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#F5D5E0] mt-1.5">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#6667AB]" />{p.Email}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#6667AB]" />{formatFecha(p.FechaPostulacion)}</span>
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-[#6667AB]" />{totalDocs} documentos</span>
                        {p.Estado === 'Pendiente' && (
                          <span className="flex items-center gap-1 text-[#6667AB]">
                            <Filter className="w-3 h-3" />
                            {aprobados}/{totalDocs} aprobados
                          </span>
                        )}
                      </div>

                      {p.MotivoRechazo && p.Estado === 'Rechazada' && (
                        <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                          <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-red-300">{p.MotivoRechazo}</p>
                        </div>
                      )}

                      {p.Estado === 'Pendiente' && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-medium text-[#6667AB]">Tiempo de revisión</span>
                            <span className={`text-[10px] font-bold ${isSlaExceeded ? 'text-[#D14242]' : 'text-[#F5D5E0]'}`}>
                              {p.HorasTranscurridas.toFixed(1)}h / 24h
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((p.HorasTranscurridas / 24) * 100, 100)}%` }}
                              transition={{ duration: 0.6 }}
                              className={`h-full rounded-full ${isSlaExceeded ? 'bg-[#D14242]' : 'bg-[#CC8DB3]'}`}
                            />
                          </div>
                        </div>
                      )}

                      {p.Estado === 'Aprobada' && (
                        <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <p className="text-xs text-emerald-300">Postulación validada — la cuidadora ya está activa en la plataforma</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : p.Id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#F5D5E0] text-[#F5D5E0] text-xs font-semibold hover:bg-[rgba(245,213,224,0.1)] transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        Documentos
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[rgba(255,255,255,0.08)] overflow-hidden"
                    >
                      <div className="p-5 space-y-3">
                        {p.Documentos?.length === 0 ? (
                          <p className="text-sm text-[#6667AB] text-center py-4">Sin documentos subidos</p>
                        ) : (
                          p.Documentos.map(doc => (
                            <div key={doc.Id} className={`flex items-center justify-between rounded-xl p-3 ${
                              doc.Estado === 'Rechazado'
                                ? 'bg-red-500/10 border border-red-500/20'
                                : doc.Estado === 'Aprobado'
                                ? 'bg-emerald-500/10 border border-emerald-500/20'
                                : 'bg-[rgba(33,6,53,0.4)] border border-[rgba(255,255,255,0.06)]'
                            }`}>
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <FileText className={`w-5 h-5 shrink-0 ${
                                  doc.Estado === 'Rechazado' ? 'text-red-400' : doc.Estado === 'Aprobado' ? 'text-emerald-400' : 'text-[#6667AB]'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white">{doc.TipoRequisito}</p>
                                  <p className="text-[10px] text-[#6667AB] truncate">{doc.NombreArchivo}{doc.Peso ? ` · ${doc.Peso}` : ''}</p>
                                  {doc.MotivoRechazo && (
                                    <p className="text-[10px] text-red-400 mt-0.5">Motivo: {doc.MotivoRechazo}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-3">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  doc.Estado === 'Aprobado' ? 'bg-emerald-500/20 text-emerald-200' :
                                  doc.Estado === 'Rechazado' ? 'bg-red-500/20 text-red-200' :
                                  'bg-amber-500/20 text-amber-200'
                                }`}>
                                  {doc.Estado}
                                </span>
                                {doc.Estado === 'Pendiente' && (
                                  <>
                                    <button
                                      onClick={() => handleAprobarDocumento(p.Id, doc.Id)}
                                      className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 transition-colors"
                                      title="Aprobar documento"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleRechazarDocumento(p.Id, doc.Id)}
                                      className="p-1.5 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-colors"
                                      title="Rechazar documento"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => setPreviewDoc({ name: tipoRequisitoToDocTitle[doc.TipoRequisito] || doc.TipoRequisito, postulante: `${p.Nombres} ${p.Apellidos}` })}
                                  className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.06)] text-[#6667AB] hover:text-[#F6A5C0] transition-colors"
                                  title="Ver documento"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.06)] text-[#6667AB] hover:text-white transition-colors" title="Descargar">
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}

                        {p.Estado === 'Pendiente' && (
                          <div className="flex items-center gap-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                            <button
                              onClick={() => handleAprobarPostulacion(p.Id)}
                              disabled={!todosAprobados}
                              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                todosAprobados
                                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-black/20'
                                  : 'bg-[rgba(33,6,53,0.5)] text-[#6667AB] cursor-not-allowed'
                              }`}
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Aprobar Postulación
                            </button>
                            <button
                              onClick={() => handleRechazarPostulacion(p.Id)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-400 text-red-400 text-xs font-bold hover:bg-[rgba(200,40,40,0.1)] transition-all"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Rechazar
                            </button>
                            {!todosAprobados && (
                              <span className="text-[10px] text-[#6667AB]">Faltan {totalDocs - aprobados} documento(s) por aprobar</span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        documentName={previewDoc?.name || ''}
        postulanteName={previewDoc?.postulante}
      />
    </div>
  );
}