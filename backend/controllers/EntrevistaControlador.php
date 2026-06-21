<?php
require_once __DIR__ . '/../models/EntrevistaModelo.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

/**
 * CERTINANAS - EntrevistaControlador
 * Arquitectura MVC · Regla de Negocio RN-26 (Supervisión Obligatoria del Administrador)
 *
 * Endpoints:
 *   POST /entrevista/agendar          -> agendar() : crea sala + persiste
 *   POST /entrevista/{id}/admin-join  -> registrarIngresoAdmin()
 *   POST /entrevista/{id}/finalizar   -> finalizar() (webhook del proveedor de video)
 *   GET  /entrevista/supervision      -> listarSupervision()
 *   POST /entrevista/{id}/justificar  -> justificarFalta()
 */

class EntrevistaControlador
{
    private EntrevistaModelo $entrevistas;
    private UsuarioModelo $usuarios;
    private VideoApiService $videoApi;
    private IncidenciaModelo $incidencias;
    private EscrowService $escrow;

    public function __construct()
    {
        $this->entrevistas = new EntrevistaModelo();
        $this->usuarios    = new UsuarioModelo();
        $this->videoApi    = new VideoApiService();
        $this->incidencias = new IncidenciaModelo();
        $this->escrow      = new EscrowService();
    }

    public function agendar(array $req): void
    {
        $user = AuthMiddleware::authenticate();
        $idCuidadora = (int)($req['id_cuidadora'] ?? 0);
        $fechaHora   = $req['fecha_hora'] ?? '';
        $hora        = $req['hora'] ?? '10:00';
        $plataforma  = $req['plataforma'] ?? 'google-meet';

        if (!$idCuidadora || !$fechaHora) {
            Response::error('id_cuidadora y fecha_hora son requeridos');
        }

        $cuidadora = $this->usuarios->buscarPorId($idCuidadora);
        $emailAdmin = $this->usuarios->emailAdminActivo();

        if (!$cuidadora || !$emailAdmin) {
            Response::error('PARTICIPANTES_INVALIDOS', 400);
        }

        $sala = $this->videoApi->crearSala([
            'titulo'        => "CERTINANAS · Entrevista de Conocimiento",
            'fecha_hora'    => $fechaHora,
            'participantes' => [
                ['email' => $user->Email,       'rol' => 'attendee'],
                ['email' => $cuidadora->Email,  'rol' => 'attendee'],
                ['email' => $emailAdmin,        'rol' => 'moderator'],
            ],
        ]);

        $idEntrevista = $this->entrevistas->crear([
            'id_familia'   => $user->Id,
            'id_cuidadora' => $idCuidadora,
            'fecha_hora'   => $fechaHora,
            'hora'         => $hora,
            'plataforma'   => $plataforma,
            'url_reunion'  => $sala->url,
            'email_admin'  => $emailAdmin,
            'estado'       => 'PROGRAMADA',
        ]);

        Response::success([
            'id_entrevista' => $idEntrevista,
            'url'           => $sala->url,
        ], 'Entrevista agendada');
    }

    public function registrarIngresoAdmin(int $idEntrevista): void
    {
        AuthMiddleware::requireAdmin();
        $e = $this->entrevistas->buscar($idEntrevista);
        if (!$e) {
            Response::notFound('Entrevista no encontrada');
        }

        $this->entrevistas->actualizar($idEntrevista, [
            'admin_ingreso_at' => date('c'),
            'estado'           => 'EN_CURSO',
        ]);
        Response::success(['url' => $e->Modalidad], 'Admin registrado en la reunión');
    }

    public function finalizar(int $idEntrevista): void
    {
        $e = $this->entrevistas->buscar($idEntrevista);
        if (!$e) {
            Response::notFound('Entrevista no encontrada');
        }

        $this->entrevistas->actualizar($idEntrevista, [
            'estado'               => 'SUPERVISADA',
            'evaluacion_habilitada'=> 1,
        ]);
        Response::success(null, 'Entrevista finalizada');
    }

    public function listarSupervision(): void
    {
        AuthMiddleware::requireAdmin();
        $list = $this->entrevistas->listarHoyYProximas();
        Response::success($list);
    }

    public function justificarFalta(int $idEntrevista, array $body): void
    {
        AuthMiddleware::requireAdmin();
        $justificacion = trim($body['justificacion'] ?? '');

        if (strlen($justificacion) < 10) {
            Response::error('JUSTIFICACION_INSUFICIENTE. Mínimo 10 caracteres.');
        }

        $this->entrevistas->actualizar($idEntrevista, [
            'justificacion'    => $justificacion,
            'escrow_bloqueado' => 0,
        ]);
        $this->escrow->desbloquearPorEntrevista($idEntrevista);

        Response::success(null, 'Falta justificada. Escrow desbloqueado.');
    }
}
