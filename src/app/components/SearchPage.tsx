import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Search, Star, LogOut, X, CheckCircle, Heart, Quote } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';

type CuidadoraCard = {
  Id: number; IdUsuario: number; AniosExperiencia: number; TarifaHora: number;
  CalificacionPromedio: number; TotalResenas: number;
  Nombres: string; Apellidos: string; Email: string;
  Especialidades: string;
};

const zonas = ['Todas', 'Trujillo Centro', 'Víctor Larco', 'La Esperanza', 'Moche', 'Buenos Aires'];
const especialidadesList = ['Todas', 'TEA', 'TDAH', 'Sindrome de Down', 'Primeros Auxilios', 'Discapacidad Motriz'];
const expOptions = ['0+ años', '1+ años', '3+ años', '5+ años', '10+ años'];

const COLORS = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500'];

type CasoExito = {
  Id: number; Titulo: string; Descripcion: string; FechaCreacion: string;
  Nombres: string; Apellidos: string;
};

export function SearchPage({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const { user, logout } = useAuth();
  const [cuidadoras, setCuidadoras] = useState<CuidadoraCard[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [especialidad, setEspecialidad] = useState('Todas');
  const [zona, setZona] = useState('Todas');
  const [experiencia, setExperiencia] = useState('0+ años');
  const [tarifaMax, setTarifaMax] = useState('100');
  const [selectedNana, setSelectedNana] = useState<CuidadoraCard | null>(null);
  const [showSchedule, setShowSchedule] = useState<CuidadoraCard | null>(null);
  const [exitos, setExitos] = useState<CasoExito[]>([]);

  const buscar = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (especialidad && especialidad !== 'Todas') params.set('especialidad', especialidad);
      if (zona && zona !== 'Todas') params.set('zona', zona);
      if (experiencia && experiencia !== '0+ años') params.set('experiencia', experiencia.replace('+ años', ''));
      if (tarifaMax) params.set('tarifa_max', tarifaMax);
      const r = await fetch(`/api/search/cuidadoras?${params}`);
      const data = await r.json();
      setCuidadoras(data);
      setCount(data.length);
    } catch { setCuidadoras([]); setCount(0); }
    setLoading(false);
  };

  useEffect(() => { buscar(); }, []);

  useEffect(() => {
    fetch('/api/casos/exito').then(r => r.json()).then(setExitos).catch(() => {});
  }, []);

  const getIniciales = (n: string, a: string) => {
    const names = n?.split(' ');
    return `${names?.[0]?.charAt(0) || ''}${a?.charAt(0) || ''}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
      {/* Navbar */}
      <header className="bg-[#210635]/80 backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.1)] text-white sticky top-0 z-40">
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
              <button onClick={() => onNavigate?.('search')} className="text-sm font-bold text-[#f6a5c0] border-b-2 border-[#f6a5c0] pb-0.5">Inicio</button>
              <button onClick={() => onNavigate?.('familia')} className="text-sm text-[#F5D5E0]/70 hover:text-white transition-colors">Mis Servicios</button>
              <button onClick={() => onNavigate?.('messages')} className="text-sm text-[#F5D5E0]/70 hover:text-white transition-colors">Mensajes</button>
              <ProfileAvatar size={36} className="ml-2" />
              <button onClick={logout} className="p-2 hover:bg-[rgba(33,6,53,0.4)] rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-[#6667AB]" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
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
          <div className="mt-5">
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
          {cuidadoras.map((c, i) => (
            <motion.div key={c.Id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-3xl overflow-hidden">
              <div className="h-1.5 bg-[#f6a5c0]"></div>
              <div className="p-6 flex flex-col sm:flex-row items-start gap-5">
                <div className={`w-16 h-16 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
                  {getIniciales(c.Nombres, c.Apellidos)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white">{c.Nombres} {c.Apellidos?.charAt(0)}.</h3>
                  <p className="text-sm text-[#6667AB] mt-0.5">{c.Especialidades || 'Cuidado general'} · {c.AniosExperiencia} años exp.</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(j => (
                      <Star key={j} className={`w-4 h-4 ${j <= Math.round(c.CalificacionPromedio) ? 'text-[#CC8DB3] fill-[#CC8DB3]' : 'text-gray-200'}`} />
                    ))}
                    <span className="text-sm text-[#6667AB] ml-1">{c.CalificacionPromedio.toFixed(1)}</span>
                  </div>
                  <p className="text-lg font-bold text-[#F6A5C0] mt-2">S/ {c.TarifaHora}/h</p>
                </div>
                <div className="self-end sm:self-center flex-shrink-0">
                  <button onClick={() => setSelectedNana(c)} className="px-6 py-2.5 bg-[#F6A5C0] hover:bg-[#CC8DB3] text-[#210635] font-bold rounded-full transition-all shadow-md hover:shadow-lg text-sm">
                    Ver perfil
                  </button>
                </div>
              </div>
              </motion.div>
          ))}
        </div>
      </div>

      {/* Modal de perfil */}
      <AnimatePresence>
        {selectedNana && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedNana(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="h-1.5 bg-[#f6a5c0]"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold`}>
                      {getIniciales(selectedNana.Nombres, selectedNana.Apellidos)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedNana.Nombres} {selectedNana.Apellidos?.charAt(0)}.</h3>
                      <p className="text-sm text-[#6667AB]">{selectedNana.Especialidades || 'Cuidado general'}</p>
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#F5D5E0] text-[#210635] text-xs font-bold mt-1">
                        <CheckCircle className="w-3 h-3" /> Perfil Verificado
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedNana(null)} className="p-1.5 hover:bg-[rgba(33,6,53,0.4)] rounded-lg transition-colors">
                    <X className="w-5 h-5 text-[#6667AB]" />
                  </button>
                </div>
                <div className="space-y-3 text-sm text-[#F5D5E0] border-t border-[rgba(255,255,255,0.1)] pt-4">
                  <div className="flex justify-between">
                    <span>Experiencia</span>
                    <span className="font-semibold text-white">{selectedNana.AniosExperiencia} años</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tarifa</span>
                    <span className="font-semibold text-[#F6A5C0]">S/ {selectedNana.TarifaHora}/h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Calificación</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(j => (
                        <Star key={j} className={`w-4 h-4 ${j <= Math.round(selectedNana.CalificacionPromedio) ? 'text-[#CC8DB3] fill-[#CC8DB3]' : 'text-gray-200'}`} />
                      ))}
                      <span className="ml-1 font-semibold text-white">{selectedNana.CalificacionPromedio.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                <button
                  onClick={() => { setSelectedNana(null); setTimeout(() => setShowSchedule(selectedNana), 200); }}
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

      {/* Casos de Éxito - Inspiración para familias */}
      {exitos.length > 0 && (
        <section className="mt-16 mb-8">
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
        {showSchedule && (
          <ScheduleInterviewModal cuidadora={showSchedule} onClose={() => setShowSchedule(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
