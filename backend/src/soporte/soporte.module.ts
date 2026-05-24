import { Module } from '@nestjs/common';
import { Controller, Get, Post, Patch, Body, Param, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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

  responder(ticketId: number, mensaje: string, esAgente: boolean) {
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

  @Post('tickets') crear(@Request() req, @Body() d: any) { return this.s.crearTicket(req.user.id, d); }
  @Get('mis-tickets') misTickets(@Request() req) { return this.s.misTickets(req.user.id); }
  @Get('admin/tickets') listarTodos() { return this.s.listarTodos(); }
  @Post('tickets/:id/responder') responder(@Param('id', ParseIntPipe) id: number, @Body() b: any, @Request() req) {
    const esAgente = ['ADMIN', 'GERENTE', 'OPERADOR'].includes(req.user.rol);
    return this.s.responder(id, b.mensaje, esAgente);
  }
  @Patch('tickets/:id/estado') actualizarEstado(@Param('id', ParseIntPipe) id: number, @Body() b: any) {
    return this.s.actualizarEstado(id, b.estado);
  }
}

@Module({ controllers: [SoporteController], providers: [SoporteService] })
export class SoporteModule {}
