import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  Handshake, CheckCircle, XCircle, Clock, Calendar, DollarSign,
  User, Users, FileText, ThumbsUp, Shield, MessageSquare, Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from './ui/Banner';

type Mediacion = {
  Id: number;
  OrdenId: number;
  FamiliaNombres: string;
  FamiliaApellidos: string;
  CuidadoraNombres: string;
  CuidadoraApellidos: string;
  Estado: string;
  FechaCreacion: string;
  TieneVb: boolean;
  AuditLog: { accion: string; fecha: string; adminNombre: string }[];
};

export function AdminMediaciones() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [mediaciones, setMediaciones] = useState<Mediacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'warning' | 'danger'; text: string } | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/mediaciones', { headers });
      if (r.ok) setMediaciones(await r.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleOtorgarVb = async (id: number) => {
    const r = await fetch(`/api/admin/visto-bueno/${id}`, { method: 'POST', headers });
    if (r.ok) {
      setMessage({ type: 'success', text: 'Visto Bueno otorgado correctamente' });
      load();
    } else {
      const e = await r.json().catch(() => ({}));
      setMessage({ type: 'danger', text: e.error || 'Error al otorgar Visto Bueno' });
    }
  };

  const formatFecha = (f: string) => {
    const d = new Date(f);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const badgeEstado = (est: string) => {
    const map: Record<string, string> = {
      Pendiente: 'bg-amber-500/20 text-amber-200',
      'En Progreso': 'bg-purple-500/20 text-purple-200',
      Completada: 'bg-emerald-500/20 text-emerald-200',
      Cancelada: 'bg-red-500/20 text-red-200',
    };
    return map[est] || 'bg-[rgba(33,6,53,0.5)] text-[#6667AB]';
  };

  const selected = mediaciones.find(m => m.Id === selectedId);

  const comisionPorNegociacion = 25.00;
  const totalComisiones = mediaciones.filter(m => m.TieneVb).length * comisionPorNegociacion;

  return (
    <div className="max-w-7xl mx-auto pb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Handshake className="w-6 h-6 text-[#F6A5C0]" />
          <div>
            <h1 className="text-2xl font-extrabold text-white">Mediaciones</h1>
            <p className="text-sm text-[#6667AB] mt-1">Gestión de mediaciones activas y comisiones</p>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-4">
          <Banner variant={message.type} onClose={() => setMessage(null)}>{message.text}</Banner>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[#CC8DB3]" />
            <span className="text-xs font-bold text-[#6667AB] uppercase">Mediaciones Activas</span>
          </div>
          <p className="text-2xl font-bold text-white">{mediaciones.filter(m => m.Estado !== 'Completada' && m.Estado !== 'Cancelada').length}</p>
        </div>
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <ThumbsUp className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-bold text-[#6667AB] uppercase">Vb Otorgados</span>
          </div>
          <p className="text-2xl font-bold text-emerald-200">{mediaciones.filter(m => m.TieneVb).length}</p>
        </div>
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-[#F6A5C0]" />
            <span className="text-xs font-bold text-[#6667AB] uppercase">Comisiones (S/ {comisionPorNegociacion}.00 c/u)</span>
          </div>
          <p className="text-2xl font-bold text-white">S/ {totalComisiones.toFixed(2)}</p>
        </div>
      </div>

      {selectedId && selected ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6"
        >
          <button onClick={() => setSelectedId(null)}
            className="text-sm text-[#6667AB] hover:text-white transition-colors mb-4 flex items-center gap-1">
            <span>&larr;</span> Volver
          </button>

          <div className="flex items-center gap-3 mb-6">
            <span className="font-bold text-white text-lg">{selected.FamiliaNombres} {selected.FamiliaApellidos}</span>
            <span className="text-[#6667AB]">↔</span>
            <span className="font-bold text-white text-lg">{selected.CuidadoraNombres} {selected.CuidadoraApellidos}</span>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${badgeEstado(selected.Estado)}`}>
              {selected.Estado}
            </span>
          </div>

          <div className="mb-4">
            <h3 className="font-bold text-white text-sm mb-3">Auditoría de Sala Virtual</h3>
            {selected.AuditLog?.length > 0 ? (
              <div className="space-y-2">
                {selected.AuditLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 bg-[rgba(33,6,53,0.4)] rounded-xl p-3">
                    <div className="w-6 h-6 rounded-full bg-[#CC8DB3]/20 flex items-center justify-center text-[10px] text-[#CC8DB3] font-bold flex-shrink-0 mt-0.5">
                      {log.adminNombre?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-xs text-[#F5D5E0]">{log.accion}</p>
                      <p className="text-[10px] text-[#6667AB] mt-0.5">{log.adminNombre} · {formatFecha(log.fecha)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6667AB]">Sin registros de auditoría</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-[rgba(255,255,255,0.08)]">
            {!selected.TieneVb && selected.Estado === 'Completada' && (
              <button
                onClick={() => handleOtorgarVb(selected.OrdenId)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-lg shadow-black/20"
              >
                <ThumbsUp className="w-4 h-4" /> Otorgar Visto Bueno (Vb)
              </button>
            )}
            {selected.TieneVb && (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-200 text-sm font-bold">
                <CheckCircle className="w-4 h-4" /> Vb Otorgado
              </span>
            )}
          </div>
        </motion.div>
      ) : (
        <>
          {loading ? (
            <div className="text-center py-16">
              <Clock className="w-8 h-8 text-[#6667AB] mx-auto mb-2 animate-spin" />
              <p className="text-sm text-[#6667AB]">Cargando mediaciones...</p>
            </div>
          ) : mediaciones.length === 0 ? (
            <div className="text-center py-16 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl">
              <Handshake className="w-12 h-12 text-[#6667AB] mx-auto mb-3" />
              <p className="text-[#6667AB]">No hay mediaciones registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mediaciones.map((m, i) => (
                <motion.div
                  key={m.Id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-4 h-4 text-[#6667AB]" />
                        <span className="font-bold text-white">{m.FamiliaNombres} {m.FamiliaApellidos}</span>
                        <span className="text-[#6667AB]">↔</span>
                        <span className="font-bold text-white">{m.CuidadoraNombres} {m.CuidadoraApellidos}</span>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeEstado(m.Estado)}`}>
                          {m.Estado}
                        </span>
                        {m.TieneVb && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px] font-bold">
                            <CheckCircle className="w-3 h-3" /> Vb
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6667AB]">{formatFecha(m.FechaCreacion)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedId(m.Id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#F5D5E0] text-[#F5D5E0] text-xs font-semibold hover:bg-[rgba(245,213,224,0.1)] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver detalle
                      </button>
                      {!m.TieneVb && m.Estado === 'Completada' && (
                        <button
                          onClick={() => handleOtorgarVb(m.OrdenId)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-lg shadow-black/20"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> Otorgar Vb
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
