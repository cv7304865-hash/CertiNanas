import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { LogOut, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Solicitud = {
  Id: number; FechaServicio: string; TotalHoras: number; TarifaHora: number;
  Total: number; Estado: string; HoraInicio: string; HoraFin: string;
  CuidadoraId: number; CuidadoraNombres: string; CuidadoraApellidos: string;
  MenorNombre: string | null; MenorDiagnostico: string | null;
};

const badgeClass: Record<string, string> = {
  Pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
  Confirmada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'En curso': 'bg-blue-50 text-blue-700 border-blue-200',
  Finalizada: 'bg-teal-50 text-teal-700 border-teal-200',
  Cancelada: 'bg-red-50 text-red-700 border-red-200',
};

export function FamilyPanel({ onNavigate, onViewContract }: { onNavigate?: (v: string) => void; onViewContract?: (id: number) => void }) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-[#1E293B] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 overflow-hidden rounded">
                  <img src="/logo.png" alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-lg font-extrabold text-[#F59E0B] tracking-tight">CERTINANAS</span>
              </div>
              <span className="text-white/40 text-xl font-light hidden sm:inline">|</span>
              <span className="text-white/60 text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
            </div>
            <nav className="flex items-center gap-6">
              <button onClick={() => onNavigate?.('search')} className="text-sm text-white/70 hover:text-white transition-colors">Inicio</button>
              <button onClick={() => onNavigate?.('familia')} className="text-sm font-bold text-[#F59E0B] border-b-2 border-[#F59E0B] pb-0.5">Mis Servicios</button>
              <button className="text-sm text-white/70 hover:text-white transition-colors">Mensajes</button>
              <div className="w-9 h-9 rounded-full bg-[#F59E0B]/20 flex items-center justify-center text-sm font-bold text-[#F59E0B] ml-2">
                {user?.nombres?.charAt(0) || 'F'}
              </div>
              <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-white/60" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis solicitudes de servicio</h1>

        {loading ? (
          <p className="text-gray-500 text-sm">Cargando...</p>
        ) : solicitudes.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tienes solicitudes de servicio aún.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cuidadora</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Menor</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Horario</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map(s => (
                    <motion.tr
                      key={s.Id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-b border-gray-50 transition-colors ${s.Estado === 'Confirmada' ? 'bg-amber-50/40' : 'hover:bg-gray-50/60'}`}
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{s.CuidadoraNombres} {s.CuidadoraApellidos?.charAt(0)}.</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {s.MenorNombre}
                        {s.MenorDiagnostico && <span className="text-gray-400"> ({s.MenorDiagnostico})</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatFecha(s.FechaServicio)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{s.HoraInicio || '--'}-{s.HoraFin || '--'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">S/ {s.Total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${badgeClass[s.Estado] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {s.Estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onViewContract?.(s.Id)}
                          className="text-xs font-semibold text-[#F59E0B] hover:text-[#D97706] transition-colors"
                        >
                          Ver contrato
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
