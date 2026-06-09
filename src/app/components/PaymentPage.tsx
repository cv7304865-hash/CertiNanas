import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { LogOut, CreditCard, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';

type ContratoData = {
  Id: number; Total: number; CuidadoraNombres: string; CuidadoraApellidos: string;
};

export function PaymentPage({ orderId, onBack, onSuccess }: { orderId?: number; onBack?: () => void; onSuccess?: () => void }) {
  const { user, logout } = useAuth();
  const [data, setData] = useState<ContratoData | null>(null);
  const [numero, setNumero] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/familia/solicitudes/${orderId}`, { headers: { 'x-user-id': String(user?.id) } })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  }, [orderId]);

  const formatCard = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simular pago
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setDone(true);
  };

  const nroContrato = data ? `CTN-2026-${String(data.Id).padStart(4, '0')}` : '---';

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-[#1E293B] text-white sticky top-0 z-40 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 overflow-hidden rounded"><img src="/logo.png" alt="" className="w-full h-full object-cover" /></div>
                  <span className="text-lg font-extrabold text-[#F59E0B] tracking-tight">CERTINANAS</span>
                </div>
                <span className="text-white/40 text-xl font-light hidden sm:inline">|</span>
                <span className="text-white/60 text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pago exitoso</h2>
          <p className="text-gray-500 text-sm mb-8">
            El monto de <strong className="text-gray-700">S/ {data?.Total.toFixed(2)}</strong> ha sido retenido.<br />
            Se liberará al confirmar la conformidad del servicio.
          </p>
          <button onClick={onBack} className="px-8 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl transition-all shadow-md">
            Volver a mis servicios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-[#1E293B] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 overflow-hidden rounded"><img src="/logo.png" alt="" className="w-full h-full object-cover" /></div>
                <span className="text-lg font-extrabold text-[#F59E0B] tracking-tight">CERTINANAS</span>
              </div>
              <span className="text-white/40 text-xl font-light hidden sm:inline">|</span>
              <span className="text-white/60 text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
            </div>
            <nav className="flex items-center gap-6">
              <button className="text-sm text-white/70 hover:text-white transition-colors">Inicio</button>
              <button className="text-sm font-bold text-[#F59E0B] border-b-2 border-[#F59E0B] pb-0.5">Mis Servicios</button>
              <button className="text-sm text-white/70 hover:text-white transition-colors">Mensajes</button>
              <ProfileAvatar size={36} className="ml-2" />
              <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-white/60" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Encabezado */}
          <div className="p-6 sm:p-8 pb-0">
            <div className="flex items-center gap-3 mb-1">
              <CreditCard className="w-6 h-6 text-[#F59E0B]" />
              <h1 className="text-xl font-bold text-gray-900">Pago con retención Escrow</h1>
            </div>
            <p className="text-sm text-gray-400 ml-9">El monto será retenido hasta la conformidad del servicio</p>
          </div>

          {!data ? (
            <div className="p-6 sm:p-8 animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="p-6 sm:p-8 space-y-6">
                {/* Resumen de Monto */}
                <div className="border-2 border-[#F59E0B] rounded-xl p-6 text-center">
                  <p className="text-4xl font-extrabold text-[#F59E0B]">S/ {data.Total.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">{nroContrato} · {data.CuidadoraNombres} {data.CuidadoraApellidos?.charAt(0)}.</p>
                </div>

                {/* Número de tarjeta */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Número de tarjeta</label>
                  <input
                    type="text"
                    value={numero}
                    onChange={e => setNumero(formatCard(e.target.value))}
                    placeholder="4532 •••• •••• 7891"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40 font-mono"
                    required
                  />
                </div>

                {/* Vencimiento y CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vencimiento</label>
                    <input
                      type="text"
                      value={vencimiento}
                      onChange={e => setVencimiento(formatExpiry(e.target.value))}
                      placeholder="08/28"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">CVV</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="•••"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Seguridad */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    Pago seguro · Los fondos quedan en custodia (Escrow) hasta que confirmes el cierre del servicio.
                  </p>
                </div>
              </div>

              {/* Botón */}
              <div className="px-6 sm:px-8 pb-8">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading || numero.replace(/\s/g, '').length < 13}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                    loading || numero.replace(/\s/g, '').length < 13
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#F59E0B] hover:bg-[#D97706] text-white hover:shadow-lg cursor-pointer'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Procesando...
                    </span>
                  ) : 'Confirmar pago retenido'}
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
