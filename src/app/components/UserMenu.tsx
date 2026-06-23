import { useRef } from 'react';
import { User, Camera, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

export function UserMenu({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { user, logout, updateFotoPerfil } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          <ProfileAvatar size={36} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-[#210635] border border-[rgba(255,255,255,0.15)] text-[#F5D5E0]">
        <DropdownMenuItem onClick={() => onNavigate?.('perfil')} className="cursor-pointer hover:bg-[rgba(246,165,192,0.1)] hover:text-white focus:bg-[rgba(246,165,192,0.1)] focus:text-white">
          <User className="w-4 h-4 mr-2" />
          <span>Editar Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => inputRef.current?.click()} className="cursor-pointer hover:bg-[rgba(246,165,192,0.1)] hover:text-white focus:bg-[rgba(246,165,192,0.1)] focus:text-white">
          <Camera className="w-4 h-4 mr-2" />
          <span>Cambiar Foto</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.1)]" />
        <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300">
          <LogOut className="w-4 h-4 mr-2" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handlePhotoUpload} />
    </DropdownMenu>
  );
}
