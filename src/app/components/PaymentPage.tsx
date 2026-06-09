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
      <div className="min-h-screen bg-gradient-to-br from-[#F7C2CA] via-[#9D85B6]/40 to-[#837AB6]/20">
        <header className="bg-[#250e2c]/80 backdrop-blur-xl border-b border-white/10 text-white sticky top-0 z-40 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 overflow-hidden rounded"><img src="/logo.png" alt="" className="w-full h-full object-cover" /></div>
                  <span className="text-lg font-extrabold text-[#f6a5c0] tracking-tight">CERTINANAS</span>
                </div>
                <span className="text-white/40 text-xl font-light hidden sm:inline">|</span>
                <span className="text-white/60 text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-xl border border-white/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white/80" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white/90 mb-2">Pago exitoso</h2>
          <p className="text-white/60 text-sm mb-8">
            El monto de <strong className="text-white">S/ {data?.Total.toFixed(2)}</strong> ha sido retenido.<br />
            Se liberará al confirmar la conformidad del servicio.
          </p>
          <button onClick={onBack} className="px-8 py-3 bg-[#cc8db3] hover:bg-[#b07a9a] text-white font-bold rounded-xl transition-all shadow-md">
            Volver a mis servicios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7C2CA] via-[#9D85B6]/40 to-[#837AB6]/20">
      {/* Navbar */}
      <header className="bg-[#250e2c]/80 backdrop-blur-xl border-b border-white/10 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 overflow-hidden rounded"><img src="/logo.png" alt="" className="w-full h-full object-cover" /></div>
                <span className="text-lg font-extrabold text-[#f6a5c0] tracking-tight">CERTINANAS</span>
              </div>
              <span className="text-white/40 text-xl font-light hidden sm:inline">|</span>
              <span className="text-white/60 text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
            </div>
            <nav className="flex items-center gap-6">
              <button className="text-sm text-white/70 hover:text-white transition-colors">Inicio</button>
              <button className="text-sm font-bold text-[#f6a5c0] border-b-2 border-[#f6a5c0] pb-0.5">Mis Servicios</button>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-2xl overflow-hidden">
          {/* Encabezado */}
          <div className="p-6 sm:p-8 pb-0">
            <div className="flex items-center gap-3 mb-1">
              <CreditCard className="w-6 h-6 text-[#f6a5c0]" />
              <h1 className="text-xl font-bold text-white/90">Pago con retención Escrow</h1>
            </div>
            <p className="text-sm text-white/60 ml-9">El monto será retenido hasta la conformidad del servicio</p>
          </div>

          {!data ? (
            <div className="p-6 sm:p-8 animate-pulse space-y-4">
              <div className="h-4 bg-white/20 rounded w-3/4"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="p-6 sm:p-8 space-y-6">
                {/* Resumen de Monto */}
                <div className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl p-6 text-center">
                  <p className="text-4xl font-extrabold text-white">S/ {data.Total.toFixed(2)}</p>
                  <p className="text-sm text-white/60 mt-1">{nroContrato} · {data.CuidadoraNombres} {data.CuidadoraApellidos?.charAt(0)}.</p>
                </div>

                {/* Número de tarjeta */}
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Número de tarjeta</label>
                  <input
                    type="text"
                    value={numero}
                    onChange={e => setNumero(formatCard(e.target.value))}
                    placeholder="4532 •••• •••• 7891"
                    className="w-full px-4 py-3 rounded-xl bg-white/30 border border-white/40 backdrop-blur-sm text-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc8db3] focus:bg-white/50 placeholder-white/40 font-mono"
                    required
                  />
                </div>

                {/* Vencimiento y CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-1.5">Vencimiento</label>
                    <input
                      type="text"
                      value={vencimiento}
                      onChange={e => setVencimiento(formatExpiry(e.target.value))}
                      placeholder="08/28"
                      className="w-full px-4 py-3 rounded-xl bg-white/30 border border-white/40 backdrop-blur-sm text-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc8db3] focus:bg-white/50 placeholder-white/40 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-1.5">CVV</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="•••"
                      className="w-full px-4 py-3 rounded-xl bg-white/30 border border-white/40 backdrop-blur-sm text-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc8db3] focus:bg-white/50 placeholder-white/40 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Seguridad */}
                <div className="bg-[#f6a5c0]/10 backdrop-blur-sm border border-white/30 rounded-xl p-4 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-white/80 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/80">
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
                      ? 'bg-white/20 text-white/40 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#837ab6] via-[#9d85b6] to-[#f6a5c0] text-white hover:shadow-lg cursor-pointer'
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
