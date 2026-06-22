import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Lock, Shield, CheckCircle, CreditCard, Upload, Info, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type PaymentEscrowProps = {
  orderId: number;
  subtotal: number;
  tarifaPlataforma: number;
  total: number;
  cuidadoraNombre: string;
  onSuccess?: () => void;
  onBack?: () => void;
};

type PaymentMethod = 'card' | 'yape' | 'plin';

export function PaymentEscrow({ orderId, subtotal, tarifaPlataforma, total, cuidadoraNombre, onSuccess, onBack }: PaymentEscrowProps) {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };

  const [method, setMethod] = useState<PaymentMethod>('card');
  const [numero, setNumero] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [comprobante, setComprobante] = useState<File | null>(null);

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
      const payload: any = { metodoPago: method };

      if (method === 'card') {
        payload.numeroTarjeta = numero.replace(/\s/g, '');
        payload.vencimiento = vencimiento;
        payload.cvv = cvv;
      }

      if ((method === 'yape' || method === 'plin') && comprobante) {
        const formData = new FormData();
        formData.append('metodoPago', method);
        formData.append('comprobante', comprobante);
        await fetch(`/api/familia/pagar/${orderId}`, {
          method: 'POST',
          headers: { 'x-user-id': String(user?.id) },
          body: formData,
        });
        setDone(true);
        setLoading(false);
        onSuccess?.();
        return;
      }

      const r = await fetch(`/api/familia/pagar/${orderId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error('Error al procesar el pago');
      setDone(true);
      onSuccess?.();
    } catch {
      alert('Error al procesar el pago. Intente nuevamente.');
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="text-center py-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] flex items-center justify-center mx-auto mb-5"
        >
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </motion.div>
        <h3 className="text-xl font-bold text-white mb-2">Pago retenido con éxito</h3>
        <p className="text-sm text-[#F5D5E0]/70 mb-1">
          S/ {total.toFixed(2)} retenidos en Escrow
        </p>
        <p className="text-xs text-[#6667AB] mb-6">
          Se liberarán al confirmar la conformidad del servicio con {cuidadoraNombre}
        </p>
        {onBack && (
          <button onClick={onBack}
            className="px-6 py-2.5 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:bg-[#F6A5C0]/80 transition-all"
          >Volver a servicios</button>
        )}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-hidden"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-1">
          <CreditCard className="w-6 h-6 text-[#F6A5C0]" />
          <h2 className="text-xl font-bold text-white">Pago Seguro Escrow</h2>
        </div>
        <p className="text-sm text-[#6667AB] ml-9 mb-6">Tu pago está protegido hasta que confirmes el servicio</p>

        {/* Escrow info banner */}
        <div className="bg-[rgba(246,165,192,0.12)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] rounded-xl p-4 flex gap-3 mb-6">
          <Shield className="w-5 h-5 text-[#F6A5C0] shrink-0 mt-0.5" />
          <p className="text-xs text-[#F5D5E0]/80 leading-relaxed">
            <strong className="text-white">¿Cómo funciona?</strong> El monto se retiene de forma segura. <strong>No se entrega a la cuidadora</strong> hasta que confirmes que el servicio se completó satisfactoriamente. Si hay algún problema, recibes un reembolso completo.
          </p>
        </div>

        {/* Payment summary */}
        <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#F5D5E0]/60">Subtotal</span>
            <span className="text-white">S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#F5D5E0]/60">Tarifa plataforma (15%)</span>
            <span className="text-white">S/ {tarifaPlataforma.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-[rgba(255,255,255,0.1)]">
            <span className="text-white">Total a retener</span>
            <span className="text-[#F6A5C0]">S/ {total.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Payment methods */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {(['card', 'yape', 'plin'] as PaymentMethod[]).map(m => (
              <button key={m} type="button" onClick={() => setMethod(m)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  method === m
                    ? 'border-[#F6A5C0] bg-[rgba(246,165,192,0.12)]'
                    : 'border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.25)]'
                }`}
              >
                <p className="text-xs font-bold text-white capitalize">{m === 'card' ? 'Tarjeta' : m}</p>
                <p className="text-[9px] text-[#6667AB] mt-0.5">
                  {m === 'card' ? 'Crédito/Débito' : m === 'yape' ? 'Yape' : 'Plin'}
                </p>
              </button>
            ))}
          </div>

          {method === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-[#F5D5E0] block mb-1">Número de tarjeta</label>
                <input type="text" value={numero} onChange={e => setNumero(formatCard(e.target.value))}
                  placeholder="4532 1234 5678 9012"
                  className="w-full px-3 py-2.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm placeholder:text-[#6667AB] font-mono focus:outline-none focus:ring-1 focus:ring-[#F6A5C0]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-[#F5D5E0] block mb-1">Vencimiento</label>
                  <input type="text" value={vencimiento} onChange={e => setVencimiento(formatExpiry(e.target.value))}
                    placeholder="08/28"
                    className="w-full px-3 py-2.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm placeholder:text-[#6667AB] font-mono focus:outline-none focus:ring-1 focus:ring-[#F6A5C0]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#F5D5E0] block mb-1">CVV</label>
                  <input type="password" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="•••"
                    className="w-full px-3 py-2.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm placeholder:text-[#6667AB] font-mono focus:outline-none focus:ring-1 focus:ring-[#F6A5C0]"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {(method === 'yape' || method === 'plin') && (
            <div className="space-y-3">
              <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4 text-center border border-dashed border-[rgba(255,255,255,0.12)]">
                <p className="text-sm text-[#F5D5E0]/70 mb-1">Paga con {method === 'yape' ? 'Yape' : 'Plin'}</p>
                <p className="text-[10px] text-[#6667AB] mb-3">Número: +51 987 654 321</p>
                <div className="w-36 h-36 bg-[rgba(255,255,255,0.05)] rounded-xl mx-auto flex items-center justify-center border border-[rgba(255,255,255,0.1)] mb-3">
                  <CreditCard className="w-8 h-8 text-[#6667AB]" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#F5D5E0] block mb-1">Subir comprobante de pago</label>
                <div className="border-2 border-dashed border-[rgba(255,255,255,0.12)] rounded-xl p-4 text-center cursor-pointer hover:border-[#F6A5C0]/40 transition-all"
                  onClick={() => document.getElementById('comprobante-upload')?.click()}
                >
                  {comprobante ? (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Upload className="w-4 h-4 text-[#F6A5C0]" />
                      <span className="text-white text-xs">{comprobante.name}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setComprobante(null); }}
                        className="text-red-400 hover:text-red-300"
                      ><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-[#6667AB] mx-auto mb-1" />
                      <p className="text-xs text-[#6667AB]">Sube la captura del comprobante</p>
                      <p className="text-[10px] text-[#6667AB]/60">PNG, JPG, PDF</p>
                    </>
                  )}
                  <input id="comprobante-upload" type="file" accept=".png,.jpg,.jpeg,.pdf" className="hidden"
                    onChange={e => setComprobante(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-4 mb-5 p-3 rounded-xl bg-[rgba(102,103,171,0.12)]">
            <Lock className="w-4 h-4 text-[#F6A5C0] shrink-0" />
            <p className="text-[10px] text-[#F5D5E0]/70">Pago 100% seguro. Los fondos quedan en custodia (Escrow) hasta tu conformidad.</p>
          </div>

          <button type="submit" disabled={loading || (method === 'card' && numero.replace(/\s/g, '').length < 13) || ((method === 'yape' || method === 'plin') && !comprobante)}
            className="w-full py-3 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:bg-[#F6A5C0]/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Procesando...
              </span>
            ) : 'Confirmar Pago'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
