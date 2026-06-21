import { motion } from 'motion/react';
import { SearchX, Inbox, FileX, FolderOpen } from 'lucide-react';
import type { ReactNode } from 'react';

const icons = { search: SearchX, inbox: Inbox, file: FileX, folder: FolderOpen };

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className = '',
}: {
  icon?: keyof typeof icons;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  const Icon = icons[icon];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-16 px-6 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border border-[rgba(255,255,255,0.1)] flex items-center justify-center mx-auto mb-5">
        <Icon className="w-8 h-8 text-[#6667AB]" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      {description && <p className="text-sm text-[#6667AB] max-w-sm mx-auto leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
