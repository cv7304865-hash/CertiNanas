import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Clock, Users,
  Activity, CheckCircle, XCircle, RefreshCw, Calendar, Sparkles,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

type DashboardData = {
  serviciosActivos: number;
  serviciosFinalizados: number;
  serviciosCancelados: number;
  ingresos: number;
  comisiones: number;
  fondosEscrow: number;
  tiempoRespuestaPromedio: number;
  tasaCancelaciones: number;
  recontrataciones: number;
  ordenesPorEstado: { Estado: string; count: number }[];
  ingresosPorMes: { mes: string; total: number }[];
  totalTransacciones: number;
  cuidadorasActivas: number;
  familiasRegistradas: number;
};

const COLORS = ['#F6A5C0', '#7B337E', '#CC8DB3', '#6667AB', '#F5D5E0', '#210635'];
const STATUS_COLORS: Record<string, string> = {
  Finalizada: '#10b981',
  Completada: '#10b981',
  Cancelada: '#ef4444',
  'En curso': '#8b5cf6',
  Pendiente: '#f59e0b',
  Confirmada: '#F6A5C0',
  Pagada: '#CC8DB3',
};

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatMes(mes: string) {
  const [, m] = mes.split('-');
  return MONTHS[parseInt(m, 10) - 1] || mes;
}

function formatSoles(n: number) {
  return `S/ ${n.toFixed(2)}`;
}

function CustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const RAD = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RAD);
  const y = cy + radius * Math.sin(-midAngle * RAD);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[rgba(33,6,53,0.9)] backdrop-blur-md border border-[rgba(255,255,255,0.2)] rounded-xl px-3 py-2 shadow-lg shadow-black/30">
      {label && <p className="text-xs text-[#F5D5E0] font-semibold mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs text-white" style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toLocaleString('es-PE') : p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function AdminAnalytics() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [data, setData] = useState<DashboardData | null>(null);
  const [prediccion, setPrediccion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics/dashboard', { headers }).then(r => r.json()).catch(() => null),
      fetch('/api/analytics/prediccion-demanda', { headers }).then(r => r.json()).catch(() => null),
    ]).then(([d, p]) => {
      if (d) setData(d);
      if (p) setPrediccion(p);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto text-center py-16">
        <div className="w-8 h-8 border-2 border-[#CC8DB3] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-[#6667AB]">Cargando analítica...</p>
      </div>
    );
  }

  const totalServicios = (data?.serviciosActivos ?? 0) + (data?.serviciosFinalizados ?? 0) + (data?.serviciosCancelados ?? 0);
  const pctActivos = totalServicios > 0 ? ((data?.serviciosActivos ?? 0) / totalServicios * 100) : 0;
  const pctCompletados = totalServicios > 0 ? ((data?.serviciosFinalizados ?? 0) / totalServicios * 100) : 0;
  const pctCancelados = totalServicios > 0 ? ((data?.serviciosCancelados ?? 0) / totalServicios * 100) : 0;

  const ordenesPie = (data?.ordenesPorEstado ?? []).map(o => ({ ...o, value: o.count }));
  const totalOrdenes = ordenesPie.reduce((s, o) => s + o.value, 0);

  const ingresosData = (data?.ingresosPorMes ?? []).map(o => ({ mes: formatMes(o.mes), ingresos: o.total }));
  const maxIngreso = Math.max(...ingresosData.map(d => d.ingresos), 1);

  const especialidadesData = (prediccion?.especialidadesDemanda ?? []).map((e: any) => ({ name: e.Nombre, value: e.total }));
  const maxEsp = Math.max(...especialidadesData.map(d => d.value), 1);

  const metricas = [
    {
      section: 'Métricas Clave',
      items: [
        { label: 'Servicios Activos', value: data?.serviciosActivos ?? 0, pct: pctActivos, icon: Activity, color: 'text-[#CC8DB3]' },
        { label: 'Completados', value: data?.serviciosFinalizados ?? 0, pct: pctCompletados, icon: CheckCircle, color: 'text-emerald-400' },
        { label: 'Cancelados', value: data?.serviciosCancelados ?? 0, pct: pctCancelados, icon: XCircle, color: 'text-red-400' },
      ],
    },
    {
      section: 'Resumen Financiero',
      items: [
        { label: 'Ingresos Totales', value: formatSoles(data?.ingresos ?? 0), icon: DollarSign, color: 'text-[#F6A5C0]' },
        { label: 'Comisiones', value: formatSoles(data?.comisiones ?? 0), icon: TrendingUp, color: 'text-emerald-400' },
        { label: 'Fondos en Escrow', value: formatSoles(data?.fondosEscrow ?? 0), icon: DollarSign, color: 'text-amber-400' },
      ],
    },
    {
      section: 'Calidad',
      items: [
        { label: 'Tiempo Prom. Respuesta', value: `${(data?.tiempoRespuestaPromedio ?? 0).toFixed(1)}h`, icon: Clock, color: 'text-[#CC8DB3]' },
        { label: 'Tasa Cancelaciones', value: `${(data?.tasaCancelaciones ?? 0).toFixed(1)}%`, icon: TrendingDown, color: (data?.tasaCancelaciones ?? 0) > 10 ? 'text-red-400' : 'text-emerald-400' },
        { label: 'Recontrataciones', value: `${data?.recontrataciones ?? 0}`, icon: RefreshCw, color: 'text-[#F6A5C0]' },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-[#F6A5C0]" />
        <h1 className="text-2xl font-extrabold text-white">Analítica</h1>
      </div>

      {metricas.map((group, gi) => (
        <div key={group.section}>
          <h2 className="font-bold text-white text-sm mb-3">{group.section}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {group.items.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (gi * 3 + i) * 0.08 }}
                className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <m.icon className={`w-6 h-6 ${m.color}`} />
                  {'pct' in m && typeof (m as any).pct === 'number' && (
                    <span className={`text-xs font-bold ${m.color}`}>{(m as any).pct.toFixed(1)}%</span>
                  )}
                </div>
                <p className={`text-2xl font-extrabold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-[#6667AB] mt-1">{m.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Chart row 1: Donut + Especialidades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie / Donut: Ordenes por Estado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#F6A5C0]" />
              <h3 className="font-bold text-white">Órdenes por Estado</h3>
            </div>
            {totalOrdenes > 0 && (
              <span className="text-xs text-[#6667AB]">{totalOrdenes} total</span>
            )}
          </div>
          {ordenesPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={ordenesPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  label={CustomPieLabel}
                  labelLine={false}
                >
                  {ordenesPie.map((entry, i) => (
                    <Cell key={entry.Estado} fill={STATUS_COLORS[entry.Estado] || COLORS[i % COLORS.length]} stroke="rgba(255,255,255,0.1)" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value: string) => <span className="text-[#F5D5E0] text-xs">{value}</span>}
                  wrapperStyle={{ paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[#6667AB] text-center py-12">Sin datos</p>
          )}
        </motion.div>

        {/* Especialidades más demandadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#F6A5C0]" />
            <h3 className="font-bold text-white">Especialidades más demandadas</h3>
          </div>
          {especialidadesData.length > 0 ? (
            <div className="space-y-3">
              {especialidadesData.slice(0, 6).map((esp: any, i: number) => {
                const pct = (esp.value / maxEsp) * 100;
                return (
                  <div key={esp.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-[#F5D5E0]">{esp.name}</span>
                      <span className="text-xs font-bold text-[#CC8DB3]">{esp.value}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                        className="h-full rounded-full bg-linear-to-r from-[#7B337E] to-[#F6A5C0]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[#6667AB] text-center py-12">Sin datos de especialidades</p>
          )}
        </motion.div>
      </div>

      {/* Chart row 2: Ingresos por Mes + Predicción */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart: Ingresos por Mes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-[#F6A5C0]" />
            <h3 className="font-bold text-white">Ingresos por Mes</h3>
          </div>
          {ingresosData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ingresosData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="mes" tick={{ fill: '#6667AB', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6667AB', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `S/${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="ingresos" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {ingresosData.map((_, i) => (
                    <Cell key={i} fill={i === ingresosData.length - 1 ? '#F6A5C0' : '#7B337E'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[#6667AB] text-center py-12">Sin datos de ingresos</p>
          )}
        </motion.div>

        {/* Predicción de Demanda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#F6A5C0]" />
            <h3 className="font-bold text-white">Predicción de Demanda</h3>
          </div>
          {prediccion ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#6667AB]">Prom. mensual</p>
                  <p className="text-lg font-extrabold text-white">{prediccion.promedioMensual ?? 0}</p>
                </div>
                <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#6667AB]">Próx. mes</p>
                  <p className="text-lg font-extrabold text-[#F6A5C0]">{prediccion.prediccionProximoMes ?? 0}</p>
                </div>
                <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#6667AB]">Tendencia</p>
                  <p className={`text-lg font-extrabold capitalize ${prediccion.tendencia === 'creciente' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {prediccion.tendencia === 'creciente' ? '↑' : '↓'} {prediccion.tendencia}
                  </p>
                </div>
              </div>
              {(prediccion.ordenesPorMes ?? []).length > 0 && (
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={(prediccion.ordenesPorMes ?? []).map((o: any) => ({ mes: formatMes(o.mes), ordenes: o.count }))} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="mes" tick={{ fill: '#6667AB', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6667AB', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="ordenes" stroke="#F6A5C0" strokeWidth={2} dot={{ fill: '#F6A5C0', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
              <div className="flex items-center justify-between text-xs text-[#6667AB] pt-2 border-t border-[rgba(255,255,255,0.06)]">
                <span>👩 {prediccion.cuidadorasDisponibles ?? 0} cuidadoras disponibles</span>
                <span>🏠 {prediccion.familiasBuscando ?? 0} familias buscando</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#6667AB] text-center py-12">Sin datos de predicción</p>
          )}
        </motion.div>
      </div>

      {/* Cuidadoras activas y familias registradas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-[#F6A5C0]" />
          <h3 className="font-bold text-white">Plataforma</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: 'Transacciones Completadas', value: data?.totalTransacciones ?? 0, icon: DollarSign },
            { label: 'Cuidadoras Activas', value: data?.cuidadorasActivas ?? 0, icon: Users },
            { label: 'Familias Registradas', value: data?.familiasRegistradas ?? 0, icon: Users },
            { label: 'Total Órdenes', value: totalOrdenes, icon: Calendar },
          ].map((m, i) => (
            <div key={m.label} className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
              <m.icon className="w-5 h-5 text-[#6667AB] mb-2" />
              <p className="text-xl font-extrabold text-white">{m.value}</p>
              <p className="text-xs text-[#6667AB] mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
