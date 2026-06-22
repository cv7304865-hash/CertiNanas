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
    try {
      const r = await fetch(`/api/familia/pagar/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) },
      });
      if (!r.ok) throw new Error('Error al procesar el pago');
      await new Promise(r => setTimeout(r, 1000));
      setDone(true);
    } catch {
      alert('Error al procesar el pago. Intente nuevamente.');
    }
    setLoading(false);
  };

  const nroContrato = data ? `CTN-2026-${String(data.Id).padStart(4, '0')}` : '---';

  if (done) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
        <header className="bg-[#210635]/80 backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.1)] text-white sticky top-0 z-40 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 overflow-hidden rounded"><img src="/logo.png" alt="" className="w-full h-full object-cover" /></div>
                  <span className="text-lg font-extrabold text-[#F6A5C0] tracking-tight">CERTINANAS</span>
                </div>
                <span className="text-[#6667AB] text-xl font-light hidden sm:inline">|</span>
                <span className="text-[#6667AB] text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#F5D5E0]/80" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Pago exitoso</h2>
          <p className="text-[#6667AB] text-sm mb-8">
            El monto de <strong className="text-white">S/ {data?.Total.toFixed(2)}</strong> ha sido retenido.<br />
            Se liberará al confirmar la conformidad del servicio.
          </p>
          <button onClick={onBack} className="px-8 py-3 bg-[#CC8DB3] hover:bg-[#b07a9a] text-[#210635] font-bold rounded-xl transition-all shadow-md">
            Volver a mis servicios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
      <header className="bg-[#210635]/80 backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.1)] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 overflow-hidden rounded"><img src="/logo.png" alt="" className="w-full h-full object-cover" /></div>
                <span className="text-lg font-extrabold text-[#F6A5C0] tracking-tight">CERTINANAS</span>
              </div>
              <span className="text-[#6667AB] text-xl font-light hidden sm:inline">|</span>
              <span className="text-[#6667AB] text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
            </div>
            <nav className="flex items-center gap-6">
              <button className="text-sm text-[#F5D5E0]/70 hover:text-white transition-colors">Inicio</button>
              <button className="text-sm font-bold text-[#F6A5C0] border-b-2 border-[#F6A5C0] pb-0.5">Mis Servicios</button>
              <button className="text-sm text-[#F5D5E0]/70 hover:text-white transition-colors">Mensajes</button>
              <ProfileAvatar size={36} className="ml-2" />
              <button onClick={logout} className="p-2 hover:bg-[rgba(33,6,53,0.4)] rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-[#6667AB]" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8 pb-0">
            <div className="flex items-center gap-3 mb-1">
              <CreditCard className="w-6 h-6 text-[#F6A5C0]" />
              <h1 className="text-xl font-bold text-white">Pago con retención Escrow</h1>
            </div>
            <p className="text-sm text-[#6667AB] ml-9">El monto será retenido hasta la conformidad del servicio</p>
          </div>

          {!data ? (
            <div className="p-6 sm:p-8 animate-pulse space-y-4">
              <div className="h-4 bg-[rgba(33,6,53,0.5)] rounded w-3/4"></div>
              <div className="h-4 bg-[rgba(33,6,53,0.5)] rounded w-1/2"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="p-6 sm:p-8 space-y-6">
                <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6 text-center">
                  <p className="text-4xl font-extrabold text-white">S/ {data.Total.toFixed(2)}</p>
                  <p className="text-sm text-[#6667AB] mt-1">{nroContrato} · {data.CuidadoraNombres} {data.CuidadoraApellidos?.charAt(0)}.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#F5D5E0] mb-1.5">Número de tarjeta</label>
                  <input
                    type="text"
                    value={numero}
                    onChange={e => setNumero(formatCard(e.target.value))}
                    placeholder="4532 •••• •••• 7891"
                    className="w-full px-4 py-3 rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] placeholder:text-[#6667AB] font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#F5D5E0] mb-1.5">Vencimiento</label>
                    <input
                      type="text"
                      value={vencimiento}
                      onChange={e => setVencimiento(formatExpiry(e.target.value))}
                      placeholder="08/28"
                      className="w-full px-4 py-3 rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] placeholder:text-[#6667AB] font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#F5D5E0] mb-1.5">CVV</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="•••"
                      className="w-full px-4 py-3 rounded-xl bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] placeholder:text-[#6667AB] font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="bg-[rgba(246,165,192,0.15)] backdrop-blur-sm border border-[rgba(255,255,255,0.2)] rounded-xl p-4 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-[#F5D5E0]/80 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-[#F5D5E0]/80">
                    Pago seguro · Los fondos quedan en custodia (Escrow) hasta que confirmes el cierre del servicio.
                  </p>
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-8">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading || numero.replace(/\s/g, '').length < 13}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                    loading || numero.replace(/\s/g, '').length < 13
                      ? 'bg-[rgba(33,6,53,0.5)] text-[#6667AB] cursor-not-allowed'
                      : 'bg-[#F6A5C0] text-[#210635] hover:shadow-lg cursor-pointer'
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
