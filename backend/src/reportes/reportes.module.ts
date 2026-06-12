import { Module } from '@nestjs/common';
import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaModule } from '../common/prisma/prisma.module';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
// PDFKit es CommonJS: `import PDFDocument from 'pdfkit'` falla en runtime
// con "pdfkit_1.default is not a constructor"
import PDFDocument = require('pdfkit');

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async resumenDashboard() {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const [
      totalProductos,
      totalUsuarios,
      pedidosMes,
      ventasMes,
      productosStockBajo,
      ticketsAbiertos,
    ] = await Promise.all([
      this.prisma.producto.count({ where: { activo: true } }),
      this.prisma.usuario.count({ where: { rol: 'CLIENTE' } }),
      this.prisma.pedido.count({ where: { creadoEn: { gte: inicioMes } } }),
      this.prisma.pedido.aggregate({
        where: { creadoEn: { gte: inicioMes }, estadoPago: 'PAGADO' },
        _sum: { total: true },
      }),
      this.prisma.varianteProducto.count({ where: { stock: { lte: 5 }, activo: true } }),
      this.prisma.ticketSoporte.count({ where: { estado: 'ABIERTO' } }),
    ]);

    return {
      totalProductos,
      totalUsuarios,
      pedidosMes,
      ventasMes: ventasMes._sum.total || 0,
      productosStockBajo,
      ticketsAbiertos,
    };
  }

  async ventasPorDia(dias = 30) {
    const desde = new Date();
    desde.setDate(desde.getDate() - dias);

    const pedidos = await this.prisma.pedido.findMany({
      where: { creadoEn: { gte: desde }, estadoPago: 'PAGADO' },
      select: { creadoEn: true, total: true },
    });

    const grupos = new Map();
    for (const pedido of pedidos) {
      const fecha = pedido.creadoEn.toISOString().split('T')[0];
      const grupo = grupos.get(fecha) || { total: 0, count: 0 };
      grupo.total += Number(pedido.total);
      grupo.count += 1;
      grupos.set(fecha, grupo);
    }

    const resultado = Array.from(grupos.entries())
      .map(([fecha, datos]) => ({
        fecha,
        total: datos.total,
        cantidad: datos.count
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    return resultado;
  }

  async productosMasVendidos(limite = 100) {
    return this.prisma.producto.findMany({
      where: { activo: true },
      orderBy: { totalVentas: 'desc' },
      take: limite,
      select: { 
        id: true, 
        nombre: true, 
        totalVentas: true, 
        imagenPrincipal: true,
        variantes: { 
          where: { activo: true, esPrincipal: true }, 
          take: 1,
          select: { precioBase: true, precioOferta: true }
        }
      },
    });
  }

  async obtenerPedidosParaExportar() {
    return this.prisma.pedido.findMany({
      include: { usuario: { select: { id: true, correo: true, nombre: true } } },
      orderBy: { creadoEn: 'desc' },
      take: 200
    });
  }

  private crearPDFBuffer(escribir: (doc: InstanceType<typeof PDFDocument>) => Promise<void>): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      escribir(doc)
        .then(() => doc.end())
        .catch(reject);
    });
  }

  async generarPDFVentas(): Promise<Buffer> {
    const ventas = await this.ventasPorDia(30);

    return this.crearPDFBuffer(async (doc) => {
      doc.fontSize(24).fillColor('#0D1B2A').text('REPORTE DE VENTAS', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).fillColor('#666666').text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, { align: 'center' });
      doc.moveDown(2);

      if (ventas.length === 0) {
        doc.fillColor('#999999').text('No hay datos de ventas para mostrar.', { align: 'center' });
        return;
      }

      ventas.forEach((v) => {
        doc.fillColor('#0D1B2A').text(`Fecha: ${v.fecha} | Pedidos: ${v.cantidad} | Total: S/ ${v.total.toFixed(2)}`);
      });
    });
  }

  async generarPDFProductos(): Promise<Buffer> {
    const productos = await this.productosMasVendidos(50);

    return this.crearPDFBuffer(async (doc) => {
      doc.fontSize(24).fillColor('#0D1B2A').text('REPORTE DE PRODUCTOS MÁS VENDIDOS', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).fillColor('#666666').text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, { align: 'center' });
      doc.moveDown(2);

      if (productos.length === 0) {
        doc.fillColor('#999999').text('No hay productos para mostrar.', { align: 'center' });
        return;
      }

      productos.forEach((p, idx) => {
        const precio = p.variantes[0]?.precioOferta || p.variantes[0]?.precioBase || 0;
        doc.fillColor('#0D1B2A').text(`${idx + 1}. ${p.nombre} | Ventas: ${p.totalVentas} | Precio: S/ ${Number(precio).toFixed(2)}`);
      });
    });
  }

  async generarPDFPedidos(): Promise<Buffer> {
    const pedidos = await this.obtenerPedidosParaExportar();

    return this.crearPDFBuffer(async (doc) => {
      doc.fontSize(24).fillColor('#0D1B2A').text('REPORTE DE PEDIDOS', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).fillColor('#666666').text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, { align: 'center' });
      doc.moveDown(2);

      if (pedidos.length === 0) {
        doc.fillColor('#999999').text('No hay pedidos para mostrar.', { align: 'center' });
        return;
      }

      (pedidos as any[]).forEach((p) => {
        doc.fillColor('#0D1B2A').text(
          `Pedido #${p.id} | Cliente: ${p.usuario?.nombre || p.usuario?.correo || 'N/A'} | Total: S/ ${Number(p.total).toFixed(2)} | Estado: ${p.estado}`,
        );
      });
    });
  }

  // Generar CSV de ventas
  async generarCSVVentas(): Promise<string> {
    const ventas = await this.ventasPorDia(30);
    const rows = ventas.map(v => ({
      fecha: v.fecha,
      cantidad_pedidos: v.cantidad,
      total: Number(v.total).toFixed(2)
    }));

    let csv = 'Fecha,Cantidad de Pedidos,Total (S/)\n';
    rows.forEach(r => {
      csv += `${r.fecha},${r.cantidad_pedidos},${r.total}\n`;
    });

    return csv;
  }

  // Generar CSV de productos
  async generarCSVProductos(): Promise<string> {
    const productos = await this.productosMasVendidos(100);
    const rows = productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      total_ventas: p.totalVentas,
      precio: Number(p.variantes[0]?.precioOferta || p.variantes[0]?.precioBase || 0).toFixed(2)
    }));

    let csv = 'ID,Nombre,Total Ventas,Precio (S/)\n';
    rows.forEach(r => {
      csv += `${r.id},"${r.nombre}",${r.total_ventas},${r.precio}\n`;
    });

    return csv;
  }

  // Generar CSV de pedidos
  async generarCSVPedidos(): Promise<string> {
    const pedidos = await this.obtenerPedidosParaExportar();
    const rows = (pedidos as any[]).map(p => ({
      id: p.id,
      cliente: p.usuario?.nombre || p.usuario?.correo || 'N/A',
      total: Number(p.total).toFixed(2),
      estado: p.estado,
      estado_pago: p.estadoPago,
      fecha: p.creadoEn.toISOString().split('T')[0]
    }));

    let csv = 'ID,Cliente,Total (S/),Estado,Estado Pago,Fecha\n';
    rows.forEach(r => {
      csv += `${r.id},"${r.cliente}",${r.total},${r.estado},${r.estado_pago},${r.fecha}\n`;
    });

    return csv;
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'GERENTE', 'OPERADOR')
@Controller('reportes')
export class ReportesController {
  constructor(private s: ReportesService) {}

  @Get('dashboard') dashboard() { return this.s.resumenDashboard(); }
  @Get('ventas-por-dia') ventasPorDia() { return this.s.ventasPorDia(); }
  @Get('productos-mas-vendidos') masVendidos() { return this.s.productosMasVendidos(); }

  // PDF Endpoints
  @Get('ventas/pdf')
  async descargarPDFVentas(@Res() res: Response) {
    try {
      const pdf = await this.s.generarPDFVentas();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-ventas.pdf');
      res.send(pdf);
    } catch (error) {
      res.status(500).send({ message: 'Error al generar PDF' });
    }
  }

  @Get('productos/pdf')
  async descargarPDFProductos(@Res() res: Response) {
    try {
      const pdf = await this.s.generarPDFProductos();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-productos.pdf');
      res.send(pdf);
    } catch (error) {
      res.status(500).send({ message: 'Error al generar PDF' });
    }
  }

  @Get('pedidos/pdf')
  async descargarPDFPedidos(@Res() res: Response) {
    try {
      const pdf = await this.s.generarPDFPedidos();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-pedidos.pdf');
      res.send(pdf);
    } catch (error) {
      res.status(500).send({ message: 'Error al generar PDF' });
    }
  }

  // CSV Endpoints
  @Get('ventas/csv')
  async descargarCSVVentas(@Res() res: Response) {
    try {
      const csv = await this.s.generarCSVVentas();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-ventas.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).send({ message: 'Error al generar CSV' });
    }
  }

  @Get('productos/csv')
  async descargarCSVProductos(@Res() res: Response) {
    try {
      const csv = await this.s.generarCSVProductos();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-productos.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).send({ message: 'Error al generar CSV' });
    }
  }

  @Get('pedidos/csv')
  async descargarCSVPedidos(@Res() res: Response) {
    try {
      const csv = await this.s.generarCSVPedidos();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-pedidos.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).send({ message: 'Error al generar CSV' });
    }
  }
}

@Module({ imports: [PrismaModule], controllers: [ReportesController], providers: [ReportesService] })
export class ReportesModule {}
