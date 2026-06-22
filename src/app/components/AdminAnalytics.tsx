import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Clock, Users,
  Activity, CheckCircle, XCircle, RefreshCw, Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type DashboardData = {
  serviciosActivos: number;
  serviciosCompletados: number;
  serviciosCancelados: number;
  ingresosTotales: number;
  comisionesTotales: number;
  escrowTotal: number;
  tiempoPromedioRespuesta: number;
  tasaCancelaciones: number;
  recontrataciones: number;
  serviciosPorSemana: number[];
  serviciosPorMes: number[];
};

export function AdminAnalytics() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [data, setData] = useState<DashboardData | null>(null);
  const [demanda, setDemanda] = useState<{ semana: string; prediccion: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics/dashboard', { headers }).then(r => r.json()).catch(() => null),
      fetch('/api/analytics/prediccion-demanda', { headers }).then(r => r.json()).catch(() => null),
    ]).then(([d, p]) => {
      if (d) setData(d);
      if (p) setDemanda(p);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto text-center py-16">
        <Clock className="w-8 h-8 text-[#6667AB] mx-auto mb-2 animate-spin" />
        <p className="text-sm text-[#6667AB]">Cargando analítica...</p>
      </div>
    );
  }

  const metrics = [
    { label: 'Servicios Activos', value: data?.serviciosActivos ?? 0, icon: Activity, color: 'text-[#CC8DB3]' },
    { label: 'Completados', value: data?.serviciosCompletados ?? 0, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Cancelados', value: data?.serviciosCancelados ?? 0, icon: XCircle, color: 'text-red-400' },
  ];

  const financial = [
    { label: 'Ingresos Totales', value: `S/ ${(data?.ingresosTotales ?? 0).toFixed(2)}`, icon: DollarSign, color: 'text-[#F6A5C0]' },
    { label: 'Comisiones', value: `S/ ${(data?.comisionesTotales ?? 0).toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Escrow', value: `S/ ${(data?.escrowTotal ?? 0).toFixed(2)}`, icon: DollarSign, color: 'text-amber-400' },
  ];

  const quality = [
    { label: 'Tiempo Prom. Respuesta', value: `${(data?.tiempoPromedioRespuesta ?? 0).toFixed(1)}h`, icon: Clock, color: 'text-[#CC8DB3]' },
    { label: 'Tasa Cancelaciones', value: `${((data?.tasaCancelaciones ?? 0) * 100).toFixed(1)}%`, icon: TrendingDown, color: data?.tasaCancelaciones && data.tasaCancelaciones > 0.1 ? 'text-red-400' : 'text-emerald-400' },
    { label: 'Recontrataciones', value: data?.recontrataciones ?? 0, icon: RefreshCw, color: 'text-[#F6A5C0]' },
  ];

  const maxSemana = data?.serviciosPorSemana ? Math.max(...data.serviciosPorSemana, 1) : 1;
  const maxMes = data?.serviciosPorMes ? Math.max(...data.serviciosPorMes, 1) : 1;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-[#F6A5C0]" />
        <h1 className="text-2xl font-extrabold text-white">Analítica</h1>
      </div>

      <div>
        <h2 className="font-bold text-white text-sm mb-3">Métricas Clave</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <m.icon className={`w-6 h-6 ${m.color}`} />
              </div>
              <p className={`text-2xl font-extrabold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-[#6667AB] mt-1">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-bold text-white text-sm mb-3">Resumen Financiero</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {financial.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <m.icon className={`w-6 h-6 ${m.color}`} />
              </div>
              <p className={`text-2xl font-extrabold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-[#6667AB] mt-1">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-bold text-white text-sm mb-3">Calidad</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quality.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.6 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <m.icon className={`w-6 h-6 ${m.color}`} />
              </div>
              <p className={`text-2xl font-extrabold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-[#6667AB] mt-1">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#F6A5C0]" />
            <h3 className="font-bold text-white">Servicios por Semana</h3>
          </div>
          {data?.serviciosPorSemana ? (
            <div className="flex items-end gap-2 h-40">
              {data.serviciosPorSemana.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(v / maxSemana) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="w-full rounded-t-lg bg-linear-to-t from-[#7B337E] to-[#CC8DB3]"
                    style={{ minHeight: v > 0 ? '4px' : '0' }}
                  />
                  <span className="text-[10px] text-[#6667AB]">S{i + 1}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6667AB] text-center py-8">Sin datos semanales</p>
          )}
        </div>

        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#F6A5C0]" />
            <h3 className="font-bold text-white">Servicios por Mes</h3>
          </div>
          {data?.serviciosPorMes ? (
            <div className="flex items-end gap-2 h-40">
              {data.serviciosPorMes.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(v / maxMes) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="w-full rounded-t-lg bg-linear-to-t from-[#7B337E] to-[#F6A5C0]"
                    style={{ minHeight: v > 0 ? '4px' : '0' }}
                  />
                  <span className="text-[10px] text-[#6667AB]">{'EneFebMarAbrMayJunJulAgoSepOctNovDec'.match(/.../g)?.[i] || `M${i + 1}`}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6667AB] text-center py-8">Sin datos mensuales</p>
          )}
        </div>
      </div>

      {demanda.length > 0 && (
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#F6A5C0]" />
            <h3 className="font-bold text-white">Predicción de Demanda</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {demanda.map((d, i) => (
              <div key={i} className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4 text-center">
                <p className="text-xs text-[#6667AB]">{d.semana}</p>
                <p className="text-xl font-extrabold text-white mt-1">{d.prediccion}</p>
                <p className="text-[10px] text-[#6667AB]">servicios estimados</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
