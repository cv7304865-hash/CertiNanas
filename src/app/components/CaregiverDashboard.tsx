import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Briefcase, Star, RefreshCw, TrendingUp, Wallet, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type DashboardStats = {
  serviciosCompletados: number;
  calificacionPromedio: number;
  recontrataciones: number;
  nivelReputacion: string;
  ingresosTotales: number;
};

export function CaregiverDashboard() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cuidadora/stats', { headers })
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => setStats({
        serviciosCompletados: 0,
        calificacionPromedio: 0,
        recontrataciones: 0,
        nivelReputacion: 'Principiante',
        ingresosTotales: 0,
      }))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Servicios Completados', value: stats.serviciosCompletados.toString(), icon: Briefcase },
    { label: 'Calificación Promedio', value: stats.calificacionPromedio.toFixed(1), icon: Star },
    { label: 'Recontrataciones', value: stats.recontrataciones.toString(), icon: RefreshCw },
    { label: 'Nivel de Reputación', value: stats.nivelReputacion, icon: Award },
    { label: 'Ingresos Totales', value: `S/ ${stats.ingresosTotales.toFixed(2)}`, icon: Wallet },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[rgba(246,165,192,0.2)] flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-[#F6A5C0]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Mi Dashboard</h1>
          <p className="text-sm text-[#6667AB]">Resumen de tu actividad como cuidadora</p>
        </div>
      </div>

      {loading ? (
        <div className="text-[#6667AB] text-sm">Cargando estadísticas...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-[rgba(246,165,192,0.15)] flex items-center justify-center mb-4">
                <card.icon className="w-5.5 h-5.5 text-[#F6A5C0]" />
              </div>
              <p className="text-xs font-medium text-[#F5D5E0]/60 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold text-white mt-1.5">{card.value}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
