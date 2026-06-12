import { Module } from '@nestjs/common';
import { Controller, Get, Post, Patch, Body, Param, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActualizarEstadoTicketDto, CrearTicketDto, ResponderTicketDto } from './dto/soporte.dto';

@Injectable()
export class SoporteService {
  constructor(private prisma: PrismaService) {}

  crearTicket(usuarioId: number, datos: any) {
    return this.prisma.ticketSoporte.create({
      data: { ...datos, usuarioId },
      include: { usuario: { select: { nombre: true, apellido: true } } },
    });
  }

  misTickets(usuarioId: number) {
    return this.prisma.ticketSoporte.findMany({
      where: { usuarioId },
      include: { mensajes: true },
      orderBy: { creadoEn: 'desc' },
    });
  }

  listarTodos() {
    return this.prisma.ticketSoporte.findMany({
      include: {
        usuario: { select: { nombre: true, apellido: true, correo: true } },
        mensajes: { take: 1, orderBy: { creadoEn: 'desc' } },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async obtenerTicket(id: number, usuarioId?: number, esAgente?: boolean) {
    const ticket = await this.prisma.ticketSoporte.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nombre: true, apellido: true, correo: true, telefono: true } },
        mensajes: { orderBy: { creadoEn: 'asc' } },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    if (!esAgente && ticket.usuarioId !== usuarioId) {
      throw new ForbiddenException('No puedes ver tickets de otro usuario');
    }

    return ticket;
  }

  async responder(ticketId: number, usuarioId: number, mensaje: string, esAgente: boolean) {
    const ticket = await this.prisma.ticketSoporte.findUnique({
      where: { id: ticketId },
      select: { id: true, usuarioId: true },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }
    if (!esAgente && ticket.usuarioId !== usuarioId) {
      throw new ForbiddenException('No puedes responder tickets de otro usuario');
    }

    return this.prisma.mensajeTicket.create({
      data: { ticketId, mensaje, esAgente },
    });
  }

  actualizarEstado(id: number, estado: string) {
    return this.prisma.ticketSoporte.update({ where: { id }, data: { estado: estado as any } });
  }
}

@UseGuards(JwtAuthGuard)
@Controller('soporte')
export class SoporteController {
  constructor(private s: SoporteService) {}

  @Post('tickets') crear(@Request() req, @Body() d: CrearTicketDto) { return this.s.crearTicket(req.user.id, d); }
  @Get('mis-tickets') misTickets(@Request() req) { return this.s.misTickets(req.user.id); }
  @Get('tickets/:id') obtener(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const esAgente = ['ADMIN', 'GERENTE', 'OPERADOR'].includes(req.user.rol);
    return this.s.obtenerTicket(id, req.user.id, esAgente);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Get('admin/tickets') listarTodos() { return this.s.listarTodos(); }
  @Post('tickets/:id/responder') responder(@Param('id', ParseIntPipe) id: number, @Body() b: ResponderTicketDto, @Request() req) {
    const esAgente = ['ADMIN', 'GERENTE', 'OPERADOR'].includes(req.user.rol);
    return this.s.responder(id, req.user.id, b.mensaje, esAgente);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Patch('tickets/:id/estado') actualizarEstado(@Param('id', ParseIntPipe) id: number, @Body() b: ActualizarEstadoTicketDto) {
    return this.s.actualizarEstado(id, b.estado);
  }
}

@Module({ controllers: [SoporteController], providers: [SoporteService] })
export class SoporteModule {}
