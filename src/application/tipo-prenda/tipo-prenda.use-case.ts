import { Injectable, Inject, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { ITipoPrendaRepository } from '../../domain/tipo-prenda/tipo-prenda.repository.interface';
import { TipoPrenda } from '../../domain/tipo-prenda/tipo-prenda.entity';
import { CrearTipoPrendaDto } from './dto/crear-tipo-prenda.dto';
import { ActualizarTipoPrendaDto } from './dto/actualizar-tipo-prenda.dto';
import { TipoPrendaResponseDto } from './dto/tipo-prenda-response.dto';

@Injectable()
export class TipoPrendaUseCase {
  constructor(
    @Inject('ITipoPrendaRepository')
    private readonly tipoPrendaRepository: ITipoPrendaRepository,
  ) {}

  async crearTipo(dto: CrearTipoPrendaDto): Promise<TipoPrendaResponseDto> {

    // Normalizar el tipo
    const tipoNormalizado = dto.tipo.trim().charAt(0).toUpperCase() + dto.tipo.trim().slice(1).toLowerCase();
    
    // Verificar si ya existe
    const existe = await this.tipoPrendaRepository.findByTipo(tipoNormalizado);
    if (existe) {
      throw new ConflictException(`El tipo de prenda "${tipoNormalizado}" ya existe`);
    }

    // Crear entidad
    const tipoPrenda = new TipoPrenda(tipoNormalizado);
    
    // Guardar
    const guardado = await this.tipoPrendaRepository.save(tipoPrenda);

    return { tipo: guardado.tipo };
  }

  async listarTipos(): Promise<TipoPrendaResponseDto[]> {
    
    const tipos = await this.tipoPrendaRepository.findAll();

    return tipos.map(tipo => ({ tipo: tipo.tipo }));
  }

  async actualizarTipo(tipoActual: string, dto: ActualizarTipoPrendaDto): Promise<TipoPrendaResponseDto> {

    // Normalizar el nuevo tipo
    const tipoNormalizado = dto.tipo.trim().charAt(0).toUpperCase() + dto.tipo.trim().slice(1).toLowerCase();
    
    // Verificar que el tipo actual existe
    const existe = await this.tipoPrendaRepository.findByTipo(tipoActual);
    if (!existe) {
      throw new NotFoundException(`El tipo de prenda "${tipoActual}" no existe`);
    }

    // Verificar si el nuevo tipo ya existe (y no es el mismo)
    if (tipoActual !== tipoNormalizado) {
      const yaExiste = await this.tipoPrendaRepository.findByTipo(tipoNormalizado);
      if (yaExiste) {
        throw new ConflictException(`El tipo de prenda "${tipoNormalizado}" ya existe`);
      }
    }

    // Verificar que el tipo no esté en uso
    const tieneSolicitudes = await this.tipoPrendaRepository.tieneSolicitudes(tipoActual);
    if (tieneSolicitudes) {
      throw new BadRequestException(
        `No se puede actualizar el tipo "${tipoActual}" porque está siendo usado en solicitudes`
      );
    }

    // Eliminar el tipo actual
    await this.tipoPrendaRepository.delete(tipoActual);
    
    // Crear el nuevo tipo
    const nuevoTipo = new TipoPrenda(tipoNormalizado);
    const guardado = await this.tipoPrendaRepository.save(nuevoTipo);

    return { tipo: guardado.tipo };
  }

  async eliminarTipo(tipo: string): Promise<void> {

    // Verificar que el tipo existe
    const existe = await this.tipoPrendaRepository.findByTipo(tipo);
    if (!existe) {
      throw new NotFoundException(`El tipo de prenda "${tipo}" no existe`);
    }

    // Verificar que no esté en uso
    const tieneSolicitudes = await this.tipoPrendaRepository.tieneSolicitudes(tipo);
    if (tieneSolicitudes) {
      throw new BadRequestException(
        `No se puede eliminar el tipo "${tipo}" porque está siendo usado en solicitudes`
      );
    }

    // Eliminar
    await this.tipoPrendaRepository.delete(tipo);
  }
}