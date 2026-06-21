import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { LogOut, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';
import { MinorsSection } from './MinorsSection';

type Solicitud = {
  Id: number; FechaServicio: string; TotalHoras: number; TarifaHora: number;
  Total: number; Estado: string; HoraInicio: string; HoraFin: string;
  CuidadoraId: number; CuidadoraNombres: string; CuidadoraApellidos: string;
  MenorNombre: string | null; MenorDiagnostico: string | null;
};

const statusLabel: Record<string, string> = {
  Pendiente: 'Pendiente',
  Confirmada: 'Confirmada',
  'En curso': 'En curso',
  Finalizada: 'Pagado',
  Completada: 'Pagado',
  Pagada: 'Pagado',
  Cancelada: 'Cancelada',
};

const badgeClass: Record<string, string> = {
  Pendiente: 'bg-[#f6a5c0] text-white',
  Confirmada: 'bg-[#cc8db3] text-white',
  'En curso': 'bg-[#9d85b6] text-white',
  Finalizada: 'bg-emerald-500 text-white',
  Completada: 'bg-emerald-500 text-white',
  Pagada: 'bg-emerald-500 text-white',
  Cancelada: 'bg-[#cc8db3] text-white',
};

export function FamilyPanel({ onNavigate, onViewContract, onReview }: { onNavigate?: (v: string) => void; onViewContract?: (id: number) => void; onReview?: (id: number) => void }) {
  const { user, logout } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/familia/solicitudes', { headers: { 'x-user-id': String(user?.id) } })
      .then(r => r.json())
      .then(data => { setSolicitudes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatFecha = (f: string) => {
    const d = new Date(f + 'T00:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
      {/* Navbar */}
      <header className="bg-[#210635]/80 backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.1)] text-white sticky top-0 z-40 shadow-lg shadow-black/30">
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
              <button onClick={() => onNavigate?.('search')} className="text-sm text-[#F5D5E0]/70 hover:text-white transition-colors">Inicio</button>
              <button onClick={() => onNavigate?.('familia')} className="text-sm font-bold text-[#f6a5c0] border-b-2 border-[#f6a5c0] pb-0.5">Mis Servicios</button>
              <button onClick={() => onNavigate?.('messages')} className="text-sm text-[#F5D5E0]/70 hover:text-white transition-colors">Mensajes</button>
              <ProfileAvatar size={36} className="ml-2" />
              <button onClick={logout} className="p-2 hover:bg-[rgba(33,6,53,0.4)] rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-[#6667AB]" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <MinorsSection />

        <section>
          <h1 className="text-2xl font-bold text-white mb-6">Mis solicitudes de servicio</h1>

          {loading ? (
            <p className="text-[#6667AB] text-sm">Cargando...</p>
          ) : solicitudes.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-[#6667AB] mx-auto mb-3" />
              <p className="text-[#6667AB]">No tienes solicitudes de servicio aún.</p>
            </div>
          ) : (
            <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[rgba(33,6,53,0.4)] border-b border-[rgba(255,255,255,0.1)]">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[#6667AB] uppercase tracking-wider">Cuidadora</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[#6667AB] uppercase tracking-wider">Menor</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[#6667AB] uppercase tracking-wider">Fecha</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[#6667AB] uppercase tracking-wider">Horario</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[#6667AB] uppercase tracking-wider">Monto</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[#6667AB] uppercase tracking-wider">Estado</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-[#6667AB] uppercase tracking-wider">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((s) => (
                      <motion.tr
                        key={s.Id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-[rgba(255,255,255,0.1)] transition-colors hover:bg-[rgba(33,6,53,0.3)]"
                      >
                        <td className="px-6 py-4">
                          <span className="font-semibold text-white">{s.CuidadoraNombres} {s.CuidadoraApellidos?.charAt(0)}.</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#F5D5E0]/70">
                          {s.MenorNombre}
                          {s.MenorDiagnostico && <span className="text-[#6667AB]"> ({s.MenorDiagnostico})</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#F5D5E0]/70">{formatFecha(s.FechaServicio)}</td>
                        <td className="px-6 py-4 text-sm text-[#F5D5E0]/70 font-mono">{s.HoraInicio || '--'}-{s.HoraFin || '--'}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-white">S/ {s.Total.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${badgeClass[s.Estado] || 'bg-[#f6a5c0] text-white'}`}>
                            {statusLabel[s.Estado] || s.Estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {s.Estado === 'Finalizada' && (
                              <button onClick={() => onReview?.(s.Id)}
                                className="text-xs font-semibold text-[#F5D5E0]/70 hover:text-white transition-colors">
                                Evaluar
                              </button>
                            )}
                            <button onClick={() => onViewContract?.(s.Id)}
                              className="text-xs font-semibold text-[#F6A5C0] hover:text-[#CC8DB3] transition-colors">
                              Ver contrato
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
