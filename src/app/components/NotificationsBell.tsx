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
    { id: 1, icon: Shield, color: 'text-[#cc8db3]', bg: 'bg-[#f6a5c0]/20', title: 'Tu perfil ha sido verificado', desc: 'Identidad y documentos validados con éxito.', time: 'Hace 2 min', unread: true },
    { id: 2, icon: Calendar, color: 'text-white', bg: 'bg-[#f6a5c0]/20', title: 'Nueva solicitud de cita', desc: 'María González confirmó la cita del jueves 21.', time: 'Hace 1 h', unread: true },
    { id: 3, icon: MessageSquare, color: 'text-white', bg: 'bg-[#9d85b6]/20', title: 'Mensaje nuevo de Carmen', desc: '"Le envío los detalles de la sesión..."', time: 'Hace 3 h', unread: true },
    { id: 4, icon: CreditCard, color: 'text-[#cc8db3]', bg: 'bg-[#f6a5c0]/20', title: 'Pago pendiente', desc: 'Tu reserva del sábado requiere confirmación de pago.', time: 'Ayer', unread: false },
    { id: 5, icon: CheckCircle2, color: 'text-[#cc8db3]', bg: 'bg-[#f6a5c0]/20', title: 'Servicio completado', desc: 'El pago fue liberado a Ana Torres.', time: 'Lun 12', unread: false },
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
        className="relative p-2.5 rounded-xl hover:bg-[rgba(33,6,53,0.4)] transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 text-white" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-[#cc8db3] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
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
            className="absolute right-0 mt-2 w-[380px] bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#F5D5E0]">Notificaciones</h3>
                <p className="text-xs text-[#6667AB]">{unread} nuevas</p>
              </div>
              <button onClick={markAllRead} className="text-xs font-bold text-[#CC8DB3] hover:underline">
                Marcar todo leído
              </button>
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              {items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setItems((p) => p.map((i) => (i.id === n.id ? { ...i, unread: false } : i)))}
                  className={`w-full flex items-start gap-3 p-4 border-b border-[rgba(255,255,255,0.1)] text-left transition-colors hover:bg-[rgba(33,6,53,0.3)] ${
                    n.unread ? 'bg-[rgba(246,165,192,0.15)]' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${n.bg} flex items-center justify-center shrink-0`}>
                    <n.icon className={`w-5 h-5 ${n.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-[#F5D5E0] truncate">{n.title}</h4>
                      {n.unread && <span className="w-2 h-2 bg-[#cc8db3] rounded-full shrink-0" />}
                    </div>
                    <p className="text-xs text-[#6667AB] mt-0.5 leading-relaxed">{n.desc}</p>
                    <p className="text-[10px] text-[#6667AB] mt-1 font-semibold">{n.time}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-[rgba(255,255,255,0.1)] bg-[rgba(33,6,53,0.4)] text-center">
              <button className="text-xs font-bold text-[#F5D5E0] hover:underline">Ver todas las notificaciones</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
