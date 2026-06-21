<?php
/**
 * CERTINANAS - EntrevistaControlador
 * Arquitectura MVC · Regla de Negocio RN-26 (Supervisión Obligatoria del Administrador)
 *
 * Endpoints:
 *   POST /entrevista/agendar          → agendar() : crea sala + persiste
 *   POST /entrevista/{id}/admin-join  → registrarIngresoAdmin()
 *   POST /entrevista/{id}/finalizar   → finalizar() (webhook del proveedor de video)
 *   GET  /entrevista/supervision      → listarSupervision()
 *   POST /entrevista/{id}/justificar  → justificarFalta()
 *
 * Dependencias inyectadas:
 *   - EntrevistaModelo   (tabla ENTREVISTA / SOLICITUD_SERVICIO)
 *   - UsuarioModelo      (resuelve email_admin desde la tabla USUARIO con rol = 'admin')
 *   - VideoApiService    (Google Meet / Jitsi)
 *   - IncidenciaModelo   (registro de alertas críticas)
 *   - EscrowService      (bloquea / libera pagos)
 */

class EntrevistaControlador
{
    public function __construct(
        private EntrevistaModelo $entrevistas,
        private UsuarioModelo $usuarios,
        private VideoApiService $videoApi,
        private IncidenciaModelo $incidencias,
        private EscrowService $escrow
    ) {}

    /**
     * 1. Integración con API de videoconferencias.
     * Recibe id_familia + id_cuidadora, resuelve el email del admin y
     * genera un enlace único que incluye a los tres participantes.
     */
    public function agendar(array $req): array
    {
        $idFamilia    = (int)$req['id_familia'];
        $idCuidadora  = (int)$req['id_cuidadora'];
        $fechaHora    = $req['fecha_hora']; // ISO-8601

        $familia    = $this->usuarios->buscarPorId($idFamilia);
        $cuidadora  = $this->usuarios->buscarPorId($idCuidadora);
        $emailAdmin = $this->usuarios->emailAdminActivo(); // SELECT email FROM USUARIO WHERE rol='admin' AND activo=1

        if (!$familia || !$cuidadora || !$emailAdmin) {
            return ['ok' => false, 'error' => 'PARTICIPANTES_INVALIDOS'];
        }

        $sala = $this->videoApi->crearSala([
            'titulo'        => "CERTINANAS · Entrevista de Conocimiento",
            'fecha_hora'    => $fechaHora,
            'participantes' => [
                ['email' => $familia->email,   'rol' => 'attendee'],
                ['email' => $cuidadora->email, 'rol' => 'attendee'],
                ['email' => $emailAdmin,       'rol' => 'moderator'], // RN-26
            ],
        ]);

        // 3. Persistencia en BD
        $idEntrevista = $this->entrevistas->crear([
            'id_familia'      => $idFamilia,
            'id_cuidadora'    => $idCuidadora,
            'fecha_hora'      => $fechaHora,
            'url_reunion'     => $sala->url,
            'email_admin'     => $emailAdmin,
            'estado'          => 'PROGRAMADA',
            'escrow_bloqueado'=> 0,
        ]);

        return ['ok' => true, 'id_entrevista' => $idEntrevista, 'url' => $sala->url];
    }

    /** 2. Botón "Unirse a supervisar" del panel del Admin. */
    public function registrarIngresoAdmin(int $idEntrevista): array
    {
        $e = $this->entrevistas->buscar($idEntrevista);
        if (!$e) return ['ok' => false, 'error' => 'NO_EXISTE'];

        $this->entrevistas->actualizar($idEntrevista, [
            'admin_ingreso_at' => date('c'),
            'estado'           => 'EN_CURSO',
            'escrow_bloqueado' => 0,
        ]);
        return ['ok' => true, 'url' => $e->url_reunion];
    }

    /** Webhook del proveedor de video al finalizar la reunión. */
    public function finalizar(int $idEntrevista): array
    {
        $e = $this->entrevistas->buscar($idEntrevista);
        if (!$e) return ['ok' => false, 'error' => 'NO_EXISTE'];

        // Trigger lógico: marcar Supervisada y habilitar evaluación reputacional
        $this->entrevistas->actualizar($idEntrevista, [
            'estado'             => 'SUPERVISADA',
            'evaluacion_habilitada' => 1,
        ]);
        return ['ok' => true];
    }

    /** Panel del admin: solo entrevistas programadas para hoy o futuras. */
    public function listarSupervision(): array
    {
        // SELECT * FROM ENTREVISTA WHERE fecha_hora >= CURDATE() ORDER BY fecha_hora ASC
        return $this->entrevistas->listarHoyYProximas();
    }

    /**
     * 4. Lógica de Seguridad - ejecutada por un cron cada minuto.
     * Si el admin no ingresó en los primeros 5 min → incidencia crítica + bloqueo Escrow.
     */
    public function vigilarSupervision(): void
    {
        $pendientes = $this->entrevistas->programadasSinAdmin();
        $ahora = time();

        foreach ($pendientes as $e) {
            $inicio = strtotime($e->fecha_hora);
            if (($ahora - $inicio) >= 300 && empty($e->admin_ingreso_at)) {
                $this->incidencias->registrar([
                    'tipo'        => 'SUPERVISION_OMITIDA',
                    'severidad'   => 'ALTA',
                    'id_entrevista'=> $e->id,
                    'mensaje'     => "RN-26: el admin no ingresó en los primeros 5 minutos.",
                ]);
                $this->escrow->bloquearPorEntrevista($e->id);
                $this->entrevistas->actualizar($e->id, ['escrow_bloqueado' => 1]);
            }
        }
    }

    /** El admin justifica la falta y se reactiva la liberación del Escrow. */
    public function justificarFalta(int $idEntrevista, string $justificacion): array
    {
        if (strlen(trim($justificacion)) < 10) {
            return ['ok' => false, 'error' => 'JUSTIFICACION_INSUFICIENTE'];
        }
        $this->entrevistas->actualizar($idEntrevista, [
            'justificacion'    => $justificacion,
            'escrow_bloqueado' => 0,
        ]);
        $this->escrow->desbloquearPorEntrevista($idEntrevista);
        return ['ok' => true];
    }
}
