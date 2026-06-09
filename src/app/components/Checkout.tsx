import { motion } from 'motion/react';
import { Lock, Shield, CheckCircle2, CreditCard, Info, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

type Props = { onBack: () => void };

export function Checkout({ onBack }: Props) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'yape'>('card');
  const [success, setSuccess] = useState(false);

  const service = {
    nana: 'Carmen Rodríguez',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    type: 'Terapia de estimulación',
    date: 'Sáb 23 Mayo · 09:00 - 13:00',
    hours: 4,
    rate: 30,
  };

  const subtotal = service.hours * service.rate;
  const fee = subtotal * 0.08;
  const total = subtotal + fee;

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/30 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-3xl border border-white/20 shadow-sm p-12">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#f6a5c0]/30 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#cc8db3]" />
          </div>
          <h1 className="text-3xl font-bold text-[#250e2c] mb-3">Pago retenido con éxito</h1>
          <p className="text-[#250e2c]/70 mb-2 leading-relaxed">
            S/ {total.toFixed(2)} se mantienen seguros en nuestra cuenta Escrow.
          </p>
          <p className="text-sm text-[#250e2c]/60 mb-8">
            El monto será liberado a {service.nana} solo cuando confirmes que el servicio finalizó satisfactoriamente.
          </p>
          <button onClick={onBack} className="px-6 py-3 bg-[#cc8db3] text-white rounded-xl font-bold hover:bg-[#b07a9a] transition-colors">
            Volver al Panel
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-[#250e2c]/70 hover:text-[#250e2c] mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Volver
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#250e2c] tracking-tight">Pago Seguro Escrow</h1>
        <p className="text-[#250e2c]/60 mt-1 inline-flex items-center gap-2 text-sm">
          <Lock className="w-4 h-4 text-[#cc8db3]" /> Conexión cifrada SSL · Tu dinero protegido hasta confirmar el servicio
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-6">
          {/* Escrow Banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-[#f6a5c0]/30 rounded-2xl p-5 flex gap-4">
            <div className="w-12 h-12 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-[#cc8db3]" />
            </div>
            <div>
              <h3 className="font-bold text-[#250e2c] mb-1">¿Cómo funciona Escrow?</h3>
              <p className="text-sm text-[#250e2c] leading-relaxed">
                Tu pago se retiene de forma segura en nuestra plataforma. <strong>El dinero NO se entrega a la cuidadora</strong> hasta que confirmes que el servicio se realizó con éxito. Si algo sale mal, recibes un reembolso completo.
              </p>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-2xl border border-white/20 shadow-sm p-6">
            <h2 className="font-bold text-[#250e2c] mb-4">Método de pago</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  paymentMethod === 'card' ? 'border-[#250e2c] bg-[#f6a5c0]/20/40' : 'border-white/20 hover:border-white/30'
                }`}
              >
                <CreditCard className={`w-5 h-5 mb-2 ${paymentMethod === 'card' ? 'text-[#250e2c]' : 'text-[#250e2c]/50'}`} />
                <p className="font-bold text-sm">Tarjeta</p>
                <p className="text-xs text-[#250e2c]/60">Visa, Mastercard</p>
              </button>
              <button
                onClick={() => setPaymentMethod('yape')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  paymentMethod === 'yape' ? 'border-[#250e2c] bg-[#f6a5c0]/20/40' : 'border-white/20 hover:border-white/30'
                }`}
              >
                <div className={`w-5 h-5 mb-2 rounded ${paymentMethod === 'yape' ? 'bg-[#250e2c]' : 'bg-gray-300'}`} />
                <p className="font-bold text-sm">Yape / Plin</p>
                <p className="text-xs text-[#250e2c]/60">Transferencia inmediata</p>
              </button>
            </div>

            {paymentMethod === 'card' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#250e2c] mb-1.5">Número de tarjeta</label>
                  <input placeholder="1234 5678 9012 3456" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#250e2c]/30 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#250e2c] mb-1.5">Vencimiento</label>
                    <input placeholder="MM / AA" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#250e2c]/30 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#250e2c] mb-1.5">CVV</label>
                    <input placeholder="123" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#250e2c]/30 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#250e2c] mb-1.5">Nombre en la tarjeta</label>
                  <input placeholder="Como aparece en la tarjeta" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#250e2c]/30 outline-none" />
                </div>
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 text-center">
                <p className="text-sm text-[#250e2c]/70 mb-2">Escanea el QR desde tu app Yape o Plin</p>
                <div className="w-40 h-40 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl mx-auto border-2 border-dashed border-white/30 flex items-center justify-center text-xs text-[#250e2c]/50">
                  QR de pago
                </div>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Lock, t: 'Cifrado SSL 256-bit' },
              { icon: Shield, t: 'Garantía Escrow' },
              { icon: CheckCircle2, t: 'Reembolso 100%' },
            ].map((b) => (
              <div key={b.t} className="bg-white border border-white/20 rounded-xl p-3 flex items-center gap-2 shadow-sm">
                <b.icon className="w-5 h-5 text-[#cc8db3] shrink-0" />
                <span className="text-xs font-bold text-[#250e2c]">{b.t}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Summary */}
        <motion.aside initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-2xl border border-white/20 shadow-sm p-6 h-fit sticky top-28">
          <h2 className="font-bold text-[#250e2c] mb-5">Resumen del servicio</h2>

          <div className="flex items-center gap-3 pb-5 border-b border-white/20">
            <img src={service.photo} alt={service.nana} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="font-bold text-sm">{service.nana}</p>
              <p className="text-xs text-[#250e2c]/60">{service.type}</p>
            </div>
          </div>

          <div className="py-4 border-b border-white/20 space-y-2 text-sm">
            <div className="flex justify-between text-[#250e2c]/70">
              <span>Fecha</span>
              <span className="font-semibold text-[#250e2c]">{service.date}</span>
            </div>
            <div className="flex justify-between text-[#250e2c]/70">
              <span>{service.hours} horas × S/ {service.rate}</span>
              <span className="font-semibold text-[#250e2c]">S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#250e2c]/70">
              <span className="inline-flex items-center gap-1">Tarifa plataforma <Info className="w-3 h-3" /></span>
              <span className="font-semibold text-[#250e2c]">S/ {fee.toFixed(2)}</span>
            </div>
          </div>

          <div className="py-4 flex justify-between items-center">
            <span className="font-bold text-[#250e2c]">Total a retener</span>
            <span className="text-2xl font-bold text-[#250e2c]">S/ {total.toFixed(2)}</span>
          </div>

          <button
            onClick={() => setSuccess(true)}
            className="w-full py-4 bg-gradient-to-r from-[#cc8db3] to-[#b07a9a] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#cc8db3]/30 transition-all inline-flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" /> Pagar de forma segura
          </button>

          <p className="text-[11px] text-[#250e2c]/60 text-center mt-3 leading-relaxed">
            Al continuar aceptas los Términos del Servicio Escrow. El monto se libera solo cuando confirmes la finalización del servicio.
          </p>
        </motion.aside>
      </div>
    </div>
  );
}


