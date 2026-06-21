import { useState } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';

export function StarRating({
  value,
  onChange,
  max = 5,
  size = 20,
  readonly = false,
  className = '',
}: {
  value: number;
  onChange?: (v: number) => void;
  max?: number;
  size?: number;
  readonly?: boolean;
  className?: string;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: max }, (_, i) => {
        const idx = i + 1;
        const filled = idx <= (hover || value);
        return (
          <motion.button
            key={idx}
            type="button"
            disabled={readonly}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => !readonly && setHover(idx)}
            onMouseLeave={() => !readonly && setHover(0)}
            onClick={() => onChange?.(idx)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors p-0.5`}
          >
            <Star
              size={size}
              className={filled ? 'text-[#F6A5C0] fill-[#F6A5C0]' : 'text-[#6667AB]'}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
