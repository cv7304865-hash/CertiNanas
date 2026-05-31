import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle2, Calendar, CreditCard, MessageSquare, Shield } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type Notif = {
  id: number;
  icon: typeof Bell;
  color: string;
  bg: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<Notif[]>([
    { id: 1, icon: Shield, color: 'text-[#10B981]', bg: 'bg-emerald-50', title: 'Tu perfil ha sido verificado', desc: 'Identidad y documentos validados con éxito.', time: 'Hace 2 min', unread: true },
    { id: 2, icon: Calendar, color: 'text-[#1E3A8A]', bg: 'bg-blue-50', title: 'Nueva solicitud de cita', desc: 'María González confirmó la cita del jueves 21.', time: 'Hace 1 h', unread: true },
    { id: 3, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50', title: 'Mensaje nuevo de Carmen', desc: '"Le envío los detalles de la sesión..."', time: 'Hace 3 h', unread: true },
    { id: 4, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50', title: 'Pago pendiente', desc: 'Tu reserva del sábado requiere confirmación de pago.', time: 'Ayer', unread: false },
    { id: 5, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', title: 'Servicio completado', desc: 'El pago fue liberado a Ana Torres.', time: 'Lun 12', unread: false },
  ]);

  const unread = items.filter((i) => i.unread).length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markAllRead = () => setItems((p) => p.map((i) => ({ ...i, unread: false })));

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-[#10B981] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {unread}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#1E3A8A]">Notificaciones</h3>
                <p className="text-xs text-gray-500">{unread} nuevas</p>
              </div>
              <button onClick={markAllRead} className="text-xs font-bold text-[#10B981] hover:underline">
                Marcar todo leído
              </button>
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              {items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setItems((p) => p.map((i) => (i.id === n.id ? { ...i, unread: false } : i)))}
                  className={`w-full flex items-start gap-3 p-4 border-b border-gray-50 text-left transition-colors hover:bg-gray-50 ${
                    n.unread ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${n.bg} flex items-center justify-center shrink-0`}>
                    <n.icon className={`w-5 h-5 ${n.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{n.title}</h4>
                      {n.unread && <span className="w-2 h-2 bg-[#10B981] rounded-full shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{n.desc}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-semibold">{n.time}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
              <button className="text-xs font-bold text-[#1E3A8A] hover:underline">Ver todas las notificaciones</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
