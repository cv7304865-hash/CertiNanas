import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  ShieldCheck, DollarSign, User, Calendar, Clock, CheckCircle, XCircle,
  Lock, Unlock, Image as ImageIcon, Search, CreditCard, Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from './ui/Banner';

type Transaccion = {
  Id: number;
  OrdenId: number;
  FamiliaNombres: string;
  FamiliaApellidos: string;
  CuidadoraNombres: string;
  CuidadoraApellidos: string;
  MontoTotal: number;
  Comision: number;
  MontoCuidadora: number;
  Estado: string;
  MetodoPago: string;
  FechaCreacion: string;
};

type YapePlinValidacion = {
  Id: number;
  NumeroOperacion: string;
  Monto: number;
  ComprobanteUrl: string;
  Estado: string;
  FechaCreacion: string;
  FamiliaNombres: string;
  FamiliaApellidos: string;
};

export function AdminPagosProtegidos() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [validaciones, setValidaciones] = useState<YapePlinValidacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [filterEstado, setFilterEstado] = useState('todos');
  const [detalleEscrow, setDetalleEscrow] = useState<any>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch('/api/admin/transacciones', { headers }),
        fetch('/api/admin/yape-plin-validaciones', { headers }),
      ]);
      if (r1.ok) setTransacciones(await r1.json());
      if (r2.ok) setValidaciones(await r2.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleValidarYapePlin = async (id: number) => {
    const r = await fetch(`/api/admin/yape-plin-validaciones/${id}/validar`, { method: 'POST', headers });
    if (r.ok) {
      setMessage({ type: 'success', text: 'Pago validado correctamente' });
      load();
    } else {
      setMessage({ type: 'danger', text: 'Error al validar pago' });
    }
  };

  const handleRechazarYapePlin = async (id: number) => {
    const r = await fetch(`/api/admin/yape-plin-validaciones/${id}/rechazar`, { method: 'POST', headers });
    if (r.ok) {
      setMessage({ type: 'success', text: 'Pago rechazado' });
      load();
    } else {
      setMessage({ type: 'danger', text: 'Error al rechazar pago' });
    }
  };

  const totalCustodia = transacciones.filter(t => t.Estado === 'Retenido').reduce((s, t) => s + t.MontoTotal, 0);
  const pendientesLiberacion = transacciones.filter(t => t.Estado === 'Retenido').length;
  const liberadosEsteMes = transacciones.filter(t => {
    if (t.Estado !== 'Liberado') return false;
    const d = new Date(t.FechaCreacion);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const filteredTransacciones = filterEstado === 'todos'
    ? transacciones
    : transacciones.filter(t => t.Estado.toLowerCase() === filterEstado);

  const badgeEstado = (est: string) => {
    const map: Record<string, string> = {
      Retenido: 'bg-amber-500/20 text-amber-200',
      Liberado: 'bg-emerald-500/20 text-emerald-200',
      Reembolsado: 'bg-red-500/20 text-red-200',
    };
    return map[est] || 'bg-[rgba(33,6,53,0.5)] text-[#6667AB]';
  };

  const formatFecha = (f: string) => {
    const d = new Date(f);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto pb-8">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="w-5 h-5 text-[#F6A5C0]" />
        <h1 className="text-2xl font-extrabold text-white">Pagos Protegidos</h1>
      </div>
      <p className="text-sm text-[#6667AB] mb-6">Supervisión de pagos Escrow y validación de Yape/Plin</p>

      {message && (
        <div className="mb-4">
          <Banner variant={message.type} onClose={() => setMessage(null)}>{message.text}</Banner>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold text-[#6667AB] uppercase">Total en Custodia</span>
          </div>
          <p className="text-2xl font-bold text-amber-200">S/ {totalCustodia.toFixed(2)}</p>
          <p className="text-[10px] text-[#6667AB] mt-1">{pendientesLiberacion} servicio(s)</p>
        </div>
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#F6A5C0]" />
            <span className="text-xs font-bold text-[#6667AB] uppercase">Pendientes de Liberación</span>
          </div>
          <p className="text-2xl font-bold text-white">{pendientesLiberacion}</p>
          <p className="text-[10px] text-[#6667AB] mt-1">transacciones</p>
        </div>
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Unlock className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-bold text-[#6667AB] uppercase">Liberados este Mes</span>
          </div>
          <p className="text-2xl font-bold text-emerald-200">{liberadosEsteMes}</p>
          <p className="text-[10px] text-[#6667AB] mt-1">servicios</p>
        </div>
      </div>

      <h2 className="font-bold text-white text-lg mb-4">Transacciones</h2>
      <div className="flex gap-2 mb-4">
        {['todos', 'retenido', 'liberado', 'reembolsado'].map(f => (
          <button key={f} onClick={() => setFilterEstado(f)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
              filterEstado === f ? 'bg-[#F6A5C0] text-[#210635]' : 'bg-[rgba(33,6,53,0.5)] text-[#6667AB] hover:text-white'
            }`}
          >
            {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Clock className="w-8 h-8 text-[#6667AB] mx-auto mb-2 animate-spin" />
        </div>
      ) : (
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[rgba(33,6,53,0.4)] border-b border-[rgba(255,255,255,0.1)]">
                  <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Orden ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Familia</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Cuidadora</th>
                  <th className="text-right py-3 px-4 font-semibold text-[#6667AB]">Monto Total</th>
                  <th className="text-right py-3 px-4 font-semibold text-[#6667AB]">Comisión (15%)</th>
                  <th className="text-right py-3 px-4 font-semibold text-[#6667AB]">Monto Cuidadora</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#6667AB]">Método</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#6667AB]">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransacciones.map((t, i) => (
                  <tr key={t.Id} className={`border-b border-[rgba(255,255,255,0.06)] ${i % 2 === 0 ? 'bg-[rgba(33,6,53,0.3)]' : 'bg-[rgba(33,6,53,0.15)]'} hover:bg-[rgba(33,6,53,0.3)] transition-colors`}>
                    <td className="py-3 px-4 font-mono font-bold text-[#F5D5E0]">#{t.OrdenId}</td>
                    <td className="py-3 px-4 text-[#F5D5E0]">{t.FamiliaNombres} {t.FamiliaApellidos?.charAt(0)}.</td>
                    <td className="py-3 px-4 text-[#F5D5E0]">{t.CuidadoraNombres} {t.CuidadoraApellidos?.charAt(0)}.</td>
                    <td className="py-3 px-4 text-right font-semibold text-white">S/ {t.MontoTotal.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-[#F6A5C0]">S/ {t.Comision.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-300">S/ {t.MontoCuidadora.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeEstado(t.Estado)}`}>
                        {t.Estado}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 text-xs text-[#F5D5E0]">
                        {t.MetodoPago === 'Yape' || t.MetodoPago === 'Plin' ? <Smartphone className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                        {t.MetodoPago}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={async () => {
                            setCargandoDetalle(true);
                            try {
                              const r = await fetch(`/api/admin/escrows/${t.Id}`, { headers });
                              if (r.ok) setDetalleEscrow(await r.json());
                            } catch {}
                            setCargandoDetalle(false);
                          }}
                          className="text-[10px] font-semibold text-[#F6A5C0] hover:text-[#F6A5C0]/80 transition-colors"
                        >
                          <Eye className="w-3 h-3 inline mr-0.5" /> Detalle
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTransacciones.length === 0 && (
                  <tr><td colSpan={9} className="py-8 text-center text-[#6667AB]">Sin transacciones</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2 className="font-bold text-white text-lg mb-4">Validación Yape/Plin</h2>
      {validaciones.filter(v => v.Estado === 'Pendiente').length === 0 ? (
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-8 text-center">
          <ShieldCheck className="w-10 h-10 text-[#6667AB] mx-auto mb-2" />
          <p className="text-sm text-[#6667AB]">Sin pagos pendientes de validación</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {validaciones.filter(v => v.Estado === 'Pendiente').map(v => (
            <motion.div
              key={v.Id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {v.ComprobanteUrl ? (
                    <img src={v.ComprobanteUrl} alt="Comprobante" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-[#6667AB]" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{v.FamiliaNombres} {v.FamiliaApellidos}</p>
                  <p className="text-xs text-[#6667AB] mt-1">Operación: {v.NumeroOperacion}</p>
                  <p className="text-xs text-[#F5D5E0] mt-1">Monto: <span className="font-bold text-white">S/ {v.Monto.toFixed(2)}</span></p>
                  <p className="text-[10px] text-[#6667AB] mt-1">{formatFecha(v.FechaCreacion)}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleValidarYapePlin(v.Id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Validar
                    </button>
                    <button
                      onClick={() => handleRechazarYapePlin(v.Id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-400 text-red-400 text-xs font-bold hover:bg-[rgba(200,40,40,0.1)] transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Rechazar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Escrow Detail Modal */}
      {detalleEscrow && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { setDetalleEscrow(null); setCargandoDetalle(false); }}
        >
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[rgba(33,6,53,0.95)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.12)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#F6A5C0]" /> Pago Protegido #{detalleEscrow.Id}
              </h3>
              <button onClick={() => { setDetalleEscrow(null); setCargandoDetalle(false); }}
                className="p-1.5 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
              ><X className="w-4 h-4 text-[#6667AB]" /></button>
            </div>

            {cargandoDetalle ? (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-[#6667AB] mx-auto mb-2 animate-spin" />
                <p className="text-sm text-[#6667AB]">Cargando detalle...</p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Información del escrow */}
                <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                  <h4 className="text-xs font-bold text-[#F6A5C0] uppercase mb-3">Información del Escrow</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="col-span-2">
                      <span className="text-[#6667AB]">Orden #{detalleEscrow.OrdenId}:</span>
                      <span className="text-white ml-1">{detalleEscrow.FamiliaNombres} {detalleEscrow.FamiliaApellidos} ↔ {detalleEscrow.CuidadoraNombres} {detalleEscrow.CuidadoraApellidos}</span>
                    </div>
                    {detalleEscrow.MenorNombre && <div><span className="text-[#6667AB]">Menor:</span> <span className="text-white ml-1">{detalleEscrow.MenorNombre}</span></div>}
                    <div><span className="text-[#6667AB]">Fecha:</span> <span className="text-white ml-1">{detalleEscrow.FechaServicio}</span></div>
                    <div><span className="text-[#6667AB]">Horario:</span> <span className="text-white ml-1">{detalleEscrow.HoraInicio} - {detalleEscrow.HoraFin}</span></div>
                    <div><span className="text-[#6667AB]">Horas:</span> <span className="text-white ml-1">{detalleEscrow.TotalHoras}h</span></div>
                    <div><span className="text-[#6667AB]">Tarifa:</span> <span className="text-white ml-1">S/ {detalleEscrow.TarifaHora}/h</span></div>
                  </div>
                </div>

                {/* Montos */}
                <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                  <h4 className="text-xs font-bold text-[#F6A5C0] uppercase mb-3">Desglose de Montos</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-[#6667AB]">Total:</span> <span className="text-white ml-1 font-bold">S/ {detalleEscrow.MontoTotal?.toFixed(2)}</span></div>
                    <div><span className="text-[#6667AB]">Subtotal:</span> <span className="text-white ml-1">S/ {detalleEscrow.Subtotal?.toFixed(2)}</span></div>
                    <div><span className="text-[#6667AB]">Comisión:</span> <span className="text-[#F6A5C0] ml-1">S/ {detalleEscrow.MontoPlataforma?.toFixed(2) || detalleEscrow.TarifaPlataforma?.toFixed(2)}</span></div>
                    <div><span className="text-[#6667AB]">Monto Cuidadora:</span> <span className="text-emerald-300 ml-1 font-bold">S/ {detalleEscrow.MontoCuidadora?.toFixed(2)}</span></div>
                    <div>
                      <span className="text-[#6667AB]">Estado Escrow:</span>
                      <span className={`ml-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        detalleEscrow.Estado === 'Liberado' ? 'bg-emerald-500/20 text-emerald-200' :
                        detalleEscrow.Estado === 'Retenido' ? 'bg-amber-500/20 text-amber-200' :
                        'bg-red-500/20 text-red-200'
                      }`}>{detalleEscrow.Estado}</span>
                    </div>
                    <div>
                      <span className="text-[#6667AB]">Estado Orden:</span>
                      <span className={`ml-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        detalleEscrow.OrdenEstado === 'Completada' || detalleEscrow.OrdenEstado === 'Finalizada'
                          ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'
                      }`}>{detalleEscrow.OrdenEstado}</span>
                    </div>
                  </div>
                </div>

                {/* Estado de confirmaciones */}
                <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                  <h4 className="text-xs font-bold text-[#6667AB] uppercase mb-3">Estado de Confirmaciones</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      {detalleEscrow.ConfirmadaFamilia ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-amber-400" />}
                      <span className="text-[#F5D5E0]">Familia: {detalleEscrow.ConfirmadaFamilia ? 'Confirmó' : 'Pendiente'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {detalleEscrow.ConfirmadaCuidadora ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-amber-400" />}
                      <span className="text-[#F5D5E0]">Cuidadora: {detalleEscrow.ConfirmadaCuidadora ? 'Confirmó' : 'Pendiente'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {detalleEscrow.FinalizadaFamilia ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-amber-400" />}
                      <span className="text-[#F5D5E0]">Finalizada por familia: {detalleEscrow.FinalizadaFamilia ? 'Sí' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {detalleEscrow.FinalizadaCuidadora ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-amber-400" />}
                      <span className="text-[#F5D5E0]">Finalizada por cuidadora: {detalleEscrow.FinalizadaCuidadora ? 'Sí' : 'No'}</span>
                    </div>
                  </div>
                  {detalleEscrow.FechaFinalizacion && (
                    <p className="text-xs text-[#6667AB] mt-2"><Clock className="w-3 h-3 inline mr-1" />Finalizó: {new Date(detalleEscrow.FechaFinalizacion).toLocaleDateString('es-PE')}</p>
                  )}
                </div>

                {/* Método de pago */}
                {detalleEscrow.MetodoPago && (
                  <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                    <h4 className="text-xs font-bold text-[#6667AB] uppercase mb-3">Método de Pago</h4>
                    <div className="flex items-center gap-2 text-sm">
                      {detalleEscrow.MetodoPago === 'Yape' || detalleEscrow.MetodoPago === 'Plin'
                        ? <Smartphone className="w-5 h-5 text-[#F6A5C0]" />
                        : <CreditCard className="w-5 h-5 text-[#CC8DB3]" />
                      }
                      <span className="text-white">{detalleEscrow.MetodoPago}</span>
                      <span className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        detalleEscrow.PagoEstado === 'Completado' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'
                      }`}>{detalleEscrow.PagoEstado}</span>
                      {detalleEscrow.FechaPago && (
                        <span className="text-[10px] text-[#6667AB] ml-2">{new Date(detalleEscrow.FechaPago).toLocaleDateString('es-PE')}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Incidencias relacionadas */}
                {detalleEscrow.incidencias?.length > 0 && (
                  <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                    <h4 className="text-xs font-bold text-[#F6A5C0] uppercase mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" /> Incidencias ({detalleEscrow.incidencias.length})
                    </h4>
                    <div className="space-y-2">
                      {detalleEscrow.incidencias.map((inc: any, i: number) => (
                        <div key={i} className="bg-[rgba(33,6,53,0.3)] rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">#{inc.Id} - {inc.Tipo}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              inc.Estado === 'Cerrada' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'
                            }`}>{inc.Estado}</span>
                          </div>
                          <p className="text-xs text-[#6667AB] mt-1">{inc.Descripcion?.slice(0, 200)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            <button onClick={() => { setDetalleEscrow(null); setCargandoDetalle(false); }}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:opacity-90 transition-opacity"
            >Cerrar</button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
