import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

function generarOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generarCodigoContrato() {
  return 'CTR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

router.post('/guardar-firma', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const { IdOrden, tipo, firmaData } = req.body;
    if (!IdOrden || !tipo || !firmaData) {
      return res.status(400).json({ error: 'IdOrden, tipo y firmaData son requeridos' });
    }

    if (!['familia', 'cuidadora', 'admin'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo debe ser familia, cuidadora o admin' });
    }

    const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ?').get(IdOrden);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

    let contratoDigital = db.prepare('SELECT * FROM ContratosDigitales WHERE IdOrden = ?').get(IdOrden);
    if (!contratoDigital) {
      const codigo = generarCodigoContrato();
      const r = db.prepare('INSERT INTO ContratosDigitales (IdOrden, CodigoContrato, Estado) VALUES (?, ?, ?)').run(IdOrden, codigo, 'PendienteFirma');
      contratoDigital = db.prepare('SELECT * FROM ContratosDigitales WHERE Id = ?').get(r.lastInsertRowid);
    }

    const updateFields = {};
    if (tipo === 'familia') {
      updateFields.FirmaFamilia = firmaData;
      updateFields.OTPFamilia = generarOTP();
      updateFields.OTPVerificadoFamilia = 0;
    } else if (tipo === 'cuidadora') {
      updateFields.FirmaCuidadora = firmaData;
      updateFields.OTPCuidadora = generarOTP();
      updateFields.OTPVerificadoCuidadora = 0;
    } else if (tipo === 'admin') {
      updateFields.FirmaAdmin = firmaData;
    }

    const setClauses = Object.keys(updateFields).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updateFields);
    values.push(IdOrden);

    db.prepare(`UPDATE ContratosDigitales SET ${setClauses} WHERE IdOrden = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM ContratosDigitales WHERE IdOrden = ?').get(IdOrden);

    res.json({
      success: true,
      otpEnviado: tipo !== 'admin',
      otp: updateFields.OTPFamilia || updateFields.OTPCuidadora || null,
      contrato: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/verificar-otp', (req, res) => {
  try {
    const db = getDb();
    const { IdOrden, tipo, codigo } = req.body;
    if (!IdOrden || !tipo || !codigo) {
      return res.status(400).json({ error: 'IdOrden, tipo y codigo son requeridos' });
    }

    const contrato = db.prepare('SELECT * FROM ContratosDigitales WHERE IdOrden = ?').get(IdOrden);
    if (!contrato) return res.status(404).json({ error: 'Contrato no encontrado' });

    let valido = false;
    if (tipo === 'familia' && contrato.OTPFamilia === codigo) {
      db.prepare("UPDATE ContratosDigitales SET OTPVerificadoFamilia = 1 WHERE IdOrden = ?").run(IdOrden);
      valido = true;
    } else if (tipo === 'cuidadora' && contrato.OTPCuidadora === codigo) {
      db.prepare("UPDATE ContratosDigitales SET OTPVerificadoCuidadora = 1 WHERE IdOrden = ?").run(IdOrden);
      valido = true;
    }

    if (!valido) return res.status(400).json({ error: 'Codigo OTP invalido' });

    const updated = db.prepare('SELECT * FROM ContratosDigitales WHERE IdOrden = ?').get(IdOrden);

    if (updated.OTPVerificadoFamilia && updated.OTPVerificadoCuidadora && updated.FirmaFamilia && updated.FirmaCuidadora) {
      db.prepare("UPDATE ContratosDigitales SET Estado = 'Completado', FechaEmision = datetime('now') WHERE IdOrden = ?").run(IdOrden);
    }

    res.json({ success: true, valido: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/contrato/:idOrden', (req, res) => {
  try {
    const db = getDb();
    const contrato = db.prepare(`
      SELECT cd.*, o.TipoServicio, o.FechaServicio, o.TotalHoras, o.TarifaHora, o.Subtotal, o.TarifaPlataforma, o.Total,
             uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos, uf.Email AS FamiliaEmail,
             uc.Nombres AS CuidadoraNombres, uc.Apellidos AS CuidadoraApellidos, uc.Email AS CuidadoraEmail,
             m.Nombre AS MenorNombre, m.Diagnostico AS MenorDiagnostico
      FROM ContratosDigitales cd
      INNER JOIN Ordenes o ON o.Id = cd.IdOrden
      INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
      INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
      INNER JOIN Usuarios uc ON uc.Id = c.IdUsuario
      LEFT JOIN Menores m ON m.Id = o.IdMenor
      WHERE cd.IdOrden = ?
    `).get(Number(req.params.idOrden));

    if (!contrato) return res.status(404).json({ error: 'Contrato no encontrado' });

    res.json(contrato);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/generar-pdf', (req, res) => {
  try {
    const db = getDb();
    const { IdOrden } = req.body;
    if (!IdOrden) return res.status(400).json({ error: 'IdOrden es requerido' });

    const contrato = db.prepare(`
      SELECT cd.*, o.TipoServicio, o.FechaServicio, o.TotalHoras, o.TarifaHora, o.Subtotal, o.TarifaPlataforma, o.Total,
             uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos, uf.Email AS FamiliaEmail,
             uc.Nombres AS CuidadoraNombres, uc.Apellidos AS CuidadoraApellidos, uc.Email AS CuidadoraEmail,
             m.Nombre AS MenorNombre
      FROM ContratosDigitales cd
      INNER JOIN Ordenes o ON o.Id = cd.IdOrden
      INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
      INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
      INNER JOIN Usuarios uc ON uc.Id = c.IdUsuario
      LEFT JOIN Menores m ON m.Id = o.IdMenor
      WHERE cd.IdOrden = ? AND cd.Estado = 'Completado'
    `).get(IdOrden);

    if (!contrato) return res.status(400).json({ error: 'Contrato no encontrado o no completado' });

    const hashSimulado = 'HASH-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 10).toUpperCase();

    db.prepare("UPDATE ContratosDigitales SET PdfUrl = ?, HashCriptografico = ? WHERE IdOrden = ?").run(
      `/contratos/${contrato.CodigoContrato}.pdf`, hashSimulado, IdOrden
    );

    const contratoTradicional = db.prepare('SELECT Id FROM Contratos WHERE IdOrden = ?').get(IdOrden);
    if (contratoTradicional) {
      db.prepare("UPDATE Contratos SET PdfUrl = ?, HashCriptografico = ? WHERE IdOrden = ?").run(
        `/contratos/${contrato.CodigoContrato}.pdf`, hashSimulado, IdOrden
      );
    }

    res.json({
      success: true,
      pdfUrl: `/contratos/${contrato.CodigoContrato}.pdf`,
      hash: hashSimulado,
      codigo: contrato.CodigoContrato,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
