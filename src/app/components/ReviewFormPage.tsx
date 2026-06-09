import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { LogOut, Star, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';

type OrdenData = {
  Id: number; FechaServicio: string; CuidadoraNombres: string; CuidadoraApellidos: string;
  MenorNombre: string | null; MenorDiagnostico: string | null; Estado: string;
};

export function ReviewFormPage({ orderId, onBack }: { orderId?: number; onBack?: () => void }) {
  const { user, logout } = useAuth();
  const [data, setData] = useState<OrdenData | null>(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comentario, setComentario] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/familia/solicitudes/${orderId}`, { headers: { 'x-user-id': String(user?.id) } })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  }, [orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    await fetch('/api/auth/resena', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) },
      body: JSON.stringify({ idOrden: orderId, calificacion: rating, comentario }),
    });
    setSubmitted(true);
  };

  const formatFecha = (f: string) => {
    const d = new Date(f + 'T00:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getIniciales = (n: string, a: string) => {
    const names = n?.split(' ');
    return `${names?.[0]?.charAt(0) || ''}${a?.charAt(0) || ''}`;
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
        <header className="bg-[#210635]/80 backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.1)] text-white sticky top-0 z-40 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 overflow-hidden rounded"><img src="/logo.png" alt="" className="w-full h-full object-cover" /></div>
                <span className="text-lg font-extrabold text-[#f6a5c0] tracking-tight">CERTINANAS</span>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#F5D5E0]" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Gracias por tu evaluación!</h2>
          <p className="text-[#6667AB] text-sm mb-8">Tu opinión ayuda a otras familias a encontrar la cuidadora ideal.</p>
          <button onClick={onBack} className="px-8 py-3 bg-[#F6A5C0] text-[#210635] font-bold rounded-xl transition-all shadow-md">
            Volver a mis servicios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
      <header className="bg-[#210635]/80 backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.1)] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 overflow-hidden rounded"><img src="/logo.png" alt="" className="w-full h-full object-cover" /></div>
                <span className="text-lg font-extrabold text-[#f6a5c0] tracking-tight">CERTINANAS</span>
              </div>
              <span className="text-white/40 text-xl font-light hidden sm:inline">|</span>
              <span className="text-[#6667AB] text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
            </div>
            <nav className="flex items-center gap-6">
              <button onClick={() => onBack?.()} className="text-sm text-white/70 hover:text-white transition-colors">Inicio</button>
              <button className="text-sm font-bold text-[#f6a5c0] border-b-2 border-[#f6a5c0] pb-0.5">Mis Servicios</button>
              <button className="text-sm text-white/70 hover:text-white transition-colors">Mensajes</button>
              <ProfileAvatar size={36} className="ml-2" />
              <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-white/60" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] rounded-2xl shadow-lg shadow-black/30 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-1">
              <Star className="w-6 h-6 text-[#CC8DB3]" />
              <h1 className="text-xl font-bold text-white">Evaluar servicio</h1>
            </div>
            <p className="text-sm text-[#6667AB] ml-9">Tu opinión ayuda a otras familias</p>
          </div>

          {!data ? (
            <div className="px-6 sm:px-8 pb-8 animate-pulse space-y-4">
              <div className="h-4 bg-[rgba(33,6,53,0.4)] rounded w-3/4"></div>
              <div className="h-4 bg-[rgba(33,6,53,0.4)] rounded w-1/2"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="px-6 sm:px-8 space-y-6">
                {/* Tarjeta del servicio */}
                <div className="bg-[rgba(33,6,53,0.5)] backdrop-blur-sm border border-[rgba(255,255,255,0.2)] rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#cc8db3] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {getIniciales(data.CuidadoraNombres, data.CuidadoraApellidos)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{data.CuidadoraNombres} {data.CuidadoraApellidos}</p>
                    <p className="text-xs text-[#6667AB] mt-0.5">
                      Servicio del {formatFecha(data.FechaServicio)}{data.MenorNombre ? ` · ${data.MenorNombre}${data.MenorDiagnostico ? ` (${data.MenorDiagnostico})` : ''}` : ''}
                    </p>
                  </div>
                </div>

                {/* Estrellas */}
                <div className="text-center">
                  <p className="text-sm text-[#6667AB] mb-3">Calificación</p>
                  <div className="flex justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button key={i} type="button"
                        onClick={() => setRating(i)}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star className={`w-8 h-8 ${i <= (hovered || rating) ? 'text-[#CC8DB3] fill-[#CC8DB3]' : 'text-[#6667AB]'}`} />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[#6667AB] mt-2">{rating > 0 ? `${rating} de 5 estrellas` : 'Selecciona una puntuación'}</p>
                </div>

                {/* Comentario */}
                <div>
                  <label className="block text-sm font-semibold text-[#F5D5E0] mb-1.5">Comentario</label>
                  <textarea
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    placeholder="Cuenta tu experiencia con esta cuidadora..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,225,0.3)] text-white placeholder:text-[#6667AB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] resize-none"
                  />
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-8 mt-6">
                <motion.button
                  whileHover={rating > 0 ? { scale: 1.01 } : {}}
                  whileTap={rating > 0 ? { scale: 0.99 } : {}}
                  type="submit"
                  disabled={rating === 0}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                    rating > 0
                      ? 'bg-[#F6A5C0] text-[#210635] hover:shadow-lg cursor-pointer'
                      : 'bg-[rgba(33,6,53,0.5)] text-[#6667AB] cursor-not-allowed'
                  }`}
                >
                  Publicar evaluación
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
