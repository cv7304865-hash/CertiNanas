import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Incidencia = {
  Id: number;
  IdOrden: number | null;
  Tipo: string;
  Estado: string;
  Descripcion: string;
  FechaCreacion: string;
  Servicio: string;
};

export function AdminIncidencias() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/incidencias', { headers })
      .then(r => r.json())
      .then(setIncidencias)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCerrar = async (id: number) => {
    const r = await fetch(`/api/admin/incidencias/${id}/cerrar`, { method: 'PUT', headers });
    if (r.ok) {
      setIncidencias(prev => prev.map(i => i.Id === id ? { ...i, Estado: 'Cerrada' } : i));
    }
  };

  const formatFecha = (f: string) => {
    const d = new Date(f);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const tipoColor = (t: string) => {
    const map: Record<string, string> = {
      Leve: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
      Moderada: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
      Grave: 'bg-red-500/20 text-red-200 border-red-500/30',
    };
    return map[t] || 'bg-[rgba(33,6,53,0.5)] text-[#6667AB]';
  };

  const estadoBadge = (e: string) => {
    if (e === 'Cerrada') return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30';
    if (e === 'Abierta') return 'bg-amber-500/20 text-amber-200 border-amber-500/30';
    return 'bg-[rgba(33,6,53,0.5)] text-[#6667AB]';
  };

  const abiertas = incidencias.filter(i => i.Estado !== 'Cerrada').length;
  const graves = incidencias.filter(i => i.Tipo === 'Grave' && i.Estado !== 'Cerrada').length;

  return (
    <div className="max-w-7xl mx-auto pb-8">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="w-6 h-6 text-[#F6A5C0]" />
        <h1 className="text-2xl font-extrabold text-white">Incidencias</h1>
      </div>
      <p className="text-sm text-[#6667AB] mb-6">
        Incidencias reportadas por familias y cuidadoras
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-[#6667AB] uppercase">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{incidencias.length}</p>
        </div>
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-[#6667AB] uppercase">Abiertas</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{abiertas}</p>
        </div>
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-[#6667AB] uppercase">Tipo Grave</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{graves}</p>
        </div>
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-[#6667AB] uppercase">Cerradas</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{incidencias.filter(i => i.Estado === 'Cerrada').length}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Clock className="w-8 h-8 text-[#6667AB] mx-auto mb-2 animate-spin" />
          <p className="text-sm text-[#6667AB]">Cargando incidencias...</p>
        </div>
      ) : incidencias.length === 0 ? (
        <div className="text-center py-16 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl">
          <Shield className="w-12 h-12 text-[#6667AB] mx-auto mb-3" />
          <p className="text-[#6667AB]">No hay incidencias registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidencias.map((inc, i) => (
            <motion.div
              key={inc.Id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border shadow-lg shadow-black/30 rounded-2xl p-5 ${
                inc.Tipo === 'Grave' && inc.Estado !== 'Cerrada'
                  ? 'border-red-500/40'
                  : 'border-[rgba(255,255,255,0.2)]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${tipoColor(inc.Tipo)} flex items-center justify-center flex-shrink-0`}>
                  {inc.Tipo === 'Grave' ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tipoColor(inc.Tipo)}`}>
                      {inc.Tipo}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${estadoBadge(inc.Estado)}`}>
                      {inc.Estado === 'Cerrada' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {inc.Estado}
                    </span>
                    <span className="text-[10px] text-[#6667AB]">{inc.Servicio}</span>
                  </div>
                  <p className="text-sm text-[#F5D5E0] mt-2 line-clamp-2">{inc.Descripcion}</p>
                  <div className="flex items-center gap-2 text-[10px] text-[#6667AB] mt-2">
                    <Clock className="w-3 h-3" />
                    <span>{formatFecha(inc.FechaCreacion)}</span>
                    {inc.IdOrden && (
                      <>
                        <span>·</span>
                        <span>Orden #{inc.IdOrden}</span>
                      </>
                    )}
                  </div>
                </div>
                {inc.Estado !== 'Cerrada' && (
                  <button
                    onClick={() => handleCerrar(inc.Id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors flex-shrink-0"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Cerrar
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
