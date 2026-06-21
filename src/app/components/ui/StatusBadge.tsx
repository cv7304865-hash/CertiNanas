import { motion } from 'motion/react';

type StatusVariant =
  | 'pending' | 'pendiente'
  | 'confirmed' | 'confirmada'
  | 'progress' | 'en_curso'
  | 'finished' | 'finalizada' | 'completada'
  | 'cancelled' | 'cancelada'
  | 'active' | 'rechazada'
  | 'pago_pendiente';

const styles: Record<string, { bg: string; text: string; dot: string }> = {
  pending:       { bg: 'bg-[rgba(200,140,60,0.2)]',  text: 'text-amber-200', dot: 'bg-amber-400' },
  pendiente:     { bg: 'bg-[rgba(200,140,60,0.2)]',  text: 'text-amber-200', dot: 'bg-amber-400' },
  confirmed:     { bg: 'bg-[rgba(18,80,50,0.2)]',    text: 'text-emerald-200', dot: 'bg-emerald-400' },
  confirmada:    { bg: 'bg-[rgba(18,80,50,0.2)]',    text: 'text-emerald-200', dot: 'bg-emerald-400' },
  progress:      { bg: 'bg-[rgba(102,103,171,0.2)]', text: 'text-[#F5D5E0]', dot: 'bg-[#6667AB]' },
  en_curso:      { bg: 'bg-[rgba(102,103,171,0.2)]', text: 'text-[#F5D5E0]', dot: 'bg-[#6667AB]' },
  finished:      { bg: 'bg-[rgba(100,100,120,0.2)]', text: 'text-gray-300', dot: 'bg-gray-400' },
  finalizada:    { bg: 'bg-[rgba(100,100,120,0.2)]', text: 'text-gray-300', dot: 'bg-gray-400' },
  completada:    { bg: 'bg-[rgba(100,100,120,0.2)]', text: 'text-gray-300', dot: 'bg-gray-400' },
  cancelled:     { bg: 'bg-[rgba(200,40,40,0.2)]',   text: 'text-red-200', dot: 'bg-red-400' },
  cancelada:     { bg: 'bg-[rgba(200,40,40,0.2)]',   text: 'text-red-200', dot: 'bg-red-400' },
  rechazada:     { bg: 'bg-[rgba(200,40,40,0.2)]',   text: 'text-red-200', dot: 'bg-red-400' },
  active:        { bg: 'bg-[rgba(18,80,50,0.2)]',    text: 'text-emerald-200', dot: 'bg-emerald-400' },
  pago_pendiente:{ bg: 'bg-[rgba(200,140,60,0.2)]',  text: 'text-amber-200', dot: 'bg-amber-400' },
};

const labels: Record<string, string> = {
  pending: 'Pendiente', pendiente: 'Pendiente',
  confirmed: 'Confirmado', confirmada: 'Confirmada',
  progress: 'En curso', en_curso: 'En curso',
  finished: 'Finalizado', finalizada: 'Finalizada', completada: 'Completada',
  cancelled: 'Cancelado', cancelada: 'Cancelada',
  rechazada: 'Rechazada',
  active: 'Activo',
  pago_pendiente: 'Pendiente de pago',
};

export function StatusBadge({
  status,
  label,
  className = '',
}: {
  status: StatusVariant;
  label?: string;
  className?: string;
}) {
  const s = styles[status] || styles.pending;
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${s.bg} ${s.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {label || labels[status] || status}
    </motion.span>
  );
}
