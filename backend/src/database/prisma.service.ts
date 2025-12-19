import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Servicio de Prisma
 * Maneja la conexión con la base de datos PostgreSQL
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'], // Logs de consultas en desarrollo
    });
  }

  /**
   * Se ejecuta cuando se inicializa el módulo
   * Conecta a la base de datos
   */
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Conectado a la base de datos PostgreSQL');
  }

  /**
   * Se ejecuta cuando se destruye el módulo
   * Desconecta de la base de datos
   */
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Desconectado de la base de datos PostgreSQL');
  }

  /**
   * Limpia todas las tablas (solo para testing)
   * ⚠️ NO usar en producción
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('No se puede limpiar la base de datos en producción');
    }

    // Desactivar checks de foreign keys temporalmente
    await this.$executeRawUnsafe('SET session_replication_role = replica;');

    // Obtener todas las tablas
    const tables = await this.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;

    // Limpiar cada tabla
    for (const { tablename } of tables) {
      if (tablename !== '_prisma_migrations') {
        await this.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      }
    }

    // Reactivar checks
    await this.$executeRawUnsafe('SET session_replication_role = DEFAULT;');

    console.log('🧹 Base de datos limpiada');
  }
}
