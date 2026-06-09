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
      <div className="min-h-screen bg-gradient-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-3xl p-12">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#f6a5c0]/30 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-[#cc8db3]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Pago retenido con éxito</h1>
            <p className="text-[#F5D5E0]/70 mb-2 leading-relaxed">
              S/ {total.toFixed(2)} se mantienen seguros en nuestra cuenta Escrow.
            </p>
            <p className="text-sm text-[#6667AB] mb-8">
              El monto será liberado a {service.nana} solo cuando confirmes que el servicio finalizó satisfactoriamente.
            </p>
            <button onClick={onBack} className="px-6 py-3 bg-[#CC8DB3] text-[#210635] rounded-xl font-bold hover:bg-[#b07a9a] transition-colors">
              Volver al Panel
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#210635] via-[#420D4B] to-[#7B337E]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-[#6667AB] hover:text-white mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Pago Seguro Escrow</h1>
          <p className="text-[#6667AB] mt-1 inline-flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4 text-[#cc8db3]" /> Conexión cifrada SSL · Tu dinero protegido hasta confirmar el servicio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-6">
            {/* Escrow Banner */}
            <div className="bg-[rgba(246,165,192,0.15)] backdrop-blur-sm border border-[rgba(255,255,255,0.2)] rounded-2xl p-5 flex gap-4">
              <div className="w-12 h-12 bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] rounded-xl shadow-sm flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-[#cc8db3]" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">¿Cómo funciona Escrow?</h3>
                <p className="text-sm text-[#F5D5E0] leading-relaxed">
                  Tu pago se retiene de forma segura en nuestra plataforma. <strong>El dinero NO se entrega a la cuidadora</strong> hasta que confirmes que el servicio se realizó con éxito. Si algo sale mal, recibes un reembolso completo.
                </p>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
              <h2 className="font-bold text-white mb-4">Método de pago</h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === 'card' ? 'border-white bg-[rgba(246,165,192,0.2)]' : 'border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.3)]'
                  }`}
                >
                  <CreditCard className={`w-5 h-5 mb-2 ${paymentMethod === 'card' ? 'text-white' : 'text-[#6667AB]'}`} />
                  <p className="font-bold text-sm text-white">Tarjeta</p>
                  <p className="text-xs text-[#6667AB]">Visa, Mastercard</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('yape')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === 'yape' ? 'border-white bg-[rgba(246,165,192,0.2)]' : 'border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.3)]'
                  }`}
                >
                  <div className={`w-5 h-5 mb-2 rounded ${paymentMethod === 'yape' ? 'bg-white' : 'bg-[#6667AB]'}`} />
                  <p className="font-bold text-sm text-white">Yape / Plin</p>
                  <p className="text-xs text-[#6667AB]">Transferencia inmediata</p>
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">Número de tarjeta</label>
                    <input placeholder="1234 5678 9012 3456" className="w-full px-4 py-3 bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white mb-1.5">Vencimiento</label>
                      <input placeholder="MM / AA" className="w-full px-4 py-3 bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white mb-1.5">CVV</label>
                      <input placeholder="123" className="w-full px-4 py-3 bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">Nombre en la tarjeta</label>
                    <input placeholder="Como aparece en la tarjeta" className="w-full px-4 py-3 bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]" />
                  </div>
                </div>
              ) : (
                <div className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] rounded-xl p-6 text-center">
                  <p className="text-sm text-[#6667AB] mb-2">Escanea el QR desde tu app Yape o Plin</p>
                  <div className="w-40 h-40 bg-[rgba(33,6,53,0.5)] backdrop-blur-sm border border-[rgba(255,255,255,0.2)] rounded-xl mx-auto border-2 border-dashed border-[rgba(255,255,255,0.2)] flex items-center justify-center text-xs text-[#6667AB]">
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
                <div key={b.t} className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] rounded-xl p-3 flex items-center gap-2 shadow-sm">
                  <b.icon className="w-5 h-5 text-[#cc8db3] shrink-0" />
                  <span className="text-xs font-bold text-white">{b.t}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Summary */}
          <motion.aside initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6 h-fit sticky top-28">
            <h2 className="font-bold text-white mb-5">Resumen del servicio</h2>

            <div className="flex items-center gap-3 pb-5 border-b border-white/20">
              <img src={service.photo} alt={service.nana} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-bold text-sm text-white">{service.nana}</p>
                <p className="text-xs text-[#6667AB]">{service.type}</p>
              </div>
            </div>

            <div className="py-4 border-b border-white/20 space-y-2 text-sm">
              <div className="flex justify-between text-[#6667AB]">
                <span>Fecha</span>
                <span className="font-semibold text-white">{service.date}</span>
              </div>
              <div className="flex justify-between text-[#6667AB]">
                <span>{service.hours} horas × S/ {service.rate}</span>
                <span className="font-semibold text-white">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#6667AB]">
                <span className="inline-flex items-center gap-1">Tarifa plataforma <Info className="w-3 h-3" /></span>
                <span className="font-semibold text-white">S/ {fee.toFixed(2)}</span>
              </div>
            </div>

            <div className="py-4 flex justify-between items-center">
              <span className="font-bold text-white">Total a retener</span>
              <span className="text-2xl font-bold text-[#F6A5C0]">S/ {total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => setSuccess(true)}
              className="w-full py-4 bg-[#F6A5C0] text-[#210635] rounded-xl font-bold hover:shadow-lg transition-all inline-flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Pagar de forma segura
            </button>

            <p className="text-[11px] text-[#6667AB] text-center mt-3 leading-relaxed">
              Al continuar aceptas los Términos del Servicio Escrow. El monto se libera solo cuando confirmes la finalización del servicio.
            </p>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
