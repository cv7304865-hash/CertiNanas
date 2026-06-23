import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Shield, AlertTriangle, Eye, X, Loader, MessageSquare, FileText, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Incidencia = {
  Id: number;
  IdOrden: number | null;
  IdReporto: number | null;
  Tipo: string;
  Estado: string;
  Descripcion: string;
  FechaCreacion: string;
  Servicio: string;
  ReportoNombres?: string;
  ReportoApellidos?: string;
  FamiliaNombres?: string;
  FamiliaApellidos?: string;
};

type DetalleIncidencia = Incidencia & {
  ReportoRol?: number;
  OrdenEstado?: string;
  FechaServicio?: string;
  TotalHoras?: number;
  TarifaHora?: number;
  Total?: number;
  CuidadoraNombres?: string;
  CuidadoraApellidos?: string;
  MenorNombre?: string;
  mediaciones: any[];
  auditoria: any[];
};

export function AdminIncidencias() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState<DetalleIncidencia | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

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
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={async () => {
                      setCargandoDetalle(true);
                      try {
                        const r = await fetch(`/api/admin/incidencias/${inc.Id}`, { headers });
                        if (r.ok) setDetalle(await r.json());
                      } catch {}
                      setCargandoDetalle(false);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-full border border-[#F5D5E0]/30 text-[#F5D5E0] text-[10px] font-semibold hover:bg-[rgba(245,213,224,0.1)] transition-colors"
                  >
                    <Eye className="w-3 h-3" /> Detalle
                  </button>
                  {inc.Estado !== 'Cerrada' && (
                    <button onClick={() => handleCerrar(inc.Id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Cerrar
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
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
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" /> Incidencia #{detalle.Id}
              </h3>
              <button onClick={() => { setDetalle(null); setCargandoDetalle(false); }}
                className="p-1.5 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
              ><X className="w-4 h-4 text-[#6667AB]" /></button>
            </div>

            {cargandoDetalle ? (
              <div className="text-center py-8">
                <Loader className="w-8 h-8 text-[#6667AB] mx-auto mb-2 animate-spin" />
                <p className="text-sm text-[#6667AB]">Cargando detalle...</p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Info incidencia */}
                <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                  <h4 className="text-xs font-bold text-[#F6A5C0] uppercase mb-3">Información de la Incidencia</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="col-span-2"><span className="text-[#6667AB]">Descripción:</span> <span className="text-white ml-1">{detalle.Descripcion}</span></div>
                    <div>
                      <span className="text-[#6667AB]">Tipo:</span>
                      <span className={`ml-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${tipoColor(detalle.Tipo)}`}>{detalle.Tipo}</span>
                    </div>
                    <div>
                      <span className="text-[#6667AB]">Estado:</span>
                      <span className={`ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${estadoBadge(detalle.Estado)}`}>
                        {detalle.Estado === 'Cerrada' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {detalle.Estado}
                      </span>
                    </div>
                    {detalle.ReportoNombres && (
                      <div className="col-span-2 flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#6667AB]" />
                        <span className="text-[#6667AB]">Reportó:</span>
                        <span className="text-white">{detalle.ReportoNombres} {detalle.ReportoApellidos}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(33,6,53,0.5)] text-[#6667AB]">
                          {detalle.ReportoRol === 2 ? 'Familia' : detalle.ReportoRol === 3 ? 'Cuidadora' : 'Admin'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Orden relacionada */}
                {detalle.CuidadoraNombres && (
                  <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                    <h4 className="text-xs font-bold text-[#F6A5C0] uppercase mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Orden Relacionada #{detalle.IdOrden}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="col-span-2"><span className="text-[#6667AB]">Familia:</span> <span className="text-white ml-1">{detalle.FamiliaNombres} {detalle.FamiliaApellidos}</span></div>
                      <div className="col-span-2"><span className="text-[#6667AB]">Cuidadora:</span> <span className="text-white ml-1">{detalle.CuidadoraNombres} {detalle.CuidadoraApellidos}</span></div>
                      {detalle.MenorNombre && <div><span className="text-[#6667AB]">Menor:</span> <span className="text-white ml-1">{detalle.MenorNombre}</span></div>}
                      <div><span className="text-[#6667AB]">Servicio:</span> <span className="text-white ml-1">{detalle.Servicio}</span></div>
                      {detalle.FechaServicio && <div><span className="text-[#6667AB]">Fecha:</span> <span className="text-white ml-1">{detalle.FechaServicio}</span></div>}
                      {detalle.Total && <div><span className="text-[#6667AB]">Total:</span> <span className="text-white ml-1">S/ {detalle.Total.toFixed(2)}</span></div>}
                      <div>
                        <span className="text-[#6667AB]">Estado orden:</span>
                        <span className={`ml-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          detalle.OrdenEstado === 'Completada' || detalle.OrdenEstado === 'Finalizada'
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : 'bg-amber-500/20 text-amber-200'
                        }`}>{detalle.OrdenEstado}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mediaciones relacionadas */}
                {detalle.mediaciones?.length > 0 && (
                  <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                    <h4 className="text-xs font-bold text-[#F6A5C0] uppercase mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Mediaciones Relacionadas
                    </h4>
                    <div className="space-y-2">
                      {detalle.mediaciones.map((m: any, i: number) => (
                        <div key={i} className="bg-[rgba(33,6,53,0.3)] rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">Caso #{m.Id}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              m.Estado === 'Exito' ? 'bg-emerald-500/20 text-emerald-200' :
                              m.Estado === 'NoAcuerdo' ? 'bg-red-500/20 text-red-200' :
                              'bg-amber-500/20 text-amber-200'
                            }`}>{m.Estado}</span>
                          </div>
                          <p className="text-[10px] text-[#6667AB] mt-1">{m.FechaCreacion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Auditoría */}
                {detalle.auditoria?.length > 0 && (
                  <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
                    <h4 className="text-xs font-bold text-[#6667AB] uppercase mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Auditoría
                    </h4>
                    <div className="space-y-1">
                      {detalle.auditoria.map((a: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] text-[#6667AB]">
                          <span className="text-[#F5D5E0]">{a.Accion}</span>
                          <span>·</span>
                          <span>{a.UserNombre}</span>
                          <span>·</span>
                          <span>{a.FechaCreacion ? new Date(a.FechaCreacion).toLocaleDateString('es-PE') : ''}</span>
                        </div>
                      ))}
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
    </div>
  );
}
