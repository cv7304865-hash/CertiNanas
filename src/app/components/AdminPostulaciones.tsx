import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { UserCheck, Clock, Eye, CheckCircle, XCircle, Search, Shield, Users, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PostulacionDetailModal } from './PostulacionDetailModal';

type PostulacionRich = {
  Id: number;
  IdUsuario: number;
  Nombres: string;
  Apellidos: string;
  Email: string;
  Telefono: string;
  AniosExperiencia: number;
  Especialidades: string[];
  FechaPostulacion: string;
  Estado: string;
  TotalDocumentos: number;
  HorasTranscurridas: number;
  MotivoRechazo?: string;
};

type DocumentoBackend = {
  Id: number;
  IdPostulacion: number;
  TipoRequisito: string;
  NombreArchivo: string;
  Estado: string;
};

const tabs = [
  { key: 'postulaciones', label: 'Postulaciones', count: 2 },
  { key: 'aprobadas', label: 'Aprobadas' },
  { key: 'rechazadas', label: 'Rechazadas' },
];

const mockPostulaciones: PostulacionRich[] = [
  {
    Id: 1, IdUsuario: 11,
    Nombres: 'Lucia', Apellidos: 'Ramirez',
    Email: 'lucia.ramirez@email.com', Telefono: '+51 987 654 321',
    AniosExperiencia: 8,
    Especialidades: ['TDAH', 'Primeros Auxilios', 'Estimulación Temprana'],
    FechaPostulacion: new Date(Date.now() - 8.1 * 3600000).toISOString(),
    Estado: 'Pendiente', TotalDocumentos: 4,
    HorasTranscurridas: 8.1,
  },
  {
    Id: 2, IdUsuario: 12,
    Nombres: 'Patricia', Apellidos: 'Vargas',
    Email: 'patricia.vargas@email.com', Telefono: '+51 976 543 210',
    AniosExperiencia: 12,
    Especialidades: ['TEA', 'Terapia de Lenguaje'],
    FechaPostulacion: new Date(Date.now() - 15.3 * 3600000).toISOString(),
    Estado: 'Pendiente', TotalDocumentos: 4,
    HorasTranscurridas: 15.3,
  },
  {
    Id: 3, IdUsuario: 13,
    Nombres: 'María', Apellidos: 'González',
    Email: 'maria.gonzalez@email.com', Telefono: '+51 965 432 101',
    AniosExperiencia: 5,
    Especialidades: ['Estimulación Temprana'],
    FechaPostulacion: new Date(Date.now() - 20 * 3600000).toISOString(),
    Estado: 'Rechazada', TotalDocumentos: 3,
    HorasTranscurridas: 20,
    MotivoRechazo: 'Documentos incompletos: falta certificado de antecedentes penales vigente.',
  },
  {
    Id: 4, IdUsuario: 14,
    Nombres: 'Carmen', Apellidos: 'Rojas',
    Email: 'carmen.rojas@email.com', Telefono: '+51 954 321 012',
    AniosExperiencia: 2,
    Especialidades: ['TDAH'],
    FechaPostulacion: new Date(Date.now() - 22 * 3600000).toISOString(),
    Estado: 'Rechazada', TotalDocumentos: 4,
    HorasTranscurridas: 22,
    MotivoRechazo: 'No cumple con el mínimo de 3 años de experiencia requerido.',
  },
];

export function AdminPostulaciones() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-admin-user': String(user?.id) };
  const [activeTab, setActiveTab] = useState('postulaciones');
  const [postulaciones, setPostulaciones] = useState<PostulacionRich[]>(mockPostulaciones);
  const [selectedPost, setSelectedPost] = useState<PostulacionRich | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/postulaciones', { headers })
      .then(r => r.json())
      .then((data: any[]) => {
        if (data.length > 0) {
          const enriched = data.map((p, i) => ({
            ...p,
            Telefono: p.Telefono || '+51 9' + String(10000000 + i).slice(0, 8),
            AniosExperiencia: p.AniosExperiencia || Math.floor(Math.random() * 10) + 3,
            Especialidades: p.Especialidades || ['TDAH', 'Primeros Auxilios'].slice(0, (i % 2) + 1),
            HorasTranscurridas: Math.round((Date.now() - new Date(p.FechaPostulacion).getTime()) / 3600000 * 10) / 10,
          }));
          setPostulaciones(enriched);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = postulaciones.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = `${p.Nombres} ${p.Apellidos} ${p.Email}`.toLowerCase().includes(q);
    if (activeTab === 'postulaciones') return matchSearch && p.Estado === 'Pendiente';
    if (activeTab === 'aprobadas') return matchSearch && p.Estado === 'Aprobada';
    if (activeTab === 'rechazadas') return matchSearch && p.Estado === 'Rechazada';
    return matchSearch;
  });

  const handleVerDetalle = (p: PostulacionRich) => {
    setSelectedPost(p);
    setShowDetailModal(true);
  };

  const handleAprobar = async (id: number) => {
    const r = await fetch(`/api/admin/postulaciones/${id}/aprobar`, { method: 'POST', headers });
    if (r.ok) {
      setPostulaciones(prev => prev.map(p => p.Id === id ? { ...p, Estado: 'Aprobada' } : p));
      setShowDetailModal(false);
    }
  };

  const handleRechazar = async (id: number) => {
    const r = await fetch(`/api/admin/postulaciones/${id}/rechazar`, { method: 'POST', headers });
    if (r.ok) {
      setPostulaciones(prev => prev.map(p => p.Id === id ? { ...p, Estado: 'Rechazada' } : p));
      setShowDetailModal(false);
    }
  };

  const counts = {
    postulaciones: postulaciones.filter(p => p.Estado === 'Pendiente').length,
    aprobadas: postulaciones.filter(p => p.Estado === 'Aprobada').length,
    rechazadas: postulaciones.filter(p => p.Estado === 'Rechazada').length,
  };

  const sectionTitle = activeTab === 'postulaciones' ? 'Postulaciones pendientes'
    : activeTab === 'aprobadas' ? 'Postulaciones aprobadas'
    : 'Postulaciones rechazadas';

  return (
    <div className="max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-white">Postulaciones</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6667AB]" />
          <input
            type="text" placeholder="Buscar postulante..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]"
          />
        </div>
      </div>

      {/* Glass tabs bar */}
      <div className="bg-[rgba(33,6,53,0.5)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.12)] shadow-lg shadow-black/20 rounded-2xl p-1.5 mb-6 inline-flex">
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-[rgba(255,255,255,0.12)] text-white shadow-sm'
                  : 'text-[#6667AB] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#F6A5C0] text-[#210635] text-[10px] font-extrabold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Pending postulations list */}
      <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.15)] shadow-lg shadow-black/30 rounded-3xl overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-bold text-lg">{sectionTitle}</h2>
            <span className="text-xs text-[#6667AB] font-medium">({counts[activeTab as keyof typeof counts]})</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#6667AB] text-sm">No hay postulaciones en esta categoría</div>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.06)]">
            {filtered.map((p, i) => (
              <motion.div
                key={p.Id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-colors px-6 py-4"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#CC8DB3] font-bold text-lg flex-shrink-0">
                    {p.Nombres.charAt(0)}{p.Apellidos.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base truncate">{p.Nombres} {p.Apellidos}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#F5D5E0]">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#6667AB]" /> {p.Email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#6667AB]" /> {p.Telefono}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#6667AB]" /> {p.AniosExperiencia} años exp.
                      </span>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1.5">
                      {p.Especialidades.map((esp, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-full bg-[#7B337E] text-white text-[10px] font-semibold">
                          {esp}
                        </span>
                      ))}
                    </div>

                    {/* Review time bar */}
                    {p.Estado === 'Pendiente' && (
                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-medium text-[#6667AB]">Tiempo de revisión</span>
                          <span className="text-[10px] font-bold text-[#F5D5E0]">{p.HorasTranscurridas.toFixed(1)}h / 24h</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((p.HorasTranscurridas / 24) * 100, 100)}%` }}
                            transition={{ duration: 0.6, delay: i * 0.05 }}
                            className="h-full rounded-full bg-[#CC8DB3]"
                            style={{ boxShadow: '0 0 6px rgba(204,141,179,0.4)' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Rejection reason */}
                    {p.Estado === 'Rechazada' && p.MotivoRechazo && (
                      <div className="pt-1">
                        <div className="flex items-start gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-[#D14242] mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-[#D14242] leading-relaxed">{p.MotivoRechazo}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions — only for pending */}
                  {p.Estado === 'Pendiente' && (
                    <div className="flex flex-col gap-2 flex-shrink-0 pt-1">
                      <button
                        onClick={() => handleVerDetalle(p)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#F5D5E0] text-[#F5D5E0] text-xs font-semibold hover:bg-[rgba(245,213,224,0.1)] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver detalle
                      </button>
                      <button
                        onClick={() => handleAprobar(p.Id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#10B981] hover:bg-[#10B981]/80 text-white text-xs font-bold transition-all shadow-lg shadow-black/20"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Validar
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <PostulacionDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        postulante={selectedPost ? {
          id: selectedPost.Id,
          nombres: selectedPost.Nombres,
          apellidos: selectedPost.Apellidos,
          email: selectedPost.Email,
          telefono: selectedPost.Telefono,
          experiencia: selectedPost.AniosExperiencia,
          especialidades: selectedPost.Especialidades,
          avatarLetras: selectedPost.Nombres.charAt(0) + selectedPost.Apellidos.charAt(0),
          horasTranscurridas: selectedPost.HorasTranscurridas,
          horasMaximas: 24,
          documentos: [
            { id: 1, nombre: 'DNI', estado: 'por verificar' },
            { id: 2, nombre: 'Antecedentes penales', estado: 'por verificar' },
            { id: 3, nombre: 'Certificado de salud', estado: 'por verificar' },
            { id: 4, nombre: 'Título profesional', estado: 'por verificar' },
          ],
        } : null}
        onAprobar={handleAprobar}
        onRechazar={handleRechazar}
      />
    </div>
  );
}
