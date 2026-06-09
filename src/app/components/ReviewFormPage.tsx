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
      <div className="min-h-screen bg-[#f7c2ca]">
        <header className="bg-[#250e2c] text-white sticky top-0 z-40 shadow-lg">
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
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-[#9d85b6]/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#250e2c]" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Gracias por tu evaluación!</h2>
          <p className="text-gray-500 text-sm mb-8">Tu opinión ayuda a otras familias a encontrar la cuidadora ideal.</p>
          <button onClick={onBack} className="px-8 py-3 bg-[#cc8db3] hover:bg-[#b07a9a] text-white font-bold rounded-xl transition-all shadow-md">
            Volver a mis servicios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7c2ca]">
      <header className="bg-[#250e2c] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 overflow-hidden rounded"><img src="/logo.png" alt="" className="w-full h-full object-cover" /></div>
                <span className="text-lg font-extrabold text-[#f6a5c0] tracking-tight">CERTINANAS</span>
              </div>
              <span className="text-white/40 text-xl font-light hidden sm:inline">|</span>
              <span className="text-white/60 text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-1">
              <Star className="w-6 h-6 text-[#cc8db3]" />
              <h1 className="text-xl font-bold text-gray-900">Evaluar servicio</h1>
            </div>
            <p className="text-sm text-gray-400 ml-9">Tu opinión ayuda a otras familias</p>
          </div>

          {!data ? (
            <div className="px-6 sm:px-8 pb-8 animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="px-6 sm:px-8 space-y-6">
                {/* Tarjeta del servicio */}
                <div className="bg-[#9d85b6]/20 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#cc8db3] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {getIniciales(data.CuidadoraNombres, data.CuidadoraApellidos)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{data.CuidadoraNombres} {data.CuidadoraApellidos}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Servicio del {formatFecha(data.FechaServicio)}{data.MenorNombre ? ` · ${data.MenorNombre}${data.MenorDiagnostico ? ` (${data.MenorDiagnostico})` : ''}` : ''}
                    </p>
                  </div>
                </div>

                {/* Estrellas */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">Calificación</p>
                  <div className="flex justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button key={i} type="button"
                        onClick={() => setRating(i)}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star className={`w-8 h-8 ${i <= (hovered || rating) ? 'text-[#cc8db3] fill-[#cc8db3]' : 'text-gray-200'}`} />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{rating > 0 ? `${rating} de 5 estrellas` : 'Selecciona una puntuación'}</p>
                </div>

                {/* Comentario */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Comentario</label>
                  <textarea
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    placeholder="Cuenta tu experiencia con esta cuidadora..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc8db3]/40 resize-none"
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
                      ? 'bg-gradient-to-r from-[#837ab6] via-[#9d85b6] to-[#f6a5c0] text-white hover:shadow-lg cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
