import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  UserCheck, Clock, Eye, CheckCircle, XCircle, Search, FileText,
  Download, AlertTriangle, ChevronDown, ChevronUp, Mail, Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Documento = {
  Id: number;
  NombreArchivo: string;
  TipoRequisito: string;
  Estado: string;
  Tamano?: string;
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
  Documentos: Documento[];
};

export function AdminPostulaciones() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/postulaciones', { headers });
      if (r.ok) {
        const data = await r.json();
        const enriched = data.map((p: any) => ({
          ...p,
          HorasTranscurridas: Math.round((Date.now() - new Date(p.FechaPostulacion).getTime()) / 3600000 * 10) / 10,
          Documentos: p.Documentos || [],
        }));
        setPostulaciones(enriched);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = postulaciones.filter(p => {
    const q = search.toLowerCase();
    return `${p.Nombres} ${p.Apellidos} ${p.Email}`.toLowerCase().includes(q);
  });

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
    if (est === 'Pendiente') return 'bg-amber-500/20 text-amber-200 border-amber-500/30';
    if (est === 'Aprobado') return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30';
    return 'bg-red-500/20 text-red-200 border-red-500/30';
  };

  const formatFecha = (f: string) => {
    const d = new Date(f);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Postulaciones</h1>
          <p className="text-sm text-[#6667AB] mt-1">Revisión y verificación de documentos</p>
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

      {loading ? (
        <div className="text-center py-16">
          <Clock className="w-8 h-8 text-[#6667AB] mx-auto mb-2 animate-spin" />
          <p className="text-sm text-[#6667AB]">Cargando postulaciones...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl">
          <UserCheck className="w-12 h-12 text-[#6667AB] mx-auto mb-3" />
          <p className="text-[#6667AB]">No hay postulaciones</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p, i) => {
            const isExpanded = expandedId === p.Id;
            const totalDocs = p.Documentos?.length || 0;
            const aprobados = p.Documentos?.filter(d => d.Estado === 'Aprobado').length || 0;
            const todosAprobados = totalDocs > 0 && aprobados === totalDocs;

            return (
              <motion.div
                key={p.Id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border shadow-lg shadow-black/30 rounded-2xl overflow-hidden ${
                  slaExceeded(p.HorasTranscurridas) && p.Estado === 'Pendiente'
                    ? 'border-[#D14242] animate-pulse'
                    : 'border-[rgba(255,255,255,0.2)]'
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
                        {slaExceeded(p.HorasTranscurridas) && p.Estado === 'Pendiente' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D14242]/20 text-[#D14242] text-[10px] font-bold border border-[#D14242]/40">
                            <AlertTriangle className="w-3 h-3" /> SLA Excedido
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#F5D5E0] mt-1.5">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#6667AB]" />{p.Email}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#6667AB]" />{formatFecha(p.FechaPostulacion)}</span>
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-[#6667AB]" />{totalDocs} documentos</span>
                      </div>

                      {p.Estado === 'Pendiente' && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-medium text-[#6667AB]">Tiempo de revisión</span>
                            <span className={`text-[10px] font-bold ${slaExceeded(p.HorasTranscurridas) ? 'text-[#D14242]' : 'text-[#F5D5E0]'}`}>
                              {p.HorasTranscurridas.toFixed(1)}h / 24h
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((p.HorasTranscurridas / 24) * 100, 100)}%` }}
                              transition={{ duration: 0.6 }}
                              className={`h-full rounded-full ${slaExceeded(p.HorasTranscurridas) ? 'bg-[#D14242]' : 'bg-[#CC8DB3]'}`}
                            />
                          </div>
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
                            <div key={doc.Id} className="flex items-center justify-between bg-[rgba(33,6,53,0.4)] rounded-xl p-3">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-[#6667AB]" />
                                <div>
                                  <p className="text-sm font-semibold text-white">{doc.TipoRequisito}</p>
                                  <p className="text-[10px] text-[#6667AB]">{doc.NombreArchivo}{doc.Tamano ? ` · ${doc.Tamano}` : ''}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
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
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleRechazarDocumento(p.Id, doc.Id)}
                                      className="p-1.5 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-colors"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        )}

                        {p.Estado === 'Pendiente' && (
                          <div className="flex items-center gap-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
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
    </div>
  );
}
