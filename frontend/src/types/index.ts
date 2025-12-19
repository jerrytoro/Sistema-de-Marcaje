// ========================================
// TIPOS Y ENUMS
// ========================================

export enum RolUsuario {
  ADMIN = 'ADMIN',
  RRHH = 'RRHH',
  FUNCIONARIO = 'FUNCIONARIO',
}

export enum TipoMarcaje {
  INGRESO_MANANA = 'INGRESO_MANANA',
  SALIDA_DESCANSO = 'SALIDA_DESCANSO',
  INGRESO_TARDE = 'INGRESO_TARDE',
  SALIDA_FINAL = 'SALIDA_FINAL',
}

// ========================================
// INTERFACES
// ========================================

export interface Usuario {
  id: number;
  username: string;
  rol: RolUsuario;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
  funcionario?: Funcionario;
}

export interface Funcionario {
  id: number;
  nombre: string;
  apellido: string;
  cargo: string;
  dependencia: string;
  estado: boolean;
  usuarioId: number;
  createdAt: string;
  updatedAt: string;
  telegramChatId?: string | null;
  facialDataRegistered?: boolean;
  usuario?: Usuario;
}

export interface ConfiguracionHorario {
  id: number;
  tipoMarcaje: TipoMarcaje;
  horaProgramada: string;
  toleranciaMinutos: number;
  createdAt: string;
  updatedAt: string;
}

export interface Asistencia {
  id: number;
  funcionarioId: number;
  fecha: string;
  horaMarcaje: string;
  tipoMarcaje: TipoMarcaje;
  minutosTardanza: number;
  verificado: boolean;
  observacion?: string;
  createdAt: string;
  funcionario?: Funcionario;
}

export interface ResumenMensual {
  id: number;
  funcionarioId: number;
  anio: number;
  mes: number;
  totalDiasTrabajados: number;
  totalMinutosTardanza: number;
  totalMinutosTrabajados: number;
  totalAusencias: number;
  totalPermisos: number;
  reporteGenerado: boolean;
  urlReportePdf?: string;
  fechaGeneracion: string;
  funcionario?: Funcionario;
}

export interface Reporte {
  id: number;
  funcionarioId: number;
  mes: number;
  anio: number;
  archivoPdf: string;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
  funcionario?: Funcionario;
}

// ========================================
// DTOs
// ========================================

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: Usuario;
}

export interface CreateUsuarioDto {
  username: string;
  password: string;
  rol?: RolUsuario | string;
  nombre: string;
  apellido: string;
  cargo: string;
  dependencia: string;
}

export interface UpdateUsuarioDto {
  username?: string;
  rol?: RolUsuario | string;
  cargo?: string;
  dependencia?: string;
  estado?: boolean;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface CreateAsistenciaDto {
  funcionarioId: number;
  fecha: string;
  horaMarcaje: string;
  tipoMarcaje: TipoMarcaje;
  minutosTardanza?: number;
  verificado?: boolean;
  observacion?: string;
}

export interface UpdateAsistenciaDto {
  fecha?: string;
  horaMarcaje?: string;
  tipoMarcaje?: TipoMarcaje;
  minutosTardanza?: number;
  verificado?: boolean;
  observacion?: string;
}

export interface GenerarReporteDto {
  funcionarioId: number;
  anio: number;
  mes: number;
}

// ========================================
// ESTADÍSTICAS
// ========================================

export interface EstadisticasAsistencias {
  totalMarcajes: number;
  totalTardanzas: number;
  minutosTardanzaTotal: number;
  minutosTardanzaPromedio: number;
}

export interface EstadisticasDashboard {
  totalFuncionarios: number;
  totalUsuarios: number;
  asistenciasHoy: number;
  tardanzasHoy: number;
}

// ========================================
// UTILIDADES
// ========================================

export interface ApiError {
  message: string;
  error?: string;
  statusCode: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface DateRangeParams {
  mes?: number;
  anio?: number;
}