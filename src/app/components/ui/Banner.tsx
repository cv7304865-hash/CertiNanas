import { motion } from 'motion/react';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';
import type { ReactNode } from 'react';

type Variant = 'info' | 'success' | 'warning' | 'danger';

const config: Record<Variant, { icon: typeof Info; bg: string; border: string; text: string; iconColor: string }> = {
  info: {
    icon: Info,
    bg: 'bg-[rgba(102,103,171,0.15)]',
    border: 'border-[rgba(102,103,171,0.3)]',
    text: 'text-[#F5D5E0]',
    iconColor: 'text-[#6667AB]',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-[rgba(18,80,50,0.15)]',
    border: 'border-[rgba(18,80,50,0.3)]',
    text: 'text-emerald-200',
    iconColor: 'text-emerald-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[rgba(200,140,60,0.15)]',
    border: 'border-[rgba(200,140,60,0.3)]',
    text: 'text-amber-200',
    iconColor: 'text-amber-400',
  },
  danger: {
    icon: AlertCircle,
    bg: 'bg-[rgba(200,40,40,0.15)]',
    border: 'border-[rgba(200,40,40,0.3)]',
    text: 'text-red-200',
    iconColor: 'text-red-400',
  },
};

export function Banner({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}: {
  variant?: Variant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  const c = config[variant];
  const Icon = c.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm ${c.bg} ${c.border} ${className}`}
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${c.iconColor}`} />
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-bold ${c.text} mb-0.5`}>{title}</p>}
        <div className={`text-xs ${c.text} opacity-80 leading-relaxed`}>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 p-0.5 opacity-60 hover:opacity-100 transition-opacity">
          <X className="w-4 h-4 text-white" />
        </button>
      )}
    </motion.div>
  );
}
