import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Eye, ListTodo, DollarSign, Clock, CreditCard, Smartphone, Loader, ThumbsUp, FileSignature } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ContractFormat } from './ContractFormat';

type Contrato = {
  Id: number; FechaServicio: string; HoraInicio: string; HoraFin: string;
  Total: number; Estado: string; FechaCreacion: string;
  FamiliaNombres: string; FamiliaApellidos: string;
  CuidadoraNombres: string; CuidadoraApellidos: string;
  MenorNombre: string | null; MenorDiagnostico: string | null;
  TipoServicio: string; TotalHoras: number; TarifaHora: number;
  Subtotal: number; TarifaPlataforma: number;
  EstadoNegociacion?: string;
  requiere_mediacion_manual?: boolean;
};

type DetalleContrato = Contrato & {
  tareas: { Id: number; Descripcion: string; Categoria?: string; Decision: string; EsPersonalizada: boolean }[];
  escrow: { Id: number; MontoTotal: number; MontoCuidadora: number; MontoPlataforma: number; Estado: string; FechaCreacion: string } | null;
  pago: { Id: number; MetodoPago: string; Estado: string; Monto: number; FechaPago: string } | null;
};

export function AdminContratos() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState<DetalleContrato | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

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

  const handleVbRapido = async (id: number) => {
    const r = await fetch(`/api/admin/visto-bueno/${id}`, { method: 'POST', headers });
    if (r.ok) {
      setContratos(prev => prev.map(c => c.Id === id ? { ...c, Estado: 'Confirmada', EstadoNegociacion: 'Acordado' } : c));
      setMessage('Visto Bueno otorgado');
    }
  };

  const [message, setMessage] = useState<string | null>(null);
  const [showContract, setShowContract] = useState<Contrato | null>(null);

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

      {message && (
        <div className="mb-4 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-sm font-semibold">
          {message}
        </div>
      )}

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
                      <button onClick={async () => {
                          setCargandoDetalle(true);
                          try {
                            const r = await fetch(`/api/admin/contratos/${c.Id}`, { headers });
                            if (r.ok) setDetalle(await r.json());
                          } catch {}
                          setCargandoDetalle(false);
                        }}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#F6A5C0] hover:bg-[#F6A5C0]/10 transition-colors"
                      >
                        <Eye className="w-3 h-3 inline mr-1" /> Ver
                      </button>
                      <button onClick={() => setShowContract(c)}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#CC8DB3] hover:bg-[#CC8DB3]/10 transition-colors"
                      >
                        <FileSignature className="w-3 h-3 inline mr-1" /> Contrato
                      </button>
                      {c.Estado === 'Pendiente' && (
                        <>
                          {c.requiere_mediacion_manual === false && (
                            <button onClick={() => handleVbRapido(c.Id)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30"
                            >
                              <ThumbsUp className="w-3 h-3 inline mr-1" /> Aprobación Inmediata (Vb Rápido)
                            </button>
                          )}
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
          onClick={() => { setDetalle(null); setCargandoDetalle(false); }}
        >
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[rgba(33,6,53,0.95)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.12)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Detalle del Contrato #{detalle.Id}</h3>
              <button onClick={() => { setDetalle(null); setCargandoDetalle(false); }}
                className="p-1.5 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
              ><XCircle className="w-4 h-4 text-[#6667AB]" /></button>
            </div>

            {cargandoDetalle ? (
              <div className="text-center py-8">
                <Loader className="w-8 h-8 text-[#6667AB] mx-auto mb-2 animate-spin" />
                <p className="text-sm text-[#6667AB]">Cargando detalle...</p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Información general */}
                <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-[#6667AB]">Familia:</span> <span className="text-white ml-1">{detalle.FamiliaNombres} {detalle.FamiliaApellidos}</span></div>
                    <div><span className="text-[#6667AB]">Cuidadora:</span> <span className="text-white ml-1">{detalle.CuidadoraNombres} {detalle.CuidadoraApellidos}</span></div>
                    <div><span className="text-[#6667AB]">Menor:</span> <span className="text-white ml-1">{detalle.MenorNombre || '--'}</span></div>
                    <div><span className="text-[#6667AB]">Servicio:</span> <span className="text-white ml-1">{detalle.TipoServicio}</span></div>
                    <div><span className="text-[#6667AB]">Fecha:</span> <span className="text-white ml-1">{formatFecha(detalle.FechaServicio)}</span></div>
                    <div><span className="text-[#6667AB]">Horario:</span> <span className="text-white ml-1">{detalle.HoraInicio} - {detalle.HoraFin}</span></div>
                    <div><span className="text-[#6667AB]">Total:</span> <span className="text-white ml-1 font-bold">S/ {detalle.Total.toFixed(2)}</span></div>
                    <div>
                      <span className="text-[#6667AB]">Estado:</span>
                      <span className={`ml-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(detalle.Estado)}`}>{detalle.Estado}</span>
                    </div>
                  </div>
                </div>

                {/* Tareas */}
                {detalle.tareas?.length > 0 && (
                  <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                    <h4 className="text-xs font-bold text-[#F6A5C0] uppercase mb-3 flex items-center gap-2">
                      <ListTodo className="w-4 h-4" /> Tareas del Contrato
                    </h4>
                    <div className="space-y-2">
                      {detalle.tareas.map((t: any) => (
                        <div key={t.Id} className="flex items-center justify-between bg-[rgba(33,6,53,0.3)] rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            {t.Decision === 'Aceptar' && <CheckCircle className="w-3.5 h-3.5 text-[#6EE7B7]" />}
                            {t.Decision === 'Rechazar' && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                            {(t.Decision === 'Negociar' || t.Decision === 'Pendiente' || !t.Decision) && <Clock className="w-3.5 h-3.5 text-[#F6A5C0]" />}
                            <span className="text-xs text-[#F5D5E0]">{t.Descripcion}</span>
                            {t.EsPersonalizada && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#7B337E]/30 text-[#CC8DB3]">Personalizada</span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.Decision === 'Aceptar' ? 'bg-emerald-500/20 text-emerald-200' :
                            t.Decision === 'Rechazar' ? 'bg-red-500/20 text-red-200' :
                            'bg-amber-500/20 text-amber-200'
                          }`}>{t.Decision || 'Pendiente'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Escrow / Pago */}
                {detalle.escrow && (
                  <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                    <h4 className="text-xs font-bold text-[#F6A5C0] uppercase mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Pago Protegido (Escrow)
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-[#6667AB]">Monto Total:</span> <span className="text-white ml-1">S/ {detalle.escrow.MontoTotal?.toFixed(2)}</span></div>
                      <div><span className="text-[#6667AB]">Monto Cuidadora:</span> <span className="text-emerald-300 ml-1 font-bold">S/ {detalle.escrow.MontoCuidadora?.toFixed(2)}</span></div>
                      <div><span className="text-[#6667AB]">Comisión:</span> <span className="text-[#F6A5C0] ml-1">S/ {detalle.escrow.MontoPlataforma?.toFixed(2)}</span></div>
                      <div>
                        <span className="text-[#6667AB]">Estado:</span>
                        <span className={`ml-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          detalle.escrow.Estado === 'Liberado' ? 'bg-emerald-500/20 text-emerald-200' :
                          detalle.escrow.Estado === 'Retenido' ? 'bg-amber-500/20 text-amber-200' :
                          'bg-red-500/20 text-red-200'
                        }`}>{detalle.escrow.Estado}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Método de pago */}
                {detalle.pago && (
                  <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                    <h4 className="text-xs font-bold text-[#6667AB] uppercase mb-3 flex items-center gap-2">
                      {detalle.pago.MetodoPago === 'Yape' || detalle.pago.MetodoPago === 'Plin'
                        ? <Smartphone className="w-4 h-4 text-[#F6A5C0]" />
                        : <CreditCard className="w-4 h-4 text-[#CC8DB3]" />
                      }
                      Información de Pago
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-[#6667AB]">Método:</span> <span className="text-white ml-1">{detalle.pago.MetodoPago}</span></div>
                      <div><span className="text-[#6667AB]">Monto:</span> <span className="text-white ml-1">S/ {detalle.pago.Monto?.toFixed(2)}</span></div>
                      <div><span className="text-[#6667AB]">Estado:</span> <span className="text-white ml-1">{detalle.pago.Estado}</span></div>
                      {detalle.pago.FechaPago && (
                        <div><span className="text-[#6667AB]">Fecha:</span> <span className="text-white ml-1">{formatFecha(detalle.pago.FechaPago)}</span></div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}

            <button onClick={() => { setDetalle(null); setCargandoDetalle(false); }}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:opacity-90 transition-opacity"
            >Cerrar</button>
          </motion.div>
        </motion.div>
      )}

      {/* Contract Format Modal */}
      {showContract && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowContract(null)}
        >
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <ContractFormat
              codigo={`CTN-2026-${String(showContract.Id).padStart(4, '0')}`}
              fechaEmision={new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
              familiaNombre={`${showContract.FamiliaNombres} ${showContract.FamiliaApellidos}`}
              cuidadoraNombre={`${showContract.CuidadoraNombres} ${showContract.CuidadoraApellidos}`}
              menorNombre={showContract.MenorNombre || 'No especificado'}
              menorDiagnostico={showContract.MenorDiagnostico || 'No especificado'}
              fechaServicio={showContract.FechaServicio}
              horaInicio={showContract.HoraInicio}
              horaFin={showContract.HoraFin}
              duracionHoras={showContract.TotalHoras}
              tarifaHora={showContract.TarifaHora}
              montoTotal={showContract.Total}
              subtotal={showContract.Subtotal}
              comision={showContract.TarifaPlataforma}
              tareas={detalle?.tareas || []}
              estado={showContract.Estado}
              firmadoFamilia={showContract.Estado === 'Confirmada' || showContract.Estado === 'Completada' || showContract.Estado === 'Finalizada'}
              firmadoCuidadora={showContract.Estado === 'Confirmada' || showContract.Estado === 'Completada' || showContract.Estado === 'Finalizada'}
            />
            <button onClick={() => setShowContract(null)}
              className="mt-4 w-full py-3 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:opacity-90 transition-opacity"
            >Cerrar</button>
          </motion.div>
        </motion.div>
      )}

      {message && setTimeout(() => setMessage(null), 3000)}
    </div>
  );
}
