import { ScheduledTasksService } from './scheduled-tasks.service';
export declare class ScheduledTasksController {
    private readonly scheduledTasksService;
    constructor(scheduledTasksService: ScheduledTasksService);
    getEstadoTareas(): {
        tareas: {
            nombre: string;
            cron: string;
            descripcion: string;
            proximaEjecucion: string;
        }[];
        timeZone: string;
    };
    ejecutarTareaManual(nombreTarea: string): Promise<any>;
}
