import { Injectable, Inject,NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { IRecogidaRepository } from '../../domain/recogida/recogida.repository.interface';
import { Recogida } from '../../domain/recogida/recogida.entity';

@Injectable()
export class RecogidaUseCase {
  constructor(
    @Inject('IRecogidaRepository')
    public readonly recogidaRepo: IRecogidaRepository) {}

  async listarTodas(): Promise<Recogida[]> {
    return this.recogidaRepo.findAll();
  }

  async buscarPorSolicitud(idSolicitud: string): Promise<Recogida> {
    const recogida = await this.recogidaRepo.findBySolicitud(idSolicitud);
    if (!recogida) {
      throw new NotFoundException(`No se encontró recogida para la solicitud ${idSolicitud}`);
    }
    return recogida;
  }

  async listarPorConductor(conductorId: string): Promise<Recogida[]> {
    return this.recogidaRepo.findByConductor(conductorId);
  }

  async listarDisponibles(): Promise<Recogida[]> {
    return this.recogidaRepo.findDisponibles();
  }

  async asignarConductor(id: number, conductorId: string): Promise<Recogida> {
    const recogida = await this.recogidaRepo.findById(id);
    if (!recogida) {
      throw new NotFoundException(`Recogida ${id} no encontrada`);
    }

    if (recogida.estaRealizada()) {
      throw new BadRequestException('No se puede asignar una recogida ya realizada');
    }

    if (recogida.idConductor) {
      throw new ConflictException(`Ya está asignada al conductor: ${recogida.idConductor}`);
    }

    return this.recogidaRepo.asignarConductor(id, conductorId);
  }

  async realizarRecogida(id: number, conductorId: string): Promise<Recogida> {
    const recogida = await this.recogidaRepo.findById(id);
    if (!recogida) {
      throw new NotFoundException(`Recogida ${id} no encontrada`);
    }

    if (recogida.estaRealizada()) {
      throw new BadRequestException(`La recogida ${id} ya fue realizada`);
    }

    return this.recogidaRepo.marcarRealizada(id, conductorId);
  }

  async eliminar(id: number): Promise<void> {
    const recogida = await this.recogidaRepo.findById(id);
    if (!recogida) {
      throw new NotFoundException(`Recogida ${id} no encontrada`);
    }

    if (recogida.estaRealizada()) {
      throw new BadRequestException('No se puede eliminar una recogida ya realizada');
    }

    await this.recogidaRepo.delete(id);
  }
}