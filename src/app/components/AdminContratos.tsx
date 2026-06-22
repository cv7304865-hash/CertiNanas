import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Contrato = {
  Id: number; FechaServicio: string; HoraInicio: string; HoraFin: string;
  Total: number; Estado: string; FechaCreacion: string;
  FamiliaNombres: string; FamiliaApellidos: string;
  CuidadoraNombres: string; CuidadoraApellidos: string;
  MenorNombre: string | null; MenorDiagnostico: string | null;
  TipoServicio: string; TotalHoras: number; TarifaHora: number;
  Subtotal: number; TarifaPlataforma: number;
};

export function AdminContratos() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState<Contrato | null>(null);

  useEffect(() => {
    fetch('/api/admin/contratos', { headers })
      .then(r => r.json())
      .then(setContratos)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAprobar = async (id: number) => {
    const r = await fetch(`/api/admin/contratos/${id}/aprobar`, { method: 'PUT', headers });
    if (r.ok) setContratos(prev => prev.map(c => c.Id === id ? { ...c, Estado: 'Confirmada' } : c));
  };

  const handleRechazar = async (id: number) => {
    const r = await fetch(`/api/admin/contratos/${id}/rechazar`, { method: 'PUT', headers });
    if (r.ok) setContratos(prev => prev.map(c => c.Id === id ? { ...c, Estado: 'Cancelada' } : c));
  };

  const formatFecha = (f: string) => {
    if (!f) return '--';
    const d = new Date(f + 'T00:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const statusBadge = (e: string) => {
    const map: Record<string, string> = {
      Pendiente: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      Confirmada: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      Pagada: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      ['En curso']: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      Completada: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
      Finalizada: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
      Cancelada: 'bg-red-500/15 text-red-300 border-red-500/30',
    };
    return map[e] || 'bg-[rgba(33,6,53,0.5)] text-[#6667AB]';
  };

  const pendientes = contratos.filter(c => c.Estado === 'Pendiente').length;

  return (
    <div className="max-w-7xl mx-auto pb-8">
      <div className="flex items-center gap-2 mb-1">
        <FileText className="w-6 h-6 text-[#F6A5C0]" />
        <h1 className="text-2xl font-extrabold text-white">Contratos</h1>
      </div>
      <p className="text-sm text-[#6667AB] mb-6">
        Administra y valida los contratos de servicio entre familias y cuidadoras
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-[#6667AB] uppercase">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{contratos.length}</p>
        </div>
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-[#6667AB] uppercase">Pendientes</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{pendientes}</p>
        </div>
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-[#6667AB] uppercase">Completados</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{contratos.filter(c => c.Estado === 'Completada' || c.Estado === 'Finalizada').length}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-[#6667AB]">Cargando contratos...</p>
      ) : contratos.length === 0 ? (
        <div className="text-center py-16 bg-[rgba(33,6,53,0.3)] rounded-2xl">
          <FileText className="w-12 h-12 text-[#6667AB] mx-auto mb-3 opacity-50" />
          <p className="text-white font-semibold">No hay contratos registrados</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.1)] text-[#6667AB] text-xs uppercase tracking-wider">
                <th className="text-left py-3 pr-4 font-semibold">Familia</th>
                <th className="text-left py-3 pr-4 font-semibold">Cuidadora</th>
                <th className="text-left py-3 pr-4 font-semibold">Menor</th>
                <th className="text-left py-3 pr-4 font-semibold">Fecha</th>
                <th className="text-right py-3 pr-4 font-semibold">Monto</th>
                <th className="text-center py-3 pr-4 font-semibold">Estado</th>
                <th className="text-right py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map(c => (
                <tr key={c.Id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                  <td className="py-3 pr-4">
                    <span className="text-white text-xs">{c.FamiliaNombres} {c.FamiliaApellidos}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[#F5D5E0] text-xs">{c.CuidadoraNombres} {c.CuidadoraApellidos}</span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-[#6667AB]">
                    {c.MenorNombre || '--'}
                    {c.MenorDiagnostico && <span className="text-[#CC8DB3] text-[10px] block">({c.MenorDiagnostico})</span>}
                  </td>
                  <td className="py-3 pr-4 text-xs text-white whitespace-nowrap">{formatFecha(c.FechaServicio)}</td>
                  <td className="py-3 pr-4 text-xs text-right text-white font-semibold">S/ {c.Total.toFixed(2)}</td>
                  <td className="py-3 pr-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${statusBadge(c.Estado)}`}>
                      {c.Estado}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setDetalle(c)}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#F6A5C0] hover:bg-[#F6A5C0]/10 transition-colors"
                      >
                        <Eye className="w-3 h-3 inline mr-1" /> Ver
                      </button>
                      {c.Estado === 'Pendiente' && (
                        <>
                          <button onClick={() => handleAprobar(c.Id)}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3 inline mr-1" /> Aprobar
                          </button>
                          <button onClick={() => handleRechazar(c.Id)}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <XCircle className="w-3 h-3 inline mr-1" /> Rechazar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {detalle && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setDetalle(null)}
        >
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[rgba(33,6,53,0.95)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.12)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-4">Detalle del Contrato #{detalle.Id}</h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-[#6667AB]">Familia:</span> <span className="text-white">{detalle.FamiliaNombres} {detalle.FamiliaApellidos}</span></div>
                <div><span className="text-[#6667AB]">Cuidadora:</span> <span className="text-white">{detalle.CuidadoraNombres} {detalle.CuidadoraApellidos}</span></div>
                <div><span className="text-[#6667AB]">Menor:</span> <span className="text-white">{detalle.MenorNombre || '--'}</span></div>
                <div><span className="text-[#6667AB]">Servicio:</span> <span className="text-white">{detalle.TipoServicio}</span></div>
                <div><span className="text-[#6667AB]">Fecha:</span> <span className="text-white">{formatFecha(detalle.FechaServicio)}</span></div>
                <div><span className="text-[#6667AB]">Horario:</span> <span className="text-white">{detalle.HoraInicio} - {detalle.HoraFin}</span></div>
                <div><span className="text-[#6667AB]">Horas:</span> <span className="text-white">{detalle.TotalHoras}h</span></div>
                <div><span className="text-[#6667AB]">Tarifa:</span> <span className="text-white">S/ {detalle.TarifaHora}/h</span></div>
                <div><span className="text-[#6667AB]">Subtotal:</span> <span className="text-white">S/ {detalle.Subtotal.toFixed(2)}</span></div>
                <div><span className="text-[#6667AB]">Comisión:</span> <span className="text-white">S/ {detalle.TarifaPlataforma.toFixed(2)}</span></div>
                <div className="col-span-2"><span className="text-[#6667AB]">Total:</span> <span className="text-white font-bold">S/ {detalle.Total.toFixed(2)}</span></div>
              </div>
            </div>
            <button onClick={() => setDetalle(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:opacity-90 transition-opacity"
            >Cerrar</button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
