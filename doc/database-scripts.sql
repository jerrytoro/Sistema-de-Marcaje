-- ============================================
-- CONSULTAS ÚTILES Y VISTAS
-- Sistema de Control de Asistencia
-- ============================================

-- ============================================
-- VISTA: Resumen Mensual de Asistencias
-- Propósito: Calcular totales mensuales por funcionario
-- ============================================
CREATE OR REPLACE VIEW vista_resumen_mensual_asistencias AS
SELECT 
    f.id AS funcionario_id,
    CONCAT(f.nombre, ' ', f.apellido) AS nombre_completo,
    f.cargo,
    f.dependencia,
    EXTRACT(YEAR FROM a.fecha) AS año,
    EXTRACT(MONTH FROM a.fecha) AS mes,
    COUNT(DISTINCT a.fecha) AS dias_trabajados,
    SUM(a.minutos_tardanza) AS total_minutos_tardanza,
    -- Calcular jornada total requiere los 4 marcajes del día
    SUM(
        CASE 
            WHEN a.tipo_marcaje = 'SALIDA_FINAL' THEN
                calcular_jornada_diaria(a.funcionario_id, a.fecha)
            ELSE 0
        END
    ) AS total_minutos_trabajados
FROM funcionarios f
LEFT JOIN asistencias a ON f.id = a.funcionario_id
WHERE f.estado = true
GROUP BY f.id, f.nombre, f.apellido, f.cargo, f.dependencia, año, mes
HAVING año IS NOT NULL AND mes IS NOT NULL
ORDER BY año DESC, mes DESC, nombre_completo;

-- ============================================
-- VISTA: Resumen Diario de Asistencias
-- Propósito: Ver todos los marcajes del día por funcionario
-- ============================================
CREATE OR REPLACE VIEW vista_asistencia_diaria AS
SELECT 
    f.id AS funcionario_id,
    CONCAT(f.nombre, ' ', f.apellido) AS nombre_completo,
    f.cargo,
    f.dependencia,
    a.fecha,
    MAX(CASE WHEN a.tipo_marcaje = 'INGRESO_MAÑANA' THEN a.hora_marcaje END) AS ingreso_mañana,
    MAX(CASE WHEN a.tipo_marcaje = 'SALIDA_DESCANSO' THEN a.hora_marcaje END) AS salida_descanso,
    MAX(CASE WHEN a.tipo_marcaje = 'INGRESO_TARDE' THEN a.hora_marcaje END) AS ingreso_tarde,
    MAX(CASE WHEN a.tipo_marcaje = 'SALIDA_FINAL' THEN a.hora_marcaje END) AS salida_final,
    COUNT(a.id) AS total_marcajes
FROM funcionarios f
LEFT JOIN asistencias a ON f.id = a.funcionario_id
WHERE f.estado = true
GROUP BY f.id, f.nombre, f.apellido, f.cargo, f.dependencia, a.fecha
ORDER BY a.fecha DESC, nombre_completo;

-- ============================================
-- VISTA: Funcionarios con Usuario
-- Propósito: Ver datos completos de funcionario y su usuario
-- ============================================
CREATE OR REPLACE VIEW vista_funcionarios_completos AS
SELECT 
    f.id AS funcionario_id,
    f.nombre,
    f.apellido,
    CONCAT(f.nombre, ' ', f.apellido) AS nombre_completo,
    f.cargo,
    f.dependencia,
    f.estado AS funcionario_activo,
    u.id AS usuario_id,
    u.username,
    u.rol,
    u.estado AS usuario_activo,
    u.created_at AS fecha_registro
FROM funcionarios f
INNER JOIN usuarios u ON f.usuario_id = u.id;

-- ============================================
-- VISTA: Resumen de Notificaciones
-- Propósito: Ver estadísticas de notificaciones por asistencia
-- ============================================
CREATE OR REPLACE VIEW vista_resumen_notificaciones AS
SELECT 
    a.id AS asistencia_id,
    a.fecha,
    a.tipo_marcaje,
    CONCAT(f.nombre, ' ', f.apellido) AS nombre_completo,
    COUNT(ln.id) AS total_notificaciones,
    SUM(CASE WHEN ln.estado = 'ENVIADO' THEN 1 ELSE 0 END) AS enviadas,
    SUM(CASE WHEN ln.estado = 'FALLIDO' THEN 1 ELSE 0 END) AS fallidas,
    SUM(CASE WHEN ln.estado = 'PENDIENTE' THEN 1 ELSE 0 END) AS pendientes
FROM asistencias a
INNER JOIN funcionarios f ON a.funcionario_id = f.id
LEFT JOIN logs_notificacion ln ON a.id = ln.asistencia_id
GROUP BY a.id, a.fecha, a.tipo_marcaje, f.nombre, f.apellido;

-- ============================================
-- CONSULTA: Funcionarios sin marcajes hoy
-- Propósito: Identificar funcionarios que no han marcado asistencia hoy
-- ============================================
-- SELECT 
--     f.id,
--     CONCAT(f.nombre, ' ', f.apellido) AS nombre_completo,
--     f.cargo,
--     f.dependencia
-- FROM funcionarios f
-- WHERE f.estado = true
-- AND NOT EXISTS (
--     SELECT 1 FROM asistencias a 
--     WHERE a.funcionario_id = f.id 
--     AND a.fecha = CURRENT_DATE
-- );

-- ============================================
-- CONSULTA: Marcajes incompletos del día
-- Propósito: Funcionarios con menos de 4 marcajes en el día
-- ============================================
-- SELECT 
--     f.id,
--     CONCAT(f.nombre, ' ', f.apellido) AS nombre_completo,
--     COUNT(a.id) AS marcajes_realizados,
--     4 - COUNT(a.id) AS marcajes_faltantes
-- FROM funcionarios f
-- LEFT JOIN asistencias a ON f.id = a.funcionario_id 
--     AND a.fecha = CURRENT_DATE
-- WHERE f.estado = true
-- GROUP BY f.id, f.nombre, f.apellido
-- HAVING COUNT(a.id) < 4;

-- ============================================
-- CONSULTA: Reporte mensual de asistencia
-- Propósito: Conteo de marcajes por funcionario en un mes
-- ============================================
-- SELECT 
--     f.id,
--     CONCAT(f.nombre, ' ', f.apellido) AS nombre_completo,
--     f.cargo,
--     COUNT(DISTINCT a.fecha) AS dias_asistidos,
--     COUNT(a.id) AS total_marcajes,
--     ROUND(COUNT(a.id)::numeric / 4, 2) AS dias_completos
-- FROM funcionarios f
-- LEFT JOIN asistencias a ON f.id = a.funcionario_id
-- WHERE f.estado = true
-- AND EXTRACT(MONTH FROM a.fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
-- AND EXTRACT(YEAR FROM a.fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
-- GROUP BY f.id, f.nombre, f.apellido, f.cargo
-- ORDER BY nombre_completo;

-- ============================================
-- FUNCIÓN: Calcular tardanza en minutos
-- Compara la hora de marcaje con la hora programada
-- Solo aplica para INGRESO_MAÑANA e INGRESO_TARDE
-- ============================================
CREATE OR REPLACE FUNCTION calcular_tardanza(
    p_tipo_marcaje VARCHAR(20),
    p_hora_marcaje TIMESTAMP
) RETURNS INT AS $$
DECLARE
    v_hora_programada VARCHAR(5);
    v_minutos_programados INT;
    v_minutos_reales INT;
    v_diferencia INT;
BEGIN
    -- Solo calcular tardanza para ingresos
    IF p_tipo_marcaje NOT IN ('INGRESO_MAÑANA', 'INGRESO_TARDE') THEN
        RETURN 0;
    END IF;
    
    -- Obtener hora programada
    SELECT hora_programada INTO v_hora_programada
    FROM configuracion_horarios
    WHERE tipo_marcaje = p_tipo_marcaje::tipo_marcaje;
    
    -- Convertir hora programada a minutos (ej: "08:00" -> 480)
    v_minutos_programados := 
        (CAST(SPLIT_PART(v_hora_programada, ':', 1) AS INT) * 60) +
        CAST(SPLIT_PART(v_hora_programada, ':', 2) AS INT);
    
    -- Convertir hora real a minutos
    v_minutos_reales := 
        (EXTRACT(HOUR FROM p_hora_marcaje) * 60) +
        EXTRACT(MINUTE FROM p_hora_marcaje);
    
    -- Calcular diferencia
    v_diferencia := v_minutos_reales - v_minutos_programados;
    
    -- Si llegó temprano o a tiempo, tardanza = 0
    IF v_diferencia <= 0 THEN
        RETURN 0;
    ELSE
        RETURN v_diferencia;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Calcular jornada diaria en minutos
-- Suma el tiempo trabajado en la mañana y en la tarde
-- ============================================
CREATE OR REPLACE FUNCTION calcular_jornada_diaria(
    p_funcionario_id INT,
    p_fecha DATE
) RETURNS INT AS $$
DECLARE
    v_ingreso_manana TIMESTAMP;
    v_salida_descanso TIMESTAMP;
    v_ingreso_tarde TIMESTAMP;
    v_salida_final TIMESTAMP;
    v_jornada_manana INT;
    v_jornada_tarde INT;
BEGIN
    -- Obtener los 4 marcajes del día
    SELECT hora_marcaje INTO v_ingreso_manana
    FROM asistencias
    WHERE funcionario_id = p_funcionario_id
    AND fecha = p_fecha
    AND tipo_marcaje = 'INGRESO_MAÑANA';
    
    SELECT hora_marcaje INTO v_salida_descanso
    FROM asistencias
    WHERE funcionario_id = p_funcionario_id
    AND fecha = p_fecha
    AND tipo_marcaje = 'SALIDA_DESCANSO';
    
    SELECT hora_marcaje INTO v_ingreso_tarde
    FROM asistencias
    WHERE funcionario_id = p_funcionario_id
    AND fecha = p_fecha
    AND tipo_marcaje = 'INGRESO_TARDE';
    
    SELECT hora_marcaje INTO v_salida_final
    FROM asistencias
    WHERE funcionario_id = p_funcionario_id
    AND fecha = p_fecha
    AND tipo_marcaje = 'SALIDA_FINAL';
    
    -- Si faltan marcajes, retornar 0
    IF v_ingreso_manana IS NULL OR v_salida_descanso IS NULL OR
       v_ingreso_tarde IS NULL OR v_salida_final IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calcular jornada de la mañana
    v_jornada_manana := EXTRACT(EPOCH FROM (v_salida_descanso - v_ingreso_manana)) / 60;
    
    -- Calcular jornada de la tarde
    v_jornada_tarde := EXTRACT(EPOCH FROM (v_salida_final - v_ingreso_tarde)) / 60;
    
    -- Retornar total
    RETURN v_jornada_manana + v_jornada_tarde;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Verificar si el funcionario ya marcó un tipo de asistencia hoy
-- ============================================
CREATE OR REPLACE FUNCTION verificar_marcaje_existe(
    p_funcionario_id INT,
    p_tipo_marcaje VARCHAR(20)
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM asistencias
        WHERE funcionario_id = p_funcionario_id
        AND fecha = CURRENT_DATE
        AND tipo_marcaje = p_tipo_marcaje::tipo_marcaje
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Obtener el siguiente tipo de marcaje esperado
-- Retorna el tipo de marcaje que le corresponde al funcionario
-- según la hora actual y los marcajes ya realizados
-- ============================================
CREATE OR REPLACE FUNCTION obtener_siguiente_marcaje(
    p_funcionario_id INT
) RETURNS VARCHAR(20) AS $$
DECLARE
    v_marcajes_hoy INT;
    v_ultimo_marcaje VARCHAR(20);
BEGIN
    -- Contar marcajes de hoy
    SELECT COUNT(*) INTO v_marcajes_hoy
    FROM asistencias
    WHERE funcionario_id = p_funcionario_id
    AND fecha = CURRENT_DATE;
    
    -- Si no hay marcajes, debe ser INGRESO_MAÑANA
    IF v_marcajes_hoy = 0 THEN
        RETURN 'INGRESO_MAÑANA';
    END IF;
    
    -- Obtener el último tipo de marcaje
    SELECT tipo_marcaje INTO v_ultimo_marcaje
    FROM asistencias
    WHERE funcionario_id = p_funcionario_id
    AND fecha = CURRENT_DATE
    ORDER BY hora_marcaje DESC
    LIMIT 1;
    
    -- Determinar siguiente marcaje según el último
    CASE v_ultimo_marcaje
        WHEN 'INGRESO_MAÑANA' THEN RETURN 'SALIDA_DESCANSO';
        WHEN 'SALIDA_DESCANSO' THEN RETURN 'INGRESO_TARDE';
        WHEN 'INGRESO_TARDE' THEN RETURN 'SALIDA_FINAL';
        WHEN 'SALIDA_FINAL' THEN RETURN NULL; -- Ya completó los 4 marcajes
        ELSE RETURN NULL;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índice para búsquedas por fecha en asistencias
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha 
ON asistencias(fecha);

-- Índice para búsquedas de logs de notificación por estado
CREATE INDEX IF NOT EXISTS idx_logs_estado 
ON logs_notificacion(estado);

-- Índice para búsquedas de registros faciales activos
CREATE INDEX IF NOT EXISTS idx_registros_faciales_activo 
ON registros_faciales(activo);

-- ============================================
-- DATOS DE PRUEBA (SEED)
-- IMPORTANTE: Solo para desarrollo/testing
-- ============================================

-- Configuración de horarios (OBLIGATORIO - ejecutar en producción también)
INSERT INTO configuracion_horarios (tipo_marcaje, hora_programada, tolerancia_minutos) VALUES
('INGRESO_MAÑANA', '08:00', 0),
('SALIDA_DESCANSO', '12:00', 0),
('INGRESO_TARDE', '14:00', 0),
('SALIDA_FINAL', '18:00', 0)
ON CONFLICT (tipo_marcaje) DO NOTHING;

-- Usuario administrador por defecto
-- Password hasheado: "admin123" (debe cambiarse en producción)
-- INSERT INTO usuarios (username, password, rol, estado) VALUES
-- ('admin', '$2b$10$ejemplo_hash_bcrypt_aqui', 'ADMIN', true);

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Las vistas se actualizan automáticamente con los datos
-- 2. Las funciones pueden ser llamadas desde el backend
-- 3. Los índices mejoran el performance de las consultas
-- 4. Descomentar las consultas según necesidad
-- 5. El hash de password debe generarse con bcrypt desde el backend
