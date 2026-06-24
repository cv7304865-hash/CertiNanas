import { readdirSync, copyFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import Database from 'better-sqlite3';

const imagesDir = 'C:\\Users\\heber\\Downloads\\imagenes';
const uploadsDir = join(import.meta.dirname, 'uploads');
const dbPath = join(import.meta.dirname, 'data', 'certinanas.db');

const db = new Database(dbPath);

// Get all cuidadora users sorted by Id
const cuidadoras = db.prepare('SELECT Id, Nombres, Apellidos FROM Usuarios WHERE IdRol = 3 ORDER BY Id').all();
const familias = db.prepare('SELECT Id, Nombres, Apellidos FROM Usuarios WHERE IdRol = 2 ORDER BY Id').all();

// Get image files
const exts = ['.jfif', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
const images = readdirSync(imagesDir)
  .filter(f => exts.some(e => f.toLowerCase().endsWith(e)))
  .sort();

console.log(`${images.length} imágenes encontradas en Downloads\\imagenes`);
console.log(`${cuidadoras.length} cuidadoras, ${familias.length} familias`);

// Assign images cycling through available ones
const assign = (users, startOffset) => {
  let count = 0;
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const imgIdx = (startOffset + i) % images.length;
    const srcName = images[imgIdx];
    const ext = srcName.match(/\.(\w+)$/)?.[1] || 'jpg';
    const destName = `foto-${u.Id}.${ext}`;
    const destPath = join(uploadsDir, destName);
    
    // Remove old avatar SVG if exists
    const oldRows = db.prepare('SELECT FotoPerfil FROM Usuarios WHERE Id = ?').get(u.Id);
    if (oldRows?.FotoPerfil) {
      try { unlinkSync(join(uploadsDir, oldRows.FotoPerfil)); } catch {}
    }
    
    copyFileSync(join(imagesDir, srcName), destPath);
    db.prepare('UPDATE Usuarios SET FotoPerfil = ? WHERE Id = ?').run(destName, u.Id);
    console.log(`  ${u.Nombres} ${u.Apellidos} → ${destName} (${srcName})`);
    count++;
  }
  return count;
};

console.log('\n--- Asignando a cuidadoras ---');
const cCount = assign(cuidadoras, 0);

console.log('\n--- Asignando a familias ---');
const fCount = assign(familias, cCount);

console.log(`\nTotal: ${cCount + fCount} fotos asignadas`);
db.close();
