import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { LogOut, FileSignature, Wallet, CheckCircle, ListTodo } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';
import { TareasResumen } from './ChecklistTareas';

type ContratoData = {
  Id: number; FechaServicio: string; TotalHoras: number; TarifaHora: number;
  Subtotal: number; TarifaPlataforma: number; Total: number; Estado: string;
  HoraInicio: string; HoraFin: string; TipoServicio: string;
  CuidadoraId: number; CuidadoraNombres: string; CuidadoraApellidos: string;
  MenorNombre: string | null; MenorDiagnostico: string | null; MenorFechaNac: string | null;
  FamiliaNombres: string; FamiliaApellidos: string;
  TareaIds?: number[];
};

export function ContractPage({ orderId, onBack, onProceedToPayment }: { orderId?: number; onBack?: () => void; onProceedToPayment?: () => void }) {
  const { user, logout } = useAuth();
  const [data, setData] = useState<ContratoData | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const handleProceed = async () => {
    if (!accepted || !data || accepting) return;
    setAccepting(true);
    try {
      const r = await fetch(`/api/familia/orden/${data.Id}/aceptar`, {
        method: 'POST', headers: { 'x-user-id': String(user?.id) },
      });
      if (r.ok) onProceedToPayment?.();
    } finally { setAccepting(false); }
  };

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
    Pendiente: 'bg-[#F6A5C0] text-[#210635]', Confirmada: 'bg-[#CC8DB3] text-[#210635]',
    'En curso': 'bg-[#CC8DB3] text-[#210635]',
    Finalizada: 'bg-[rgba(16,185,129,0.2)] text-[#6EE7B7]', Completada: 'bg-[rgba(16,185,129,0.2)] text-[#6EE7B7]',
    Pagada: 'bg-[rgba(16,185,129,0.2)] text-[#6EE7B7]', Cancelada: 'bg-[#CC8DB3] text-[#210635]',
  };

  const nroContrato = data ? `CTN-2026-${String(data.Id).padStart(4, '0')}` : '---';

  return (
    <div className="min-h-screen bg-linear-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
      <header className="bg-[#210635]/80 backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.1)] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 overflow-hidden rounded">
                  <img src="/logo.png" alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-lg font-extrabold text-[#F6A5C0] tracking-tight">CERTINANAS</span>
              </div>
              <span className="text-[#6667AB] text-xl font-light hidden sm:inline">|</span>
              <span className="text-[#6667AB] text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
            </div>
            <nav className="flex items-center gap-6">
              <button onClick={onBack} className="text-sm text-[#F5D5E0]/70 hover:text-white transition-colors">Inicio</button>
              <button onClick={onBack} className="text-sm font-bold text-[#F6A5C0] border-b-2 border-[#F6A5C0] pb-0.5">Mis Servicios</button>
              <button onClick={onBack} className="text-sm text-[#F5D5E0]/70 hover:text-white transition-colors">Mensajes</button>
              <ProfileAvatar size={36} className="ml-2" />
              <button onClick={logout} className="p-2 hover:bg-[rgba(33,6,53,0.4)] rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-[#6667AB]" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={onBack} className="mb-4 text-sm text-[#6667AB] hover:text-white transition-colors flex items-center gap-1">
          ← Volver a mis servicios
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-1">
              <FileSignature className="w-6 h-6 text-[#F6A5C0]" />
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">Contrato de Servicio N° {nroContrato}</h1>
                {data && (
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${badgeClass[data.Estado] || 'bg-[#F6A5C0] text-[#210635]'}`}>
                    {statusLabel[data.Estado] || data.Estado}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-[#6667AB] ml-9">Generado automáticamente por CERTINANAS</p>
          </div>

          {!data ? (
            <div className="px-6 sm:px-8 pb-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-[rgba(33,6,53,0.5)] rounded w-3/4"></div>
                <div className="h-4 bg-[rgba(33,6,53,0.5)] rounded w-1/2"></div>
                <div className="h-4 bg-[rgba(33,6,53,0.5)] rounded w-2/3"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="mx-6 sm:mx-8 mb-6 bg-[rgba(246,165,192,0.15)] backdrop-blur-sm border border-[rgba(246,165,192,0.3)] rounded-2xl p-5 space-y-3">
                <div>
                  <span className="text-xs font-semibold text-[#F5D5E0]/70 uppercase tracking-wider">Familia contratante</span>
                  <p className="text-sm font-semibold text-white mt-0.5">{data.FamiliaNombres} {data.FamiliaApellidos}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#F5D5E0]/70 uppercase tracking-wider">Cuidadora</span>
                  <p className="text-sm font-semibold text-white mt-0.5">{data.CuidadoraNombres} {data.CuidadoraApellidos}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#F5D5E0]/70 uppercase tracking-wider">Menor</span>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {data.MenorNombre || 'No especificado'}
                    {data.MenorDiagnostico && <span className="text-[#6667AB] font-normal"> ({data.MenorDiagnostico})</span>}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#F5D5E0]/70 uppercase tracking-wider">Servicio</span>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {formatFecha(data.FechaServicio)} · {data.HoraInicio || '--'}-{data.HoraFin || '--'} · {data.TipoServicio}
                  </p>
                </div>
              </div>

              {data.TareaIds && data.TareaIds.length > 0 && (
                <div className="mx-6 sm:mx-8 mb-6 bg-[rgba(246,165,192,0.15)] backdrop-blur-sm border border-[rgba(246,165,192,0.3)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ListTodo className="w-4 h-4 text-[#F6A5C0]" />
                    <span className="text-xs font-bold text-[#F5D5E0]/70 uppercase tracking-wider">Tareas seleccionadas</span>
                  </div>
                  <TareasResumen ids={data.TareaIds} />
                </div>
              )}

              <div className="mx-6 sm:mx-8 mb-6 bg-[rgba(246,165,192,0.15)] backdrop-blur-sm border border-[rgba(246,165,192,0.3)] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-[#F5D5E0]/80" />
                  <span className="text-lg font-bold text-white">Monto total: S/ {data.Total.toFixed(2)}</span>
                </div>
                <p className="text-sm text-[#F5D5E0]/70">
                  Comisión CERTINANAS: S/ {data.TarifaPlataforma.toFixed(2)} · Pago a cuidadora: S/ {data.Subtotal.toFixed(2)}
                </p>
              </div>

              <div className="mx-6 sm:mx-8 mb-6 bg-[rgba(246,165,192,0.15)] backdrop-blur-sm border border-[rgba(246,165,192,0.3)] rounded-2xl p-5">
                <p className="text-xs text-[#F5D5E0]/70 leading-relaxed">
                  <strong className="text-white">Términos del Servicio Escrow:</strong> Al aceptar, el monto será retenido por la pasarela de pagos hasta la conformidad del servicio. La liberación se realizará al cierre sin incidencias graves pendientes, conforme a la RN-16 del negocio CERTINANAS.
                </p>
              </div>

              <div className="mx-6 sm:mx-8 mb-6 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={accepted}
                  onChange={e => setAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[rgba(255,255,255,0.3)] bg-[rgba(33,6,53,0.5)] text-[#CC8DB3] focus:ring-[#7B337E]/40 accent-[#CC8DB3]"
                />
                <label htmlFor="terms" className="text-sm text-[#F5D5E0]/70 cursor-pointer select-none">
                  Acepto los Términos del Servicio y la Política de Datos Sensibles (Ley N° 29733).
                </label>
              </div>
            </>
          )}

          <div className="px-6 sm:px-8 pb-8">
            {data && (data.Estado === 'Pagada' || data.Estado === 'Completada' || data.Estado === 'Finalizada') ? (
              <div className="text-center py-3 bg-[rgba(16,185,129,0.2)] backdrop-blur-sm border border-[rgba(16,185,129,0.3)] rounded-xl">
                <p className="text-sm font-semibold text-[#6EE7B7]">✓ Servicio pagado</p>
              </div>
            ) : (
              <motion.button
                whileHover={accepted && !accepting ? { scale: 1.01 } : {}}
                whileTap={accepted && !accepting ? { scale: 0.99 } : {}}
                disabled={!accepted || accepting}
                onClick={handleProceed}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                  accepted
                    ? 'bg-[#F6A5C0] text-[#210635] hover:shadow-lg cursor-pointer'
                    : 'bg-[rgba(33,6,53,0.5)] text-[#6667AB] cursor-not-allowed'
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
