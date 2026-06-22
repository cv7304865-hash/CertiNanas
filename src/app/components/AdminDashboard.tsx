import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  Activity, Calendar, DollarSign, Users, Shield, Smartphone, CreditCard,
  ArrowRight, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type DashboardData = {
  serviciosActivos: number;
  serviciosDelMes: number;
  ingresosDelMes: number;
  candidatasEnEspera: number;
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

export function AdminDashboard() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [escrow, setEscrow] = useState<EscrowStatus | null>(null);
  const [mediaciones, setMediaciones] = useState<Mediacion[]>([]);

  useEffect(() => {
    fetch('/api/analytics/dashboard', { headers })
      .then(r => r.json())
      .then(setDashboard)
      .catch(() => {});

    fetch('/api/admin/escrow-status', { headers })
      .then(r => r.json())
      .then(setEscrow)
      .catch(() => {});

    fetch('/api/admin/mediaciones', { headers })
      .then(r => r.json())
      .then(setMediaciones)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/admin/escrow-status', { headers })
        .then(r => r.json())
        .then(setEscrow)
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const kpis = [
    { label: 'Servicios Activos', value: dashboard?.serviciosActivos ?? 0, icon: Activity, color: 'text-[#F6A5C0]' },
    { label: 'Servicios del Mes', value: dashboard?.serviciosDelMes ?? 0, icon: Calendar, color: 'text-[#CC8DB3]' },
    { label: 'Ingresos del Mes', value: `S/ ${(dashboard?.ingresosDelMes ?? 0).toFixed(2)}`, icon: DollarSign, color: 'text-[#F6A5C0]' },
    { label: 'Candidatas en Espera', value: dashboard?.candidatasEnEspera ?? 0, icon: Users, color: 'text-[#CC8DB3]' },
  ];

  const formatFecha = (f: string) => {
    const d = new Date(f);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <k.icon className={`w-8 h-8 ${k.color}`} />
            </div>
            <p className={`text-3xl font-extrabold ${k.color}`}>{k.value}</p>
            <p className="text-sm text-[#6667AB] mt-1 font-medium">{k.label}</p>
          </motion.div>
        ))}
      </div>

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
              {mediaciones.map((m, i) => (
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
                    <button className="text-[10px] font-semibold text-[#F6A5C0] hover:text-[#F6A5C0]/80 transition-colors">
                      Ver Detalle <ArrowRight className="w-3 h-3 inline" />
                    </button>
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
