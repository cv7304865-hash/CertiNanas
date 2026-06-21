import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ShieldCheck, DollarSign, User, Calendar, Clock, CheckCircle, XCircle, Lock, Unlock, RefreshCw, Baby } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from './ui/Banner';

type EscrowRecord = {
  Id: number; MontoTotal: number; MontoCuidadora: number; MontoPlataforma: number;
  EscrowEstado: string; EscrowFecha: string; FechaLiberacion: string | null;
  OrdenId: number; OrdenEstado: string; Total: number; Subtotal: number; TarifaPlataforma: number;
  FechaServicio: string; HoraInicio: string | null; HoraFin: string | null; TotalHoras: number; TarifaHora: number;
  ConfirmadaFamilia: number; ConfirmadaCuidadora: number;
  FinalizadaFamilia: number; FinalizadaCuidadora: number; FechaFinalizacion: string | null;
  FamiliaNombres: string; FamiliaApellidos: string;
  CuidadoraNombres: string; CuidadoraApellidos: string;
  MenorNombre: string | null;
};

export function AdminPagosProtegidos() {
  const { user } = useAuth();
  const headers = { 'x-admin-user': String(user?.id) };
  const [records, setRecords] = useState<EscrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [filter, setFilter] = useState<string>('todos');

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/escrows', { headers });
      if (r.ok) setRecords(await r.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'todos' ? records : records.filter(r => r.EscrowEstado.toLowerCase() === filter);

  const formatFecha = (f: string) => new Date(f + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatFechaHora = (f: string) => new Date(f).toLocaleString('es-PE');

  const totalRetenido = records.filter(r => r.EscrowEstado === 'Retenido').reduce((s, r) => s + r.MontoTotal, 0);
  const totalLiberado = records.filter(r => r.EscrowEstado === 'Liberado').reduce((s, r) => s + r.MontoTotal, 0);

  const escrowBadge: Record<string, string> = {
    Retenido: 'bg-amber-500/20 text-amber-200',
    Liberado: 'bg-emerald-500/20 text-emerald-200',
    Reembolsado: 'bg-red-500/20 text-red-200',
  };

  const confirmBadge = (v: number) => v ? 'bg-emerald-500/20 text-emerald-200' : 'bg-[rgba(33,6,53,0.5)] text-[#6667AB]';

  return (
    <div className="max-w-6xl mx-auto pb-8">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="w-5 h-5 text-[#F6A5C0]" />
        <h2 className="text-xl font-bold text-white">Pagos Protegidos</h2>
      </div>
      <p className="text-sm text-[#6667AB] mb-6">Supervisión de pagos retenidos en Escrow — sin pagos fuera de la plataforma</p>

      {message && (
        <div className="mb-4">
          <Banner variant={message.type} onClose={() => setMessage(null)}>{message.text}</Banner>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold text-[#6667AB] uppercase">Retenido en Escrow</span>
          </div>
          <p className="text-xl font-bold text-amber-200">S/ {totalRetenido.toFixed(2)}</p>
          <p className="text-[10px] text-[#6667AB]">{records.filter(r => r.EscrowEstado === 'Retenido').length} servicio(s)</p>
        </div>
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Unlock className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-bold text-[#6667AB] uppercase">Liberado a cuidadoras</span>
          </div>
          <p className="text-xl font-bold text-emerald-200">S/ {totalLiberado.toFixed(2)}</p>
          <p className="text-[10px] text-[#6667AB]">{records.filter(r => r.EscrowEstado === 'Liberado').length} servicio(s)</p>
        </div>
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-[#F6A5C0]" />
            <span className="text-xs font-bold text-[#6667AB] uppercase">Comisión CERTINANAS</span>
          </div>
          <p className="text-xl font-bold text-white">S/ {records.reduce((s, r) => s + r.MontoPlataforma, 0).toFixed(2)}</p>
          <p className="text-[10px] text-[#6667AB]">15% sobre {records.length} servicio(s)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['todos', 'retenido', 'liberado', 'reembolsado'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
              filter === f ? 'bg-[#F6A5C0] text-[#210635]' : 'bg-[rgba(33,6,53,0.5)] text-[#6667AB] hover:text-white'
            }`}
          >{f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {loading ? (
        <p className="text-[#6667AB] text-sm">Cargando...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ShieldCheck className="w-12 h-12 text-[#6667AB] mx-auto mb-3" />
          <p className="text-[#6667AB]">No hay registros de escrow.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <motion.div key={r.Id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Parties */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#6667AB]" />
                      <span className="text-white font-bold text-sm">{r.FamiliaNombres} {r.FamiliaApellidos}</span>
                      <span className="text-[#6667AB] text-xs">→</span>
                      <span className="text-white font-bold text-sm">{r.CuidadoraNombres} {r.CuidadoraApellidos}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${escrowBadge[r.EscrowEstado]}`}>
                      {r.EscrowEstado}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[rgba(33,6,53,0.5)] text-[#6667AB]`}>
                      {r.OrdenEstado}
                    </span>
                  </div>

                  {/* Escrow details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-3 text-xs">
                      <p className="text-[#6667AB] mb-1">Monto total</p>
                      <p className="text-white font-bold text-sm">S/ {r.MontoTotal.toFixed(2)}</p>
                      <p className="text-[10px] text-[#6667AB] mt-0.5">Cuidadora: S/ {r.MontoCuidadora.toFixed(2)}</p>
                      <p className="text-[10px] text-[#6667AB]">Plataforma: S/ {r.MontoPlataforma.toFixed(2)}</p>
                    </div>
                    <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-3 text-xs">
                      <p className="text-[#6667AB] mb-1">Servicio</p>
                      <p className="text-white font-semibold">{formatFecha(r.FechaServicio)}</p>
                      <p className="text-[10px] text-[#F5D5E0]/70">{r.HoraInicio || '--'} - {r.HoraFin || '--'} · {r.TotalHoras}h</p>
                      {r.MenorNombre && <p className="text-[10px] text-[#6667AB]"><Baby className="w-3 h-3 inline mr-0.5" />{r.MenorNombre}</p>}
                    </div>
                    <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-3 text-xs">
                      <p className="text-[#6667AB] mb-1">Estado de confirmación</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${confirmBadge(r.ConfirmadaFamilia)}`}>Familia {r.ConfirmadaFamilia ? '✓' : '✗'}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${confirmBadge(r.ConfirmadaCuidadora)}`}>Cuidadora {r.ConfirmadaCuidadora ? '✓' : '✗'}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${confirmBadge(r.FinalizadaFamilia)}`}>Fin Familia {r.FinalizadaFamilia ? '✓' : '✗'}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${confirmBadge(r.FinalizadaCuidadora)}`}>Fin Cuidadora {r.FinalizadaCuidadora ? '✓' : '✗'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Escrow fecha */}
                  <p className="text-[10px] text-[#6667AB]">
                    Creado: {formatFechaHora(r.EscrowFecha)}
                    {r.FechaLiberacion && <> · Liberado: {formatFechaHora(r.FechaLiberacion)}</>}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
