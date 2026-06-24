export function initialsDataUri(name: string, bg = 'cc8db3', color = '210635'): string {
  const initial = name.trim().charAt(0)?.toUpperCase() || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#${bg}"/><text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-size="42" font-weight="bold" fill="#${color}" font-family="sans-serif">${initial}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function photoUrl(fotoPerfil: string | null | undefined, name: string): string {
  if (fotoPerfil) return `/uploads/${fotoPerfil}`;
  return initialsDataUri(name);
}
