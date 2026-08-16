import { Injectable, NotFoundException, BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { IEntregaRepository } from '../../domain/entrega/entrega.repository.interface';
import { ISolicitudRepository } from "../../domain/solicitud/solicitud.repository.interface";
import { Entrega } from '../../domain/entrega/entrega.entity';
import { EstadoSolicitud } from '@shared/enums/estado-solicitud.enum';

@Injectable()
export class EntregaUseCase {
  constructor(
    @Inject('IEntregaRepository')
    public readonly entregaRepo: IEntregaRepository,
    @Inject('ISolicitudRepository')
    public readonly solicitudgaRepo: ISolicitudRepository) {}

  async listarTodas(): Promise<Entrega[]> {
    return this.entregaRepo.findAll();
  }

  async buscarPorSolicitud(idSolicitud: string): Promise<Entrega> {
    const entrega = await this.entregaRepo.findBySolicitud(idSolicitud);
    if (!entrega) {
      throw new NotFoundException(`No se encontró entrega para la solicitud ${idSolicitud}`);
    }
    return entrega;
  }

  async listarPorConductor(conductorId: string): Promise<Entrega[]> {
    return this.entregaRepo.findByConductor(conductorId);
  }

  async listarDisponibles(): Promise<Entrega[]> {
    return this.entregaRepo.findDisponibles();
  }

  async asignarConductor(id: number, conductorId: string): Promise<Entrega> {
    const entrega = await this.entregaRepo.findById(id);
    if (!entrega) {
      throw new NotFoundException(`Entrega ${id} no encontrada`);
    }

    if (entrega.estaRealizada()) {
      throw new BadRequestException('No se puede asignar una entrega ya realizada');
    }

    if (entrega.idConductor) {
      throw new ConflictException(`Ya está asignada al conductor: ${entrega.idConductor}`);
    }

    return this.entregaRepo.asignarConductor(id, conductorId);
  }

  async realizarEntrega(id: number, conductorId: string): Promise<Entrega> {
    const entrega = await this.entregaRepo.findById(id);
    if (!entrega) {
      throw new NotFoundException(`Entrega ${id} no encontrada`);
    }

    if (entrega.estaRealizada()) {
      throw new BadRequestException(`La entrega ${id} ya fue realizada`);
    }

    const actualizada = this.entregaRepo.marcarRealizada(id, conductorId);

    await this.solicitudgaRepo.updateEstado(entrega.idSolicitud, EstadoSolicitud.COMPLETADA)

    return actualizada
  }

  async eliminar(id: number): Promise<void> {
    const entrega = await this.entregaRepo.findById(id);
    if (!entrega) {
      throw new NotFoundException(`Entrega ${id} no encontrada`);
    }

    if (entrega.estaRealizada()) {
      throw new BadRequestException('No se puede eliminar una entrega ya realizada');
    }

    await this.entregaRepo.delete(id);
  }
}