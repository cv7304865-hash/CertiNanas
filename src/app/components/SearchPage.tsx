import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Search, Star, LogOut, X, CheckCircle, Heart, Quote, MapPin, Award, BookOpen, FileText, Briefcase, MessageSquare, ChevronDown, ChevronUp, Video, FileSignature, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';
import { DocumentPreviewModal } from './DocumentPreviewModal';

type CuidadoraCard = {
  Id: number; IdUsuario: number; AniosExperiencia: number; TarifaHora: number;
  CalificacionPromedio: number; TotalResenas: number;
  Nombres: string; Apellidos: string; Email: string;
  Especialidades: string; Compatibilidad?: number;
};

type MatchingResult = {
  cuidadoraId: number; compatibilidad: number; nombre: string;
};

const zonas = ['Todas', 'Trujillo Centro', 'Víctor Larco', 'La Esperanza', 'Moche', 'Buenos Aires'];
const especialidadesList = ['Todas', 'TEA', 'TDAH', 'Sindrome de Down', 'Primeros Auxilios', 'Discapacidad Motriz'];
const expOptions = ['0+ años', '1+ años', '3+ años', '5+ años', '10+ años'];

const COLORS = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500'];

type CasoExito = {
  Id: number; Titulo: string; Descripcion: string; FechaCreacion: string;
  Nombres: string; Apellidos: string;
};

export function SearchPage({ onNavigate, inline }: { onNavigate?: (v: string) => void; inline?: boolean }) {
  const { user, logout } = useAuth();
  const [cuidadoras, setCuidadoras] = useState<CuidadoraCard[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [especialidad, setEspecialidad] = useState('Todas');
  const [zona, setZona] = useState('Todas');
  const [experiencia, setExperiencia] = useState('0+ años');
  const [tarifaMax, setTarifaMax] = useState('100');
  const [selectedNana, setSelectedNana] = useState<CuidadoraCard | null>(null);
  const [perfilCompleto, setPerfilCompleto] = useState<any>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(false);
  const [showSchedule, setShowSchedule] = useState<CuidadoraCard | null>(null);
  const [showOptions, setShowOptions] = useState<CuidadoraCard | null>(null);
  const [exitos, setExitos] = useState<CasoExito[]>([]);
  const [matching, setMatching] = useState<MatchingResult[]>([]);
  const [docPreviewCuidadora, setDocPreviewCuidadora] = useState<CuidadoraCard | null>(null);
  const [soloVerificadas, setSoloVerificadas] = useState(true);

  const buscar = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (especialidad && especialidad !== 'Todas') params.set('especialidad', especialidad);
      if (zona && zona !== 'Todas') params.set('zona', zona);
      if (experiencia && experiencia !== '0+ años') params.set('experiencia', experiencia.replace('+ años', ''));
      if (tarifaMax) params.set('tarifa_max', tarifaMax);
      if (soloVerificadas) params.set('verificada', '1');
      const r = await fetch(`/api/search/cuidadoras?${params}`);
      const data = await r.json();
      const matchMap = new Map(matching.map(m => [m.cuidadoraId, m.compatibilidad]));
      const enriched = data.map((c: CuidadoraCard) => ({
        ...c,
        Compatibilidad: matchMap.get(c.Id) || 0,
      }));
      setCuidadoras(enriched);
      setCount(enriched.length);
    } catch { setCuidadoras([]); setCount(0); }
    setLoading(false);
  };

  useEffect(() => { buscar(); }, []);

  useEffect(() => {
    fetch('/api/casos/exito').then(r => r.json()).then(setExitos).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/matching/resultados/${user.id}`)
      .then(r => r.json())
      .then((data: MatchingResult[]) => setMatching(data))
      .catch(() => {});
  }, [user?.id]);

  const abrirPerfil = async (c: CuidadoraCard) => {
    setSelectedNana(c);
    setCargandoPerfil(true);
    setPerfilCompleto(null);
    try {
      const r = await fetch(`/api/search/cuidadora/${c.Id}/perfil`);
      const data = await r.json();
      setPerfilCompleto(data);
    } catch { setPerfilCompleto(null); }
    setCargandoPerfil(false);
  };

  const getIniciales = (n: string, a: string) => {
    const names = n?.split(' ');
    return `${names?.[0]?.charAt(0) || ''}${a?.charAt(0) || ''}`;
  };

  const content = (
    <>
      <div className="space-y-6">
        {/* Buscador */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-6">Encuentra la cuidadora ideal para tu hijo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select value={especialidad} onChange={e => setEspecialidad(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]">
              {especialidadesList.map(e => <option key={e} value={e}>{e === 'Todas' ? 'Todas las especialidades' : e}</option>)}
            </select>
            <select value={zona} onChange={e => setZona(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]">
              {zonas.map(z => <option key={z} value={z}>{z === 'Todas' ? 'Todas las zonas' : z}</option>)}
            </select>
            <select value={experiencia} onChange={e => setExperiencia(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]">
              {expOptions.map(e => <option key={e} value={e}>{e === '0+ años' ? 'Sin experiencia' : e}</option>)}
            </select>
            <div className="relative">
              <input type="number" value={tarifaMax} onChange={e => setTarifaMax(e.target.value)}
                placeholder="S/ máx. por hora"
                className="w-full px-4 py-3 rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6667AB] text-sm">S/ /h</span>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => setSoloVerificadas(!soloVerificadas)}
                className={`w-10 h-5 rounded-full transition-colors relative ${soloVerificadas ? 'bg-[#F6A5C0]' : 'bg-[rgba(255,255,255,0.15)]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${soloVerificadas ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-xs text-[#F5D5E0] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Solo verificadas
              </span>
            </label>
            <button onClick={buscar}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#CC8DB3] hover:bg-[#b07a9a] text-[#210635] font-bold rounded-xl transition-all shadow-md hover:shadow-lg">
              <Search className="w-5 h-5" /> Buscar
            </button>
          </div>
        </motion.div>

        {/* Resultados */}
        {!loading && (
          <p className="text-[#6667AB] text-sm">
            Se encontraron <strong className="text-[#F5D5E0]">{count}</strong> cuidadoras compatibles con tus filtros
          </p>
        )}
        {loading && <p className="text-[#6667AB] text-sm">Buscando...</p>}

        {/* Listado */}
        <div className="space-y-4">
          {cuidadoras.map((c, i) => {
            const compatibilidad = matching.find(m => m.cuidadoraId === c.Id)?.compatibilidad || c.Compatibilidad || 0;
            return (
            <motion.div key={c.Id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-3xl overflow-hidden">
              <div className="h-1.5 bg-[#f6a5c0]"></div>
              <div className="p-6 flex flex-col sm:flex-row items-start gap-5">
                <div className={`w-16 h-16 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
                  {getIniciales(c.Nombres, c.Apellidos)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{c.Nombres} {c.Apellidos?.charAt(0)}.</h3>
                    {compatibilidad > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-linear-to-r from-[#7B337E] to-[#F6A5C0] text-white">
                        {compatibilidad}% Compatibilidad Clínica
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#6667AB] mt-0.5">{c.Especialidades || 'Cuidado general'} · {c.AniosExperiencia} años exp.</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(j => (
                      <Star key={j} className={`w-4 h-4 ${j <= Math.round(c.CalificacionPromedio) ? 'text-[#CC8DB3] fill-[#CC8DB3]' : 'text-gray-200'}`} />
                    ))}
                    <span className="text-sm text-[#6667AB] ml-1">{(c.CalificacionPromedio ?? 0).toFixed(1)}</span>
                  </div>
                  <p className="text-lg font-bold text-[#F6A5C0] mt-2">S/ {c.TarifaHora}/h</p>
                </div>
                <div className="self-end sm:self-center flex-shrink-0 flex flex-col gap-2">
                  <button onClick={() => abrirPerfil(c)} className="px-6 py-2.5 bg-[#F6A5C0] hover:bg-[#CC8DB3] text-[#210635] font-bold rounded-full transition-all shadow-md hover:shadow-lg text-sm">
                    Ver perfil
                  </button>
                  <button onClick={() => setDocPreviewCuidadora(c)}
                    className="px-6 py-2 rounded-full border border-[rgba(255,255,255,0.2)] text-[#F5D5E0]/70 hover:text-white hover:border-white/40 text-xs font-bold transition-all"
                  >
                    <Eye className="w-3 h-3 inline mr-1" /> Ver Documentos
                  </button>
                </div>
              </div>
            </motion.div>
          )})}
        </div>
      </div>

      {/* Modal de perfil completo */}
      <AnimatePresence>
        {selectedNana && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setSelectedNana(null); setPerfilCompleto(null); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="h-1.5 bg-[#f6a5c0]"></div>
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#CC8DB3] to-[#F6A5C0] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {getIniciales(selectedNana.Nombres, selectedNana.Apellidos)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedNana.Nombres} {selectedNana.Apellidos}</h3>
                      <p className="text-sm text-[#6667AB]">{perfilCompleto?.especialidades?.map((e: any) => e.Nombre).join(' · ') || selectedNana.Especialidades || 'Cuidado general'}</p>
                      {perfilCompleto?.verificado ? (
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[rgba(16,185,129,0.2)] text-[#6EE7B7] text-xs font-bold mt-1">
                          <CheckCircle className="w-3 h-3" /> Perfil Verificado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[rgba(234,179,8,0.2)] text-[#FACC15] text-xs font-bold mt-1">
                          Pendiente de verificación
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => { setSelectedNana(null); setPerfilCompleto(null); }} className="p-1.5 hover:bg-[rgba(33,6,53,0.4)] rounded-lg transition-colors">
                    <X className="w-5 h-5 text-[#6667AB]" />
                  </button>
                </div>

                {cargandoPerfil ? (
                  <p className="text-[#6667AB] text-center py-8">Cargando perfil...</p>
                ) : perfilCompleto && (
                  <div className="space-y-6">

                    {/* Stats rápidas */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-white">{selectedNana.AniosExperiencia}</p>
                        <p className="text-xs text-[#6667AB]">Años exp.</p>
                      </div>
                      <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-[#F6A5C0]">S/ {selectedNana.TarifaHora}</p>
                        <p className="text-xs text-[#6667AB]">Tarifa /h</p>
                      </div>
                      <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-white">{perfilCompleto.serviciosCompletados}</p>
                        <p className="text-xs text-[#6667AB]">Servicios</p>
                      </div>
                      <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-3 text-center">
<p className="text-2xl font-bold text-white">{(selectedNana.CalificacionPromedio ?? 0).toFixed(1)}</p>
                         <p className="text-xs text-[#6667AB]">Calificación</p>
                      </div>
                    </div>

                    {/* Biografía */}
                    {perfilCompleto.cuidadora?.DescripcionCorta && (
                      <div>
                        <h4 className="text-sm font-bold text-[#F5D5E0] mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#CC8DB3]" /> Sobre mí
                        </h4>
                        <p className="text-sm text-[#6667AB] leading-relaxed">{perfilCompleto.cuidadora.DescripcionCorta}</p>
                      </div>
                    )}

                    {/* Especialidades */}
                    {perfilCompleto.especialidades?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-[#F5D5E0] mb-2 flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#CC8DB3]" /> Especialidades
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {perfilCompleto.especialidades.map((e: any, i: number) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-[rgba(204,141,179,0.2)] text-[#CC8DB3] text-xs font-semibold">{e.Nombre}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Áreas de cobertura */}
                    {perfilCompleto.cuidadora?.Zona && (
                      <div>
                        <h4 className="text-sm font-bold text-[#F5D5E0] mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#CC8DB3]" /> Zona de cobertura
                        </h4>
                        <p className="text-sm text-white">{perfilCompleto.cuidadora.Zona}</p>
                      </div>
                    )}
                    {perfilCompleto.areas?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {perfilCompleto.areas.map((a: any, i: number) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-[rgba(33,6,53,0.4)] text-[#F5D5E0] text-xs">{a.Nombre}</span>
                        ))}
                      </div>
                    )}

                    {/* Formación académica */}
                    {perfilCompleto.formacion?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-[#F5D5E0] mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#CC8DB3]" /> Formación académica
                        </h4>
                        <div className="space-y-2">
                          {perfilCompleto.formacion.map((f: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 bg-[rgba(33,6,53,0.3)] rounded-xl p-3">
                              <div className="w-8 h-8 rounded-full bg-[rgba(204,141,179,0.2)] flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-4 h-4 text-[#CC8DB3]" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{f.Titulo}</p>
                                <p className="text-xs text-[#6667AB]">{f.Institucion} · {f.AnioObtencion}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certificaciones */}
                    {perfilCompleto.certificaciones?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-[#F5D5E0] mb-3 flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#CC8DB3]" /> Certificaciones
                        </h4>
                        <div className="space-y-2">
                          {perfilCompleto.certificaciones.map((c: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 bg-[rgba(33,6,53,0.3)] rounded-xl p-3">
                              <div className="w-8 h-8 rounded-full bg-[rgba(204,141,179,0.2)] flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-[#CC8DB3]" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{c.Nombre}</p>
                                <p className="text-xs text-[#6667AB]">{c.EntidadEmisora}{c.FechaObtencion ? ` · ${c.FechaObtencion}` : ''}{c.FechaVencimiento ? ` · vence: ${c.FechaVencimiento}` : ''}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documentos verificados */}
                    {perfilCompleto.documentos?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-[#F5D5E0] mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#CC8DB3]" /> Documentos
                        </h4>
                        <div className="space-y-1.5">
                          {perfilCompleto.documentos.map((d: any, i: number) => (
                            <div key={i} className="flex items-center justify-between bg-[rgba(33,6,53,0.3)] rounded-lg px-3 py-2">
                              <span className="text-sm text-[#F5D5E0]">{d.TipoRequisito}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                d.Estado === 'Aprobado' ? 'bg-[rgba(16,185,129,0.2)] text-[#6EE7B7]' :
                                d.Estado === 'Rechazado' ? 'bg-[rgba(239,68,68,0.2)] text-[#FCA5A5]' :
                                'bg-[rgba(234,179,8,0.2)] text-[#FACC15]'
                              }`}>{d.Estado}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reseñas */}
                    {perfilCompleto.resenas?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-[#F5D5E0] mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-[#CC8DB3]" /> Reseñas ({perfilCompleto.resenas.length})
                        </h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {perfilCompleto.resenas.map((r: any, i: number) => (
                            <div key={i} className="bg-[rgba(33,6,53,0.3)] rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-white">{r.Nombres} {r.Apellidos?.charAt(0)}.</span>
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map(j => (
                                    <Star key={j} className={`w-3 h-3 ${j <= r.Calificacion ? 'text-[#CC8DB3] fill-[#CC8DB3]' : 'text-[#6667AB]'}`} />
                                  ))}
                                </div>
                              </div>
                              {r.Comentario && <p className="text-xs text-[#6667AB] leading-relaxed">"{r.Comentario}"</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Rating bar */}
                {perfilCompleto && (
                  <div className="mt-3 flex items-center gap-2 border-t border-[rgba(255,255,255,0.1)] pt-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(j => (
                        <Star key={j} className={`w-4 h-4 ${j <= Math.round(selectedNana.CalificacionPromedio) ? 'text-[#CC8DB3] fill-[#CC8DB3]' : 'text-[#6667AB]'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-[#6667AB]">{(selectedNana.CalificacionPromedio ?? 0).toFixed(1)} · {selectedNana.TotalResenas} reseñas</span>
                  </div>
                )}

                <div className="mt-6">
                <button
                  onClick={() => { setSelectedNana(null); setPerfilCompleto(null); setTimeout(() => setShowOptions(selectedNana), 200); }}
                  className="w-full py-3 bg-[#CC8DB3] hover:bg-[#b07a9a] text-[#210635] font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
                >
                  Solicitar Servicio
                </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Casos de Éxito */}
      {!inline && exitos.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 mt-16 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-6 h-6 text-[#CC8DB3]" />
            <h2 className="text-2xl font-bold text-white">Casos de Éxito</h2>
            <p className="text-[#6667AB] text-sm">Familias que encontraron a la cuidadora perfecta</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exitos.slice(0, 6).map((c) => (
              <motion.div
                key={c.Id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6 relative"
              >
                <Quote className="w-8 h-8 text-[rgba(246,165,192,0.3)] absolute top-4 right-4" />
                <h3 className="font-bold text-white text-base mb-3 pr-8">{c.Titulo}</h3>
                <p className="text-sm text-[#6667AB] leading-relaxed">{c.Descripcion}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {showOptions && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#210635] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-1">¿Qué deseas hacer?</h3>
              <p className="text-xs text-[#6667AB] mb-5">Elige cómo quieres proceder con {showOptions.Nombres} {showOptions.Apellidos}</p>

              <button onClick={() => { setShowOptions(null); setTimeout(() => setShowSchedule(showOptions), 300); }}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-[rgba(33,6,53,0.4)] border border-[rgba(255,255,255,0.08)] hover:border-[#F6A5C0]/50 hover:bg-[rgba(246,165,192,0.05)] transition-all text-left mb-3"
              >
                <div className="w-10 h-10 rounded-full bg-[rgba(246,165,192,0.15)] flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-[#F6A5C0]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">Agendar entrevista virtual</p>
                  <p className="text-[10px] text-[#6667AB] mt-0.5">Conoce a la cuidadora antes de contratar</p>
                </div>
              </button>

              <button onClick={() => { localStorage.setItem('preselectCuidadoraId', String(showOptions.Id)); localStorage.setItem('showCreateSolicitud', 'true'); setShowOptions(null); if (onNavigate) onNavigate('familia'); else window.location.href = '/familia'; }}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-[rgba(33,6,53,0.4)] border border-[rgba(255,255,255,0.08)] hover:border-[#F6A5C0]/50 hover:bg-[rgba(246,165,192,0.05)] transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[rgba(246,165,192,0.15)] flex items-center justify-center shrink-0">
                  <FileSignature className="w-5 h-5 text-[#F6A5C0]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">Crear solicitud directa</p>
                  <p className="text-[10px] text-[#6667AB] mt-0.5">Selecciona tareas, horario y envía la solicitud</p>
                </div>
              </button>

              <button onClick={() => setShowOptions(null)}
                className="w-full mt-4 py-2 text-xs text-[#6667AB] hover:text-white transition-colors text-center"
              >Cancelar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSchedule && (
          <ScheduleInterviewModal cuidadora={showSchedule} userId={user!.id} onClose={() => setShowSchedule(null)} />
        )}
      </AnimatePresence>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {docPreviewCuidadora && (
          <DocumentPreviewModal
            isOpen={true}
            onClose={() => setDocPreviewCuidadora(null)}
            cuidadoraId={docPreviewCuidadora.Id}
          />
        )}
      </AnimatePresence>
    </>
  );

  if (inline) return content;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {content}
      </div>
    </div>
  );
}
