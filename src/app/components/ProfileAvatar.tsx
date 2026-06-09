import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Props = {
  size?: number;
  className?: string;
};

export function ProfileAvatar({ size = 36, className = '' }: Props) {
  const { user, updateFotoPerfil } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);

  const handleClick = () => inputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('archivo', file);
    try {
      const r = await fetch('/api/usuarios/foto-perfil', {
        method: 'POST',
        headers: { 'x-user-id': String(user?.id) },
        body: form,
      });
      const data = await r.json();
      if (r.ok) updateFotoPerfil(data.fotoPerfil);
    } catch {}
    e.target.value = '';
  };

  const fotoUrl = user?.fotoPerfil ? `/uploads/${user.fotoPerfil}` : null;
  const initial = user?.nombres?.charAt(0)?.toUpperCase() || '?';
  const px = size;

  return (
    <>
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`relative rounded-full overflow-hidden flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 ${className}`}
        style={{ width: px, height: px }}
        title="Cambiar foto de perfil"
      >
        {fotoUrl ? (
          <img src={fotoUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#F59E0B]/20 flex items-center justify-center text-sm font-bold text-[#F59E0B]">
            {initial}
          </div>
        )}
        {hover && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity">
            <Camera className="text-white" style={{ width: px * 0.35, height: px * 0.35 }} />
          </div>
        )}
      </button>
    </>
  );
}
