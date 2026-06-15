import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import PDFDocument = require('pdfkit');
import ExcelJS from 'exceljs';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  // Paleta de colores de LlevaloPe
  private readonly colores = {
    azulOscuro: '#0D1B2A',
    azulCorporativo: '#1B263B',
    verdeAzulado: '#006D77',
    dorado: '#D4AF37',
    blancoSuave: '#F5F3EE',
    grisElegante: '#7A7D85',
  };

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
      include: {
        categoria: { select: { id: true, nombre: true } },
        variantes: {
          where: { activo: true },
          select: { id: true, stock: true, precioBase: true, precioOferta: true }
        }
      },
    });
  }

  async obtenerPedidosParaExportar() {
    return this.prisma.pedido.findMany({
      include: {
        usuario: { select: { id: true, correo: true, nombre: true, apellido: true } },
        items: { include: { variante: { include: { producto: true } } } }
      },
      orderBy: { creadoEn: 'desc' },
      take: 200
    });
  }

  async obtenerProductosParaReportes() {
    return this.prisma.producto.findMany({
      include: {
        categoria: { select: { nombre: true } },
        variantes: {
          where: { activo: true, esPrincipal: true },
          take: 1,
          select: { precioBase: true, precioOferta: true, stock: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });
  }

  async obtenerClientesParaReportes() {
    return this.prisma.usuario.findMany({
      where: { rol: 'CLIENTE' },
      include: {
        pedidos: {
          where: { estadoPago: 'PAGADO' },
          select: { total: true }
        }
      },
      orderBy: { creadoEn: 'desc' }
    });
  }

  async obtenerInventarioParaReportes() {
    return this.prisma.varianteProducto.findMany({
      where: { activo: true },
      include: { producto: true },
      orderBy: { stock: 'asc' }
    });
  }

  private crearPDFBuffer(escribir: (doc: InstanceType<typeof PDFDocument>) => Promise<void>): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, bufferPages: true });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      escribir(doc)
        .then(() => {
          this.agregarPiePaginaPDF(doc);
          doc.end();
        })
        .catch(reject);
    });
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto);
  }

  // Método auxiliar para dibujar encabezado en PDF
  private dibujarEncabezadoPDF(doc: InstanceType<typeof PDFDocument>, titulo: string, usuario?: string, periodo?: string) {
    // Línea decorativa dorada
    doc.moveTo(50, 70).lineTo(550, 70).strokeColor(this.colores.dorado).lineWidth(3).stroke();
    
    // Logo / Marca
    doc.fillColor(this.colores.azulOscuro).fontSize(28).font('Helvetica-Bold').text('Llevalo', 50, 80);
    doc.fillColor(this.colores.dorado).fontSize(28).text('Pe', 50 + doc.widthOfString('Llevalo'), 80, { continued: false });
    
    // Título del reporte
    doc.moveDown();
    doc.fillColor(this.colores.azulOscuro).fontSize(20).font('Helvetica-Bold').text(titulo, { align: 'center' });
    
    // Información adicional
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(this.colores.grisElegante).font('Helvetica');
    if (usuario) doc.text(`Generado por: ${usuario}`, { align: 'center' });
    doc.text(`Fecha: ${this.formatearFecha(new Date())}`, { align: 'center' });
    if (periodo) doc.text(`Periodo: ${periodo}`, { align: 'center' });
    
    doc.moveDown(2);
  }

  // Método auxiliar para mostrar resumen como texto plano
  private dibujarResumenTexto(doc: InstanceType<typeof PDFDocument>, resumen: { titulo: string; valor: string }[]) {
    const colWidth = 220;
    const startX = 50;
    const startY = doc.y;
    const lineHeight = 25;

    resumen.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = startX + col * (colWidth + 60);
      const y = startY + row * lineHeight;

      doc.fillColor(this.colores.azulOscuro);
      doc.fontSize(10).font('Helvetica-Bold').text(item.titulo + ':', x, y);
      doc.fontSize(14).font('Helvetica').text(item.valor, x + doc.widthOfString(item.titulo + ':') + 5, y, { continued: false });
    });

    doc.y = startY + (Math.ceil(resumen.length / 2)) * lineHeight + 30;
  }

  // Método auxiliar para dibujar tablas
  private dibujarTablaPDF(doc: InstanceType<typeof PDFDocument>, headers: string[], data: any[][], colWidths?: number[]) {
    const tableTop = doc.y;
    const tableLeft = 50;
    const rowHeight = 25;
    const cellPadding = 5;
    const widths = colWidths || headers.map(() => 500 / headers.length);

    // Encabezados
    doc.fillColor(this.colores.azulCorporativo);
    doc.rect(tableLeft, tableTop, 500, rowHeight).fill();
    doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold');
    
    let currentX = tableLeft;
    headers.forEach((header, i) => {
      doc.text(header, currentX + cellPadding, tableTop + cellPadding + 5, {
        width: widths[i] - cellPadding * 2,
        align: 'left'
      });
      currentX += widths[i];
    });

    // Filas de datos
    data.forEach((row, rowIndex) => {
      const y = tableTop + (rowIndex + 1) * rowHeight;
      
      // Color alternado
      if (rowIndex % 2 === 0) {
        doc.fillColor('#F9F9F9');
      } else {
        doc.fillColor('#FFFFFF');
      }
      doc.rect(tableLeft, y, 500, rowHeight).fill();

      // Contenido de la fila
      doc.fillColor(this.colores.azulOscuro).fontSize(9).font('Helvetica');
      let x = tableLeft;
      row.forEach((cell, i) => {
        doc.text(String(cell || ''), x + cellPadding, y + cellPadding + 5, {
          width: widths[i] - cellPadding * 2,
          align: 'left'
        });
        x += widths[i];
      });

      // Verificar si necesitamos nueva página (antes de que se termine la página)
      if (y + rowHeight > 700) {
        doc.addPage();
      }
    });

    doc.y = tableTop + (data.length + 1) * rowHeight + 20;
  }

  // Método auxiliar para pie de página
  private agregarPiePaginaPDF(doc: InstanceType<typeof PDFDocument>) {
    // @ts-ignore: PDFKit types might not be perfect
    const pageRange = doc.bufferedPageRange ? doc.bufferedPageRange() : { start: 0, count: 1 };
    const pageCount = pageRange.count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      // Línea divisoria
      doc.moveTo(50, 730).lineTo(550, 730).strokeColor(this.colores.grisElegante).lineWidth(1).stroke();
      
      // Contenido del pie (solo una línea)
      doc.fontSize(9).fillColor(this.colores.grisElegante).font('Helvetica');
      doc.text('LlevaloPe © 2026', 50, 740);
      doc.text(`Página ${i + 1} de ${pageCount}`, 50, 740, { align: 'right' });
    }
  }

  // ===============================
  // REPORTES PDF
  // ===============================

  async generarPDFVentas(): Promise<Buffer> {
    const ventas = await this.ventasPorDia(30);
    const masVendidos = await this.productosMasVendidos(10);
    const pedidos = await this.obtenerPedidosParaExportar();
    
    const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
    const totalPedidos = ventas.reduce((sum, v) => sum + v.cantidad, 0);
    const ticketPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

    return this.crearPDFBuffer(async (doc) => {
      this.dibujarEncabezadoPDF(doc, 'REPORTE DE VENTAS', 'Administrador', 'Últimos 30 días');
      
      // Resumen ejecutivo como texto plano
      this.dibujarResumenTexto(doc, [
        { titulo: 'Ventas Totales', valor: this.formatearMonto(totalVentas) },
        { titulo: 'Pedidos Totales', valor: String(totalPedidos) },
        { titulo: 'Ticket Promedio', valor: this.formatearMonto(ticketPromedio) },
        { titulo: 'Clientes', valor: String(new Set(pedidos.map(p => p.usuarioId)).size) }
      ]);

      // Tabla de ventas por día
      doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.azulOscuro).text('Ventas por Día');
      doc.moveDown(0.5);
      
      const headersVentas = ['Fecha', 'Pedidos', 'Monto Total'];
      const dataVentas = ventas.map(v => [
        v.fecha,
        String(v.cantidad),
        this.formatearMonto(v.total)
      ]);
      this.dibujarTablaPDF(doc, headersVentas, dataVentas, [150, 100, 250]);

      // TOP 10 productos más vendidos
      if (masVendidos.length > 0) {
        doc.addPage();
        this.dibujarEncabezadoPDF(doc, 'REPORTE DE VENTAS', 'Administrador', 'Últimos 30 días');
        
        doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.azulOscuro).text('Top 10 Productos Más Vendidos');
        doc.moveDown(0.5);
        
        const headersTop = ['#', 'Producto', 'Cantidad Vendida', 'Ingresos'];
        const dataTop = masVendidos.map((p, i) => {
          const precio = p.variantes[0]?.precioOferta || p.variantes[0]?.precioBase || 0;
          return [
            String(i + 1),
            p.nombre,
            String(p.totalVentas),
            this.formatearMonto(p.totalVentas * Number(precio))
          ];
        });
        this.dibujarTablaPDF(doc, headersTop, dataTop, [30, 270, 100, 100]);
      }
    });
  }

  async generarPDFProductos(): Promise<Buffer> {
    const productos = await this.obtenerProductosParaReportes();
    const totalProductos = productos.length;
    const productosActivos = productos.filter(p => p.activo).length;
    const productosSinStock = productos.filter(p => p.variantes.some(v => v.stock <= 0)).length;
    const productosStockBajo = productos.filter(p => p.variantes.some(v => v.stock > 0 && v.stock <= 5)).length;

    return this.crearPDFBuffer(async (doc) => {
      this.dibujarEncabezadoPDF(doc, 'REPORTE DE PRODUCTOS', 'Administrador', 'Actual');
      
      // Resumen ejecutivo como texto plano
      this.dibujarResumenTexto(doc, [
        { titulo: 'Total Productos', valor: String(totalProductos) },
        { titulo: 'Activos', valor: String(productosActivos) },
        { titulo: 'Sin Stock', valor: String(productosSinStock) },
        { titulo: 'Stock Crítico', valor: String(productosStockBajo) }
      ]);

      // Tabla de productos
      doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.azulOscuro).text('Listado de Productos');
      doc.moveDown(0.5);
      
      const headers = ['Producto', 'Categoría', 'Precio', 'Stock', 'Estado'];
      const data = productos.map(p => {
        const variante = p.variantes[0];
        const precio = variante?.precioOferta || variante?.precioBase || 0;
        return [
          p.nombre,
          p.categoria?.nombre || 'Sin categoría',
          this.formatearMonto(Number(precio)),
          String(variante?.stock || 0),
          p.activo ? 'Activo' : 'Inactivo'
        ];
      });
      this.dibujarTablaPDF(doc, headers, data, [180, 100, 80, 70, 70]);

      // Productos con menor stock
      if (productos.length > 0) {
        doc.addPage();
        this.dibujarEncabezadoPDF(doc, 'REPORTE DE PRODUCTOS', 'Administrador', 'Actual');
        
        doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.azulOscuro).text('Top Productos con Menor Stock');
        doc.moveDown(0.5);
        
        const productosOrdenados = [...productos].sort((a, b) => {
          const stockA = a.variantes[0]?.stock || 0;
          const stockB = b.variantes[0]?.stock || 0;
          return stockA - stockB;
        }).slice(0, 20);
        
        const headersStock = ['Producto', 'Stock', 'Estado'];
        const dataStock = productosOrdenados.map(p => {
          const variante = p.variantes[0];
          return [
            p.nombre,
            String(variante?.stock || 0),
            (variante?.stock || 0) <= 0 ? 'Agotado' : (variante?.stock || 0) <= 5 ? 'Crítico' : 'Normal'
          ];
        });
        this.dibujarTablaPDF(doc, headersStock, dataStock, [300, 100, 100]);
      }
    });
  }

  async generarPDFPedidos(): Promise<Buffer> {
    const pedidos = await this.obtenerPedidosParaExportar();
    const pendientes = pedidos.filter(p => p.estado === 'PENDIENTE').length;
    const enPreparacion = pedidos.filter(p => p.estado === 'EN_PREPARACION').length;
    const enviados = pedidos.filter(p => p.estado === 'ENVIADO').length;
    const entregados = pedidos.filter(p => p.estado === 'ENTREGADO').length;

    return this.crearPDFBuffer(async (doc) => {
      this.dibujarEncabezadoPDF(doc, 'REPORTE DE PEDIDOS', 'Administrador', 'Últimos pedidos');
      
      // Resumen ejecutivo como texto plano
      this.dibujarResumenTexto(doc, [
        { titulo: 'Pendientes', valor: String(pendientes) },
        { titulo: 'En Preparación', valor: String(enPreparacion) },
        { titulo: 'Enviados', valor: String(enviados) },
        { titulo: 'Entregados', valor: String(entregados) }
      ]);

      // Tabla de pedidos
      doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.azulOscuro).text('Listado de Pedidos');
      doc.moveDown(0.5);
      
      const headers = ['Pedido', 'Cliente', 'Fecha', 'Total', 'Estado', 'Método Pago'];
      const data = pedidos.map(p => [
        `#${p.id}`,
        `${p.usuario?.nombre || ''} ${p.usuario?.apellido || ''}`.trim() || p.usuario?.correo || 'N/A',
        p.creadoEn.toISOString().split('T')[0],
        this.formatearMonto(Number(p.total)),
        p.estado,
        p.metodoPago || 'N/A'
      ]);
      this.dibujarTablaPDF(doc, headers, data, [70, 130, 80, 80, 80, 60]);
    });
  }

  async generarPDFInventario(): Promise<Buffer> {
    const inventario = await this.obtenerInventarioParaReportes();
    const stockCritico = inventario.filter(v => v.stock > 0 && v.stock <= 5).length;
    const agotados = inventario.filter(v => v.stock <= 0).length;
    const valorTotal = inventario.reduce((sum, v) => sum + (Number(v.precioBase) * v.stock), 0);

    return this.crearPDFBuffer(async (doc) => {
      this.dibujarEncabezadoPDF(doc, 'REPORTE DE INVENTARIO', 'Administrador', 'Actual');
      
      // Resumen ejecutivo como texto plano
      this.dibujarResumenTexto(doc, [
        { titulo: 'Stock Crítico', valor: String(stockCritico) },
        { titulo: 'Agotados', valor: String(agotados) },
        { titulo: 'Valor Total', valor: this.formatearMonto(valorTotal) }
      ]);

      // Tabla de inventario
      doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.azulOscuro).text('Estado del Inventario');
      doc.moveDown(0.5);
      
      const headers = ['Producto', 'Stock Actual', 'Stock Mínimo', 'Estado'];
      const data = inventario.map(v => [
        v.producto.nombre,
        String(v.stock),
        '5',
        v.stock <= 0 ? 'Agotado' : v.stock <= 5 ? 'Crítico' : 'Normal'
      ]);
      this.dibujarTablaPDF(doc, headers, data, [250, 100, 80, 70]);
    });
  }

  async generarPDFClientes(): Promise<Buffer> {
    const clientes = await this.obtenerClientesParaReportes();
    const totalClientes = clientes.length;
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const clientesNuevosMes = clientes.filter(c => c.creadoEn >= inicioMes).length;
    const clientesActivos = clientes.filter(c => c.pedidos.length > 0).length;

    return this.crearPDFBuffer(async (doc) => {
      this.dibujarEncabezadoPDF(doc, 'REPORTE DE CLIENTES', 'Administrador', 'Actual');
      
      // Resumen ejecutivo como texto plano
      this.dibujarResumenTexto(doc, [
        { titulo: 'Total Clientes', valor: String(totalClientes) },
        { titulo: 'Nuevos (Mes)', valor: String(clientesNuevosMes) },
        { titulo: 'Activos', valor: String(clientesActivos) }
      ]);

      // Tabla de clientes
      doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.azulOscuro).text('Listado de Clientes');
      doc.moveDown(0.5);
      
      const headers = ['Cliente', 'Correo', 'Pedidos', 'Total Comprado'];
      const data = clientes.map(c => {
        const totalComprado = c.pedidos.reduce((sum, p) => sum + Number(p.total), 0);
        return [
          `${c.nombre || ''} ${c.apellido || ''}`.trim() || 'N/A',
          c.correo,
          String(c.pedidos.length),
          this.formatearMonto(totalComprado)
        ];
      });
      this.dibujarTablaPDF(doc, headers, data, [150, 170, 80, 100]);

      // TOP 10 clientes
      if (clientes.length > 0) {
        doc.addPage();
        this.dibujarEncabezadoPDF(doc, 'REPORTE DE CLIENTES', 'Administrador', 'Actual');
        
        doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.azulOscuro).text('Top 10 Clientes con Mayor Volumen de Compra');
        doc.moveDown(0.5);
        
        const topClientes = [...clientes]
          .map(c => ({
            ...c,
            totalComprado: c.pedidos.reduce((sum, p) => sum + Number(p.total), 0)
          }))
          .sort((a, b) => b.totalComprado - a.totalComprado)
          .slice(0, 10);
        
        const headersTop = ['#', 'Cliente', 'Pedidos', 'Total Comprado'];
        const dataTop = topClientes.map((c, i) => [
          String(i + 1),
          `${c.nombre || ''} ${c.apellido || ''}`.trim() || 'N/A',
          String(c.pedidos.length),
          this.formatearMonto(c.totalComprado)
        ]);
        this.dibujarTablaPDF(doc, headersTop, dataTop, [30, 220, 100, 150]);
      }
    });
  }

  // ===============================
  // REPORTES EXCEL
  // ===============================

  private async crearExcelBuffer(crear: (workbook: ExcelJS.Workbook) => Promise<void>): Promise<Buffer> {
    console.log('[ReportesService] Iniciando creación de Excel');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'LlevaloPe';
    workbook.created = new Date();
    
    await crear(workbook);
    
    console.log('[ReportesService] Workbook creado, generando buffer');
    const buffer = await workbook.xlsx.writeBuffer();
    console.log('[ReportesService] Buffer generado, tamaño:', buffer.byteLength);
    // Return the buffer directly since ExcelJS returns a Node.js Buffer in Node environments
    return buffer as unknown as Buffer;
  }

  private aplicarEstiloEncabezado(cell: ExcelJS.Cell) {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1B263B' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }

  private aplicarEstiloCelda(cell: ExcelJS.Cell, esMoneda: boolean = false) {
    cell.font = { color: { argb: 'FF0D1B2A' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    if (esMoneda) {
      cell.numFmt = '"S/"#,##0.00';
    }
  }

  async generarExcelVentas(): Promise<Buffer> {
    console.log('[ReportesService] Generando Excel de Ventas - Inicio');
    return this.crearExcelBuffer(async (workbook) => {
      console.log('[ReportesService] Creando hoja de prueba');
      // Test sheet with minimal content to rule out data issues
      const testSheet = workbook.addWorksheet('Test');
      testSheet.getCell('A1').value = 'Hola Mundo desde ExcelJS!';
      testSheet.getCell('A1').font = { bold: true };
      testSheet.getCell('A2').value = 'Fecha de generación:';
      testSheet.getCell('B2').value = new Date();
      console.log('[ReportesService] Hoja de prueba creada');
    });
  }

  async generarExcelProductos(): Promise<Buffer> {
    const productos = await this.obtenerProductosParaReportes();

    return this.crearExcelBuffer(async (workbook) => {
      // Hoja 1: Resumen
      const resumenSheet = workbook.addWorksheet('Resumen');
      
      resumenSheet.mergeCells('A1:D1');
      resumenSheet.getCell('A1').value = 'REPORTE DE PRODUCTOS - LlevaloPe';
      resumenSheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF0D1B2A' } };
      resumenSheet.getCell('A1').alignment = { horizontal: 'center' };
      
      resumenSheet.getCell('A3').value = 'Total Productos';
      resumenSheet.getCell('B3').value = productos.length;
      
      resumenSheet.getCell('A4').value = 'Productos Activos';
      resumenSheet.getCell('B4').value = productos.filter(p => p.activo).length;
      
      resumenSheet.getCell('A5').value = 'Productos Sin Stock';
      resumenSheet.getCell('B5').value = productos.filter(p => p.variantes.some(v => v.stock <= 0)).length;
      
      resumenSheet.getCell('A6').value = 'Stock Crítico';
      resumenSheet.getCell('B6').value = productos.filter(p => p.variantes.some(v => v.stock > 0 && v.stock <= 5)).length;
      
      // Hoja 2: Detalle
      const detalleSheet = workbook.addWorksheet('Detalle Productos');
      
      detalleSheet.columns = [
        { header: 'Producto', key: 'nombre', width: 40 },
        { header: 'Categoría', key: 'categoria', width: 20 },
        { header: 'Precio', key: 'precio', width: 15 },
        { header: 'Stock', key: 'stock', width: 10 },
        { header: 'Estado', key: 'estado', width: 12 }
      ];
      
      detalleSheet.getRow(1).eachCell(this.aplicarEstiloEncabezado);
      
      productos.forEach(p => {
        const variante = p.variantes[0];
        const precio = variante?.precioOferta || variante?.precioBase || 0;
        const row = detalleSheet.addRow({
          nombre: p.nombre,
          categoria: p.categoria?.nombre || 'Sin categoría',
          precio: Number(precio),
          stock: variante?.stock || 0,
          estado: p.activo ? 'Activo' : 'Inactivo'
        });
        row.eachCell((cell, colNum) => {
          this.aplicarEstiloCelda(cell, colNum === 3);
        });
      });
    });
  }

  async generarExcelPedidos(): Promise<Buffer> {
    const pedidos = await this.obtenerPedidosParaExportar();

    return this.crearExcelBuffer(async (workbook) => {
      // Hoja 1: Resumen
      const resumenSheet = workbook.addWorksheet('Resumen');
      
      resumenSheet.mergeCells('A1:D1');
      resumenSheet.getCell('A1').value = 'REPORTE DE PEDIDOS - LlevaloPe';
      resumenSheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF0D1B2A' } };
      resumenSheet.getCell('A1').alignment = { horizontal: 'center' };
      
      resumenSheet.getCell('A3').value = 'Pendientes';
      resumenSheet.getCell('B3').value = pedidos.filter(p => p.estado === 'PENDIENTE').length;
      
      resumenSheet.getCell('A4').value = 'En Preparación';
      resumenSheet.getCell('B4').value = pedidos.filter(p => p.estado === 'EN_PREPARACION').length;
      
      resumenSheet.getCell('A5').value = 'Enviados';
      resumenSheet.getCell('B5').value = pedidos.filter(p => p.estado === 'ENVIADO').length;
      
      resumenSheet.getCell('A6').value = 'Entregados';
      resumenSheet.getCell('B6').value = pedidos.filter(p => p.estado === 'ENTREGADO').length;
      
      // Hoja 2: Detalle
      const detalleSheet = workbook.addWorksheet('Detalle Pedidos');
      
      detalleSheet.columns = [
        { header: 'Pedido', key: 'pedido', width: 10 },
        { header: 'Cliente', key: 'cliente', width: 30 },
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Total', key: 'total', width: 15 },
        { header: 'Estado', key: 'estado', width: 15 },
        { header: 'Método Pago', key: 'pago', width: 15 }
      ];
      
      detalleSheet.getRow(1).eachCell(this.aplicarEstiloEncabezado);
      
      pedidos.forEach(p => {
        const row = detalleSheet.addRow({
          pedido: `#${p.id}`,
          cliente: `${p.usuario?.nombre || ''} ${p.usuario?.apellido || ''}`.trim() || p.usuario?.correo || 'N/A',
          fecha: p.creadoEn.toISOString().split('T')[0],
          total: Number(p.total),
          estado: p.estado,
          pago: p.metodoPago || 'N/A'
        });
        row.eachCell((cell, colNum) => {
          this.aplicarEstiloCelda(cell, colNum === 4);
        });
      });
    });
  }

  async generarExcelInventario(): Promise<Buffer> {
    const inventario = await this.obtenerInventarioParaReportes();

    return this.crearExcelBuffer(async (workbook) => {
      // Hoja 1: Resumen
      const resumenSheet = workbook.addWorksheet('Resumen');
      
      resumenSheet.mergeCells('A1:D1');
      resumenSheet.getCell('A1').value = 'REPORTE DE INVENTARIO - LlevaloPe';
      resumenSheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF0D1B2A' } };
      resumenSheet.getCell('A1').alignment = { horizontal: 'center' };
      
      const stockCritico = inventario.filter(v => v.stock > 0 && v.stock <= 5).length;
      const agotados = inventario.filter(v => v.stock <= 0).length;
      const valorTotal = inventario.reduce((sum, v) => sum + (Number(v.precioBase) * v.stock), 0);
      
      resumenSheet.getCell('A3').value = 'Productos con Stock Crítico';
      resumenSheet.getCell('B3').value = stockCritico;
      
      resumenSheet.getCell('A4').value = 'Productos Agotados';
      resumenSheet.getCell('B4').value = agotados;
      
      resumenSheet.getCell('A5').value = 'Valor Total del Inventario';
      resumenSheet.getCell('B5').value = valorTotal;
      resumenSheet.getCell('B5').numFmt = '"S/"#,##0.00';
      
      // Hoja 2: Detalle
      const detalleSheet = workbook.addWorksheet('Detalle Inventario');
      
      detalleSheet.columns = [
        { header: 'Producto', key: 'producto', width: 40 },
        { header: 'Stock Actual', key: 'stock', width: 15 },
        { header: 'Stock Mínimo', key: 'minimo', width: 15 },
        { header: 'Estado', key: 'estado', width: 15 }
      ];
      
      detalleSheet.getRow(1).eachCell(this.aplicarEstiloEncabezado);
      
      inventario.forEach(v => {
        const row = detalleSheet.addRow({
          producto: v.producto.nombre,
          stock: v.stock,
          minimo: 5,
          estado: v.stock <= 0 ? 'Agotado' : v.stock <= 5 ? 'Crítico' : 'Normal'
        });
        row.eachCell(cell => this.aplicarEstiloCelda(cell));
      });
    });
  }

  async generarExcelClientes(): Promise<Buffer> {
    const clientes = await this.obtenerClientesParaReportes();

    return this.crearExcelBuffer(async (workbook) => {
      // Hoja 1: Resumen
      const resumenSheet = workbook.addWorksheet('Resumen');
      
      resumenSheet.mergeCells('A1:D1');
      resumenSheet.getCell('A1').value = 'REPORTE DE CLIENTES - LlevaloPe';
      resumenSheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF0D1B2A' } };
      resumenSheet.getCell('A1').alignment = { horizontal: 'center' };
      
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      
      resumenSheet.getCell('A3').value = 'Total Clientes';
      resumenSheet.getCell('B3').value = clientes.length;
      
      resumenSheet.getCell('A4').value = 'Clientes Nuevos (Mes)';
      resumenSheet.getCell('B4').value = clientes.filter(c => c.creadoEn >= inicioMes).length;
      
      resumenSheet.getCell('A5').value = 'Clientes Activos';
      resumenSheet.getCell('B5').value = clientes.filter(c => c.pedidos.length > 0).length;
      
      // Hoja 2: Detalle
      const detalleSheet = workbook.addWorksheet('Detalle Clientes');
      
      detalleSheet.columns = [
        { header: 'Cliente', key: 'cliente', width: 30 },
        { header: 'Correo', key: 'correo', width: 35 },
        { header: 'Pedidos Realizados', key: 'pedidos', width: 18 },
        { header: 'Total Comprado', key: 'total', width: 18 }
      ];
      
      detalleSheet.getRow(1).eachCell(this.aplicarEstiloEncabezado);
      
      clientes.forEach(c => {
        const totalComprado = c.pedidos.reduce((sum, p) => sum + Number(p.total), 0);
        const row = detalleSheet.addRow({
          cliente: `${c.nombre || ''} ${c.apellido || ''}`.trim() || 'N/A',
          correo: c.correo,
          pedidos: c.pedidos.length,
          total: totalComprado
        });
        row.eachCell((cell, colNum) => {
          this.aplicarEstiloCelda(cell, colNum === 4);
        });
      });
      
      // Hoja 3: Top Clientes
      const topSheet = workbook.addWorksheet('Top Clientes');
      
      topSheet.columns = [
        { header: '#', key: 'pos', width: 5 },
        { header: 'Cliente', key: 'cliente', width: 30 },
        { header: 'Pedidos', key: 'pedidos', width: 15 },
        { header: 'Total Comprado', key: 'total', width: 20 }
      ];
      
      topSheet.getRow(1).eachCell(this.aplicarEstiloEncabezado);
      
      const topClientes = [...clientes]
        .map(c => ({
          ...c,
          totalComprado: c.pedidos.reduce((sum, p) => sum + Number(p.total), 0)
        }))
        .sort((a, b) => b.totalComprado - a.totalComprado)
        .slice(0, 100);
      
      topClientes.forEach((c, i) => {
        const row = topSheet.addRow({
          pos: i + 1,
          cliente: `${c.nombre || ''} ${c.apellido || ''}`.trim() || 'N/A',
          pedidos: c.pedidos.length,
          total: c.totalComprado
        });
        row.eachCell((cell, colNum) => {
          this.aplicarEstiloCelda(cell, colNum === 4);
        });
      });
    });
  }
}
