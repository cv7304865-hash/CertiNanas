import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'data', 'certinanas.db');
const uploadsDir = join(__dirname, 'uploads');

if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

const db = existsSync(dbPath)
  ? (await import('better-sqlite3')).default(dbPath)
  : null;

if (!db) {
  console.log('Base de datos no encontrada en', dbPath);
  process.exit(1);
}

const colors = [
  ['#7B337E', '#F6A5C0'], ['#CC8DB3', '#210635'], ['#F6A5C0', '#210635'],
  ['#6667AB', '#F5D5E0'], ['#210635', '#CC8DB3'], ['#7B337E', '#F5D5E0'],
  ['#CC8DB3', '#210635'], ['#F5D5E0', '#210635'], ['#6667AB', '#F5D5E0'],
  ['#210635', '#F6A5C0'], ['#7B337E', '#FFFFFF'], ['#CC8DB3', '#210635'],
];

const cuidadoras = db.prepare(`
  SELECT u.Id, u.Nombres, u.Apellidos, u.FotoPerfil FROM Usuarios u WHERE u.IdRol = 3
`).all();

let count = 0;
for (const c of cuidadoras) {
  const initial = (c.Nombres?.trim().charAt(0) || '?').toUpperCase();
  const color = colors[count % colors.length];
  const filename = `avatar-cuidadora-${c.Id}.svg`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color[0]}"/>
      <stop offset="100%" stop-color="${color[1]}"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="100" fill="url(#bg)"/>
  <text x="100" y="108" text-anchor="middle" dominant-baseline="central"
    font-size="80" font-weight="bold" fill="white" font-family="Inter, sans-serif">${initial}</text>
</svg>`;

  writeFileSync(join(uploadsDir, filename), svg, 'utf-8');
  db.prepare('UPDATE Usuarios SET FotoPerfil = ? WHERE Id = ?').run(filename, c.Id);
  console.log(`✓ ${c.Nombres} ${c.Apellidos} → ${filename}`);
  count++;
}

console.log(`\n${count} avatares generados en server/uploads/`);
const fam = db.prepare(`SELECT u.Id, u.Nombres, u.Apellidos, u.FotoPerfil FROM Usuarios u WHERE u.IdRol = 2`).all();
let fcount = 0;
for (const c of fam) {
  if (c.FotoPerfil) continue;
  const initial = (c.Nombres?.trim().charAt(0) || '?').toUpperCase();
  const color = colors[(count + fcount) % colors.length];
  const filename = `avatar-familia-${c.Id}.svg`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color[0]}"/>
      <stop offset="100%" stop-color="${color[1]}"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="100" fill="url(#bg)"/>
  <text x="100" y="108" text-anchor="middle" dominant-baseline="central"
    font-size="80" font-weight="bold" fill="white" font-family="Inter, sans-serif">${initial}</text>
</svg>`;
  writeFileSync(join(uploadsDir, filename), svg, 'utf-8');
  db.prepare('UPDATE Usuarios SET FotoPerfil = ? WHERE Id = ?').run(filename, c.Id);
  console.log(`✓ ${c.Nombres} ${c.Apellidos} → ${filename}`);
  fcount++;
}

console.log(`\n${fcount} avatares de familia generados`);
db.close();
