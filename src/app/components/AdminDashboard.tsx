import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  Activity, Calendar, DollarSign, Users, Shield, Smartphone, CreditCard,
  ArrowRight, AlertCircle, CheckCircle, Clock, FileText, BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Stats = {
  totalUsers: number; totalCuidadoras: number; totalFamilias: number;
  postulacionesPendientes: number; serviciosCompletados: number; incidenciasAbiertas: number;
};

type EscrowStatus = {
  electronico: { total: number; count: number; status: string };
  yapePlin: { total: number; count: number; status: string };
};

type Mediacion = {
  Id: number;
  FamiliaNombres: string;
  FamiliaApellidos: string;
  CuidadoraNombres: string;
  CuidadoraApellidos: string;
  Estado: string;
  FechaCreacion: string;
};

type Reporte = {
  totalOrdenes: number; ingresos: number; resenasPromedio: number;
  ordenesPorEstado: { Estado: string; count: number }[];
  topCuidadoras: { nombre: string; total: number }[];
};

export function AdminDashboard() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };

  const [stats, setStats] = useState<Stats | null>(null);
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [escrow, setEscrow] = useState<EscrowStatus | null>(null);
  const [mediaciones, setMediaciones] = useState<Mediacion[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats', { headers }).then(r => r.json()).catch(() => null),
      fetch('/api/admin/reportes', { headers }).then(r => r.json()).catch(() => null),
      fetch('/api/admin/transacciones', { headers }).then(r => r.json()).catch(() => []),
      fetch('/api/admin/mediaciones', { headers }).then(r => r.json()).catch(() => []),
    ]).then(([s, r, txns, meds]) => {
      if (s) setStats(s);
      if (r) setReporte(r);
      if (Array.isArray(txns)) {
        const total = txns.reduce((s, t) => s + (t.MontoTotal || 0), 0);
        setEscrow({
          electronico: { total, count: txns.length, status: txns.some(t => t.Estado === 'Retenido') ? 'Retenido' : 'Liberado' },
          yapePlin: { total: 0, count: 0, status: 'Sin datos' },
        });
      }
      if (Array.isArray(meds)) setMediaciones(meds);
    });
  }, []);

  const kpis = [
    { label: 'Usuarios Totales', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-[#F6A5C0]' },
    { label: 'Cuidadoras', value: stats?.totalCuidadoras ?? 0, icon: Activity, color: 'text-[#CC8DB3]' },
    { label: 'Familias', value: stats?.totalFamilias ?? 0, icon: Users, color: 'text-[#F6A5C0]' },
    { label: 'Postulaciones Pendientes', value: stats?.postulacionesPendientes ?? 0, icon: FileText, color: 'text-amber-300' },
  ];
  const kpis2 = [
    { label: 'Servicios Completados', value: stats?.serviciosCompletados ?? 0, icon: CheckCircle, color: 'text-emerald-300' },
    { label: 'Incidencias Abiertas', value: stats?.incidenciasAbiertas ?? 0, icon: AlertCircle, color: 'text-red-300' },
    { label: 'Ordenes Totales', value: reporte?.totalOrdenes ?? 0, icon: BarChart3, color: 'text-[#F6A5C0]' },
    { label: 'Ingresos', value: `S/ ${(reporte?.ingresos ?? 0).toFixed(2)}`, icon: DollarSign, color: 'text-[#F6A5C0]' },
  ];

  const formatFecha = (f: string) => {
    const d = new Date(f);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Fila 1: KPIs principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5"
          >
            <k.icon className={`w-6 h-6 ${k.color} mb-2`} />
            <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-[#6667AB] mt-1 font-medium">{k.label}</p>
          </motion.div>
        ))}
      </div>
      {/* Fila 2: KPIs secundarios */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis2.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
            className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5"
          >
            <k.icon className={`w-6 h-6 ${k.color} mb-2`} />
            <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-[#6667AB] mt-1 font-medium">{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Ordenes por Estado (bar chart) */}
      {reporte?.ordenesPorEstado?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[#F6A5C0]" />
            <h2 className="font-bold text-white text-lg">Órdenes por Estado</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {reporte.ordenesPorEstado.map((o, i) => {
              const total = reporte.ordenesPorEstado.reduce((s, x) => s + x.count, 0);
              const pct = total > 0 ? (o.count / total) * 100 : 0;
              return (
                <div key={o.Estado} className="bg-[rgba(33,6,53,0.4)] rounded-xl p-3 border border-[rgba(255,255,255,0.06)]">
                  <p className="text-xs text-[#6667AB]">{o.Estado}</p>
                  <p className="text-xl font-bold text-white mt-1">{o.count}</p>
                  <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] mt-2 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                      className={`h-full rounded-full ${
                        o.Estado === 'Finalizada' || o.Estado === 'Completada' ? 'bg-emerald-400' :
                        o.Estado === 'Cancelada' ? 'bg-red-400' :
                        o.Estado === 'En curso' ? 'bg-purple-400' :
                        'bg-[#F6A5C0]'
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-[#6667AB] mt-1">{pct.toFixed(0)}%</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Top Cuidadoras */}
      {reporte?.topCuidadoras?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#CC8DB3]" />
            <h2 className="font-bold text-white text-lg">Top Cuidadoras</h2>
          </div>
          <div className="space-y-2">
            {reporte.topCuidadoras.map((c, i) => (
              <div key={c.nombre} className="flex items-center justify-between bg-[rgba(33,6,53,0.4)] rounded-xl px-4 py-2.5 border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#F6A5C0]/20 flex items-center justify-center text-[10px] font-bold text-[#F6A5C0]">#{i + 1}</span>
                  <span className="text-sm text-white">{c.nombre}</span>
                </div>
                <span className="text-xs text-[#F5D5E0]">{c.total} servicios</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-[#F6A5C0]" />
            <h2 className="font-bold text-white text-lg">Escrow Monitor</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4 border border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-[#CC8DB3]" />
                <span className="text-xs font-bold text-[#6667AB] uppercase">Electrónicas</span>
              </div>
              <p className="text-2xl font-bold text-white">
                S/ {escrow?.electronico?.total?.toFixed(2) ?? '0.00'}
              </p>
              <p className="text-xs text-[#6667AB] mt-1">{escrow?.electronico?.count ?? 0} transacciones</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-200">
                {escrow?.electronico?.status ?? 'Activo'}
              </span>
            </div>
            <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4 border border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-4 h-4 text-[#F6A5C0]" />
                <span className="text-xs font-bold text-[#6667AB] uppercase">Yape/Plin</span>
              </div>
              <p className="text-2xl font-bold text-white">
                S/ {escrow?.yapePlin?.total?.toFixed(2) ?? '0.00'}
              </p>
              <p className="text-xs text-[#6667AB] mt-1">{escrow?.yapePlin?.count ?? 0} transacciones</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-200">
                {escrow?.yapePlin?.status ?? 'Pendiente'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-[#F6A5C0]" />
            <h2 className="font-bold text-white text-lg">Mediaciones Pendientes</h2>
          </div>
          {mediaciones.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-[#6667AB] mx-auto mb-2" />
              <p className="text-sm text-[#6667AB]">No hay mediaciones pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mediaciones.slice(0, 5).map((m, i) => (
                <div key={m.Id} className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#CC8DB3]/20 flex items-center justify-center text-[#CC8DB3] text-xs font-bold">
                        {m.FamiliaNombres?.charAt(0)}{m.FamiliaApellidos?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {m.FamiliaNombres} {m.FamiliaApellidos}
                        </p>
                        <p className="text-xs text-[#6667AB]">
                          ↔ {m.CuidadoraNombres} {m.CuidadoraApellidos}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.Estado === 'Pendiente' ? 'bg-amber-500/20 text-amber-200' :
                      m.Estado === 'En Progreso' ? 'bg-purple-500/20 text-purple-200' :
                      'bg-emerald-500/20 text-emerald-200'
                    }`}>
                      {m.Estado}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-[#6667AB]">{formatFecha(m.FechaCreacion)}</span>
                    <span className="text-[10px] text-[#6667AB]">↔ {m.CuidadoraNombres}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
