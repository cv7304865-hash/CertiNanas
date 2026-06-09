import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { LogOut, FileSignature, Wallet, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';

type ContratoData = {
  Id: number; FechaServicio: string; TotalHoras: number; TarifaHora: number;
  Subtotal: number; TarifaPlataforma: number; Total: number; Estado: string;
  HoraInicio: string; HoraFin: string; TipoServicio: string;
  CuidadoraId: number; CuidadoraNombres: string; CuidadoraApellidos: string;
  MenorNombre: string | null; MenorDiagnostico: string | null; MenorFechaNac: string | null;
  FamiliaNombres: string; FamiliaApellidos: string;
};

export function ContractPage({ orderId, onBack, onProceedToPayment }: { orderId?: number; onBack?: () => void; onProceedToPayment?: () => void }) {
  const { user, logout } = useAuth();
  const [data, setData] = useState<ContratoData | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/familia/solicitudes/${orderId}`, { headers: { 'x-user-id': String(user?.id) } })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  }, [orderId]);

  const formatFecha = (f: string) => {
    const d = new Date(f + 'T00:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const statusLabel: Record<string, string> = {
    Pendiente: 'Pendiente', Confirmada: 'Confirmada', 'En curso': 'En curso',
    Finalizada: 'Pagado', Completada: 'Pagado', Pagada: 'Pagado', Cancelada: 'Cancelada',
  };
  const badgeClass: Record<string, string> = {
    Pendiente: 'bg-[#f6a5c0] text-white', Confirmada: 'bg-[#cc8db3] text-white',
    'En curso': 'bg-[#9d85b6] text-white',
    Finalizada: 'bg-emerald-500 text-white', Completada: 'bg-emerald-500 text-white',
    Pagada: 'bg-emerald-500 text-white', Cancelada: 'bg-[#cc8db3] text-white',
  };

  const nroContrato = data ? `CTN-2026-${String(data.Id).padStart(4, '0')}` : '---';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7C2CA] via-[#9D85B6]/40 to-[#837AB6]/20">
      {/* Navbar */}
      <header className="bg-[#250e2c]/80 backdrop-blur-xl border-b border-white/10 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 overflow-hidden rounded">
                  <img src="/logo.png" alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-lg font-extrabold text-[#f6a5c0] tracking-tight">CERTINANAS</span>
              </div>
              <span className="text-white/40 text-xl font-light hidden sm:inline">|</span>
              <span className="text-white/60 text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
            </div>
            <nav className="flex items-center gap-6">
              <button onClick={onBack} className="text-sm text-white/70 hover:text-white transition-colors">Inicio</button>
              <button onClick={onBack} className="text-sm font-bold text-[#f6a5c0] border-b-2 border-[#f6a5c0] pb-0.5">Mis Servicios</button>
              <button onClick={onBack} className="text-sm text-white/70 hover:text-white transition-colors">Mensajes</button>
              <ProfileAvatar size={36} className="ml-2" />
              <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-white/60" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={onBack} className="mb-4 text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1">
          ← Volver a mis servicios
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-2xl overflow-hidden">
          {/* Encabezado */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-1">
              <FileSignature className="w-6 h-6 text-[#f6a5c0]" />
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white/90">Contrato de Servicio N° {nroContrato}</h1>
                {data && (
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${badgeClass[data.Estado] || 'bg-[#f6a5c0] text-white'}`}>
                    {statusLabel[data.Estado] || data.Estado}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-white/60 ml-9">Generado automáticamente por CERTINANAS</p>
          </div>

          {!data ? (
            <div className="px-6 sm:px-8 pb-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-4 bg-white/20 rounded w-1/2"></div>
                <div className="h-4 bg-white/20 rounded w-2/3"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Datos del Servicio */}
              <div className="mx-6 sm:mx-8 mb-6 bg-[#f6a5c0]/20 backdrop-blur-sm border border-[#f6a5c0]/30 rounded-2xl p-5 space-y-3">
                <div>
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Familia contratante</span>
                  <p className="text-sm font-semibold text-white/90 mt-0.5">{data.FamiliaNombres} {data.FamiliaApellidos}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Cuidadora</span>
                  <p className="text-sm font-semibold text-white/90 mt-0.5">{data.CuidadoraNombres} {data.CuidadoraApellidos}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Menor</span>
                  <p className="text-sm font-semibold text-white/90 mt-0.5">
                    {data.MenorNombre || 'No especificado'}
                    {data.MenorDiagnostico && <span className="text-white/50 font-normal"> ({data.MenorDiagnostico})</span>}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Servicio</span>
                  <p className="text-sm font-semibold text-white/90 mt-0.5">
                    {formatFecha(data.FechaServicio)} · {data.HoraInicio || '--'}-{data.HoraFin || '--'} · {data.TipoServicio}
                  </p>
                </div>
              </div>

              {/* Desglose Económico */}
              <div className="mx-6 sm:mx-8 mb-6 bg-[#f6a5c0]/20 backdrop-blur-sm border border-[#f6a5c0]/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-white/80" />
                  <span className="text-lg font-bold text-white">Monto total: S/ {data.Total.toFixed(2)}</span>
                </div>
                <p className="text-sm text-white/70">
                  Comisión CERTINANAS: S/ {data.TarifaPlataforma.toFixed(2)} · Pago a cuidadora: S/ {data.Subtotal.toFixed(2)}
                </p>
              </div>

              {/* Términos Escrow */}
              <div className="mx-6 sm:mx-8 mb-6 bg-[#f6a5c0]/20 backdrop-blur-sm border border-[#f6a5c0]/30 rounded-2xl p-5">
                <p className="text-xs text-white/70 leading-relaxed">
                  <strong className="text-white/90">Términos del Servicio Escrow:</strong> Al aceptar, el monto será retenido por la pasarela de pagos hasta la conformidad del servicio. La liberación se realizará al cierre sin incidencias graves pendientes, conforme a la RN-16 del negocio CERTINANAS.
                </p>
              </div>

              {/* Checkbox */}
              <div className="mx-6 sm:mx-8 mb-6 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={accepted}
                  onChange={e => setAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/40 bg-white/30 text-[#cc8db3] focus:ring-[#cc8db3]/40 accent-[#cc8db3]"
                />
                <label htmlFor="terms" className="text-sm text-white/70 cursor-pointer select-none">
                  Acepto los Términos del Servicio y la Política de Datos Sensibles (Ley N° 29733).
                </label>
              </div>
            </>
          )}

          {/* Botón */}
          <div className="px-6 sm:px-8 pb-8">
            {data && (data.Estado === 'Pagada' || data.Estado === 'Completada' || data.Estado === 'Finalizada') ? (
              <div className="text-center py-3 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl">
                <p className="text-sm font-semibold text-emerald-300">✓ Servicio pagado</p>
              </div>
            ) : (
              <motion.button
                whileHover={accepted ? { scale: 1.01 } : {}}
                whileTap={accepted ? { scale: 0.99 } : {}}
                disabled={!accepted}
                onClick={onProceedToPayment}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                  accepted
                    ? 'bg-gradient-to-r from-[#837ab6] via-[#9d85b6] to-[#f6a5c0] text-white hover:shadow-lg cursor-pointer'
                    : 'bg-white/20 text-white/40 cursor-not-allowed'
                }`}
              >
                Firmar y proceder al pago
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
