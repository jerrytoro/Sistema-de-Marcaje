import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GenerarReporteDependenciaDto {
  @IsString()
  @IsNotEmpty()
  dependencia: string;

  @IsNumber()
  @IsNotEmpty()
  anio: number;

  @IsNumber()
  @IsNotEmpty()
  mes: number;
}
