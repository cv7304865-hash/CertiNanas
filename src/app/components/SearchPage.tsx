import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Search, Star, LogOut, X, CheckCircle } from 'lucide-react';
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

  const getIniciales = (n: string, a: string) => {
    const names = n?.split(' ');
    return `${names?.[0]?.charAt(0) || ''}${a?.charAt(0) || ''}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7C2CA] via-[#9D85B6]/40 to-[#837AB6]/20">
      {/* Navbar */}
      <header className="bg-[#250e2c]/80 backdrop-blur-xl border-b border-white/10 text-white sticky top-0 z-40">
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
              <span className="text-white/60 text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
            </div>
            <nav className="flex items-center gap-6">
              <button onClick={() => onNavigate?.('search')} className="text-sm font-bold text-[#f6a5c0] border-b-2 border-[#f6a5c0] pb-0.5">Inicio</button>
              <button onClick={() => onNavigate?.('familia')} className="text-sm text-white/70 hover:text-white transition-colors">Mis Servicios</button>
              <button onClick={() => onNavigate?.('messages')} className="text-sm text-white/70 hover:text-white transition-colors">Mensajes</button>
              <ProfileAvatar size={36} className="ml-2" />
              <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-white/60" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Buscador */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/30 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Encuentra la cuidadora ideal para tu hijo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select value={especialidad} onChange={e => setEspecialidad(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/30 backdrop-blur-sm text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc8db3] focus:bg-white/50">
              {especialidadesList.map(e => <option key={e} value={e}>{e === 'Todas' ? 'Todas las especialidades' : e}</option>)}
            </select>
            <select value={zona} onChange={e => setZona(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/30 backdrop-blur-sm text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc8db3] focus:bg-white/50">
              {zonas.map(z => <option key={z} value={z}>{z === 'Todas' ? 'Todas las zonas' : z}</option>)}
            </select>
            <select value={experiencia} onChange={e => setExperiencia(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/30 backdrop-blur-sm text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc8db3] focus:bg-white/50">
              {expOptions.map(e => <option key={e} value={e}>{e === '0+ años' ? 'Sin experiencia' : e}</option>)}
            </select>
            <div className="relative">
              <input type="number" value={tarifaMax} onChange={e => setTarifaMax(e.target.value)}
                placeholder="S/ máx. por hora"
                className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/30 backdrop-blur-sm text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc8db3] focus:bg-white/50" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">S/ /h</span>
            </div>
          </div>
          <div className="mt-5">
            <button onClick={buscar}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#cc8db3] hover:bg-[#b07a9a] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg">
              <Search className="w-5 h-5" /> Buscar
            </button>
          </div>
        </motion.div>

        {/* Resultados */}
        {!loading && (
          <p className="text-gray-500 text-sm">
            Se encontraron <strong className="text-gray-700">{count}</strong> cuidadoras compatibles con tus filtros
          </p>
        )}
        {loading && <p className="text-gray-500 text-sm">Buscando...</p>}

        {/* Listado */}
        <div className="space-y-4">
          {cuidadoras.map((c, i) => (
            <motion.div key={c.Id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white/30 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-3xl overflow-hidden">
              <div className="h-1.5 bg-[#f6a5c0]"></div>
              <div className="p-6 flex flex-col sm:flex-row items-start gap-5">
                <div className={`w-16 h-16 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
                  {getIniciales(c.Nombres, c.Apellidos)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">{c.Nombres} {c.Apellidos?.charAt(0)}.</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{c.Especialidades || 'Cuidado general'} · {c.AniosExperiencia} años exp.</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(j => (
                      <Star key={j} className={`w-4 h-4 ${j <= Math.round(c.CalificacionPromedio) ? 'text-[#cc8db3] fill-[#cc8db3]' : 'text-gray-200'}`} />
                    ))}
                    <span className="text-sm text-gray-500 ml-1">{c.CalificacionPromedio.toFixed(1)}</span>
                  </div>
                  <p className="text-lg font-bold text-[#cc8db3] mt-2">S/ {c.TarifaHora}/h</p>
                </div>
                <div className="self-end sm:self-center flex-shrink-0">
                  <button onClick={() => setSelectedNana(c)} className="px-6 py-2.5 bg-[#f6a5c0] hover:bg-[#cc8db3] text-white font-bold rounded-full transition-all shadow-md hover:shadow-lg text-sm">
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
              className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="h-1.5 bg-[#f6a5c0]"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold`}>
                      {getIniciales(selectedNana.Nombres, selectedNana.Apellidos)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedNana.Nombres} {selectedNana.Apellidos?.charAt(0)}.</h3>
                      <p className="text-sm text-gray-500">{selectedNana.Especialidades || 'Cuidado general'}</p>
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#f6a5c0] text-white text-xs font-bold mt-1">
                        <CheckCircle className="w-3 h-3" /> Perfil Verificado
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedNana(null)} className="p-1.5 hover:bg-white/30 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="space-y-3 text-sm text-gray-600 border-t border-white/20 pt-4">
                  <div className="flex justify-between">
                    <span>Experiencia</span>
                    <span className="font-semibold text-gray-900">{selectedNana.AniosExperiencia} años</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tarifa</span>
                    <span className="font-semibold text-[#cc8db3]">S/ {selectedNana.TarifaHora}/h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Calificación</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(j => (
                        <Star key={j} className={`w-4 h-4 ${j <= Math.round(selectedNana.CalificacionPromedio) ? 'text-[#cc8db3] fill-[#cc8db3]' : 'text-gray-200'}`} />
                      ))}
                      <span className="ml-1 font-semibold text-gray-900">{selectedNana.CalificacionPromedio.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                <button
                  onClick={() => { setSelectedNana(null); setTimeout(() => setShowSchedule(selectedNana), 200); }}
                  className="w-full py-3 bg-[#cc8db3] hover:bg-[#b07a9a] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
                >
                  Solicitar Servicio
                </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSchedule && (
          <ScheduleInterviewModal cuidadora={showSchedule} onClose={() => setShowSchedule(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
