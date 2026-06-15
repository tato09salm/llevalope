import { Controller, Get, UseGuards, Res, Request } from '@nestjs/common';
import { Response } from 'express';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'GERENTE', 'OPERADOR')
@Controller('reportes')
export class ReportesController {
  constructor(private reportesService: ReportesService) {}

  @Get('dashboard') 
  dashboard() { 
    return this.reportesService.resumenDashboard(); 
  }
  
  @Get('ventas-por-dia') 
  ventasPorDia() { 
    return this.reportesService.ventasPorDia(); 
  }
  
  @Get('productos-mas-vendidos') 
  masVendidos() { 
    return this.reportesService.productosMasVendidos(); 
  }

  // ===============================
  // PDF Endpoints
  // ===============================
  
  @Get('ventas/pdf')
  async descargarPDFVentas(@Res() res: Response, @Request() req: any) {
    try {
      const pdf = await this.reportesService.generarPDFVentas();
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
      const pdf = await this.reportesService.generarPDFProductos();
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
      const pdf = await this.reportesService.generarPDFPedidos();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-pedidos.pdf');
      res.send(pdf);
    } catch (error) {
      res.status(500).send({ message: 'Error al generar PDF' });
    }
  }

  @Get('inventario/pdf')
  async descargarPDFInventario(@Res() res: Response) {
    try {
      const pdf = await this.reportesService.generarPDFInventario();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-inventario.pdf');
      res.send(pdf);
    } catch (error) {
      res.status(500).send({ message: 'Error al generar PDF' });
    }
  }

  @Get('clientes/pdf')
  async descargarPDFClientes(@Res() res: Response) {
    try {
      const pdf = await this.reportesService.generarPDFClientes();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-clientes.pdf');
      res.send(pdf);
    } catch (error) {
      res.status(500).send({ message: 'Error al generar PDF' });
    }
  }

  // ===============================
  // Excel Endpoints
  // ===============================
  
  @Get('ventas/excel')
  async descargarExcelVentas(@Res() res: Response) {
    try {
      console.log('[ReportesController] Generando Excel de Ventas');
      const excel = await this.reportesService.generarExcelVentas();
      console.log('[ReportesController] Excel de Ventas generado, enviando respuesta');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-ventas.xlsx');
      res.send(excel);
    } catch (error) {
      console.error('[ReportesController] Error al generar Excel de Ventas:', error);
      res.status(500).send({ message: 'Error al generar Excel' });
    }
  }

  @Get('productos/excel')
  async descargarExcelProductos(@Res() res: Response) {
    try {
      console.log('[ReportesController] Generando Excel de Productos');
      const excel = await this.reportesService.generarExcelProductos();
      console.log('[ReportesController] Excel de Productos generado, enviando respuesta');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-productos.xlsx');
      res.send(excel);
    } catch (error) {
      console.error('[ReportesController] Error al generar Excel de Productos:', error);
      res.status(500).send({ message: 'Error al generar Excel' });
    }
  }

  @Get('pedidos/excel')
  async descargarExcelPedidos(@Res() res: Response) {
    try {
      console.log('[ReportesController] Generando Excel de Pedidos');
      const excel = await this.reportesService.generarExcelPedidos();
      console.log('[ReportesController] Excel de Pedidos generado, enviando respuesta');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-pedidos.xlsx');
      res.send(excel);
    } catch (error) {
      console.error('[ReportesController] Error al generar Excel de Pedidos:', error);
      res.status(500).send({ message: 'Error al generar Excel' });
    }
  }

  @Get('inventario/excel')
  async descargarExcelInventario(@Res() res: Response) {
    try {
      console.log('[ReportesController] Generando Excel de Inventario');
      const excel = await this.reportesService.generarExcelInventario();
      console.log('[ReportesController] Excel de Inventario generado, enviando respuesta');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-inventario.xlsx');
      res.send(excel);
    } catch (error) {
      console.error('[ReportesController] Error al generar Excel de Inventario:', error);
      res.status(500).send({ message: 'Error al generar Excel' });
    }
  }

  @Get('clientes/excel')
  async descargarExcelClientes(@Res() res: Response) {
    try {
      console.log('[ReportesController] Generando Excel de Clientes');
      const excel = await this.reportesService.generarExcelClientes();
      console.log('[ReportesController] Excel de Clientes generado, enviando respuesta');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-clientes.xlsx');
      res.send(excel);
    } catch (error) {
      console.error('[ReportesController] Error al generar Excel de Clientes:', error);
      res.status(500).send({ message: 'Error al generar Excel' });
    }
  }
}
