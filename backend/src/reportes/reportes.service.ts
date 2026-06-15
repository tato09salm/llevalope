import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import PDFDocument = require('pdfkit');
import * as ExcelJS from 'exceljs';  // ← FIX: import correcto para CommonJS/ESM

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

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

    return Array.from(grupos.entries())
      .map(([fecha, datos]) => ({ fecha, total: datos.total, cantidad: datos.count }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
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
          select: { id: true, stock: true, precioBase: true, precioOferta: true },
        },
      },
    });
  }

  async obtenerPedidosParaExportar() {
    return this.prisma.pedido.findMany({
      include: {
        usuario: { select: { id: true, correo: true, nombre: true, apellido: true } },
        items: { include: { variante: { include: { producto: true } } } },
      },
      orderBy: { creadoEn: 'desc' },
      take: 200,
    });
  }

  async obtenerProductosParaReportes() {
    return this.prisma.producto.findMany({
      include: {
        categoria: { select: { nombre: true } },
        variantes: {
          where: { activo: true, esPrincipal: true },
          take: 1,
          select: { precioBase: true, precioOferta: true, stock: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async obtenerClientesParaReportes() {
    return this.prisma.usuario.findMany({
      where: { rol: 'CLIENTE' },
      include: {
        pedidos: {
          where: { estadoPago: 'PAGADO' },
          select: { total: true },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async obtenerInventarioParaReportes() {
    return this.prisma.varianteProducto.findMany({
      where: { activo: true },
      include: { producto: true },
      orderBy: { stock: 'asc' },
    });
  }

  // ===============================
  // HELPERS PDF
  // ===============================

  private crearPDFBuffer(escribir: (doc: InstanceType<typeof PDFDocument>) => Promise<void>): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, bufferPages: true });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      escribir(doc)
        .then(() => { this.agregarPiePaginaPDF(doc); doc.end(); })
        .catch(reject);
    });
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  private formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto);
  }

  private dibujarEncabezadoPDF(doc: InstanceType<typeof PDFDocument>, titulo: string, usuario?: string, periodo?: string) {
    // Header background (dark blue)
    doc.save();
    doc.rect(50, 50, 500, 100).fillColor(this.colores.azulCorporativo).fill();
    doc.restore();

    // Left side: Brand
    doc.fillColor('#FFFFFF').fontSize(26).font('Helvetica-Bold').text('LlevaloPe', 60, 75);
    doc.fontSize(11).font('Helvetica').text('Tu Tienda Online, Sin Límites', 60, 100);

    // Right side: Report title, generated by, date
    doc.fillColor(this.colores.dorado).fontSize(14).font('Helvetica-Bold').text(titulo, 50, 70, { align: 'right' });
    doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica');
    if (usuario) doc.text(`Generado por: ${usuario}`, 50, 90, { align: 'right' });
    doc.text(`${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })} · Actual`, 50, 105, { align: 'right' });

    // Gold bottom border for header
    doc.save();
    doc.moveTo(50, 150).lineTo(550, 150).strokeColor(this.colores.dorado).lineWidth(2).stroke();
    doc.restore();

    // Move cursor down
    doc.y = 170;
  }

  private dibujarResumenEjecutivo(doc: InstanceType<typeof PDFDocument>, resumen: { titulo: string; valor: string }[]) {
    // Section title
    doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('RESUMEN EJECUTIVO');
    doc.moveDown(1);

    const cardWidth = 156;
    const cardHeight = 60;
    const gap = 13;
    const startX = 50;
    const startY = doc.y;
    const borderColors = [this.colores.verdeAzulado, this.colores.dorado, this.colores.azulOscuro, this.colores.azulOscuro];

    resumen.forEach((item, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = startX + col * (cardWidth + gap);
      const y = startY + row * (cardHeight + gap);

      // Card background (light color)
      doc.save();
      doc.roundedRect(x, y, cardWidth, cardHeight, 8).fillColor(this.colores.blancoSuave).fill();
      
      // Left border
      doc.save();
      doc.rect(x, y, 3, cardHeight).fillColor(borderColors[index % borderColors.length]).fill();
      doc.restore();
      doc.restore();

      // Card content
      doc.fillColor(this.colores.azulOscuro).fontSize(9).font('Helvetica-Bold').text(item.titulo.toUpperCase(), x + 12, y + 15);
      doc.fontSize(20).font('Helvetica').text(item.valor, x + 12, y + 32);
    });

    doc.y = startY + (Math.ceil(resumen.length / 3)) * (cardHeight + gap) + 30;
  }

  private dibujarTablaPDF(doc: InstanceType<typeof PDFDocument>, headers: string[], data: any[][], colWidths?: number[]) {
    const tableTop = doc.y;
    const tableLeft = 50;
    const rowHeight = 25;
    const cellPadding = 5;
    const widths = colWidths || headers.map(() => 500 / headers.length);

    doc.fillColor(this.colores.azulCorporativo);
    doc.rect(tableLeft, tableTop, 500, rowHeight).fill();
    doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold');
    let currentX = tableLeft;
    headers.forEach((header, i) => {
      doc.text(header, currentX + cellPadding, tableTop + cellPadding + 5, { width: widths[i] - cellPadding * 2, align: 'left' });
      currentX += widths[i];
    });

    data.forEach((row, rowIndex) => {
      const y = tableTop + (rowIndex + 1) * rowHeight;
      doc.fillColor(rowIndex % 2 === 0 ? '#F9F9F9' : '#FFFFFF');
      doc.rect(tableLeft, y, 500, rowHeight).fill();
      doc.fillColor(this.colores.azulOscuro).fontSize(9).font('Helvetica');
      let x = tableLeft;
      row.forEach((cell, i) => {
        doc.text(String(cell || ''), x + cellPadding, y + cellPadding + 5, { width: widths[i] - cellPadding * 2, align: 'left' });
        x += widths[i];
      });
      if (y + rowHeight > 700) doc.addPage();
    });

    doc.y = tableTop + (data.length + 1) * rowHeight + 20;
  }

  private agregarPiePaginaPDF(doc: InstanceType<typeof PDFDocument>) {
    // @ts-ignore
    const pageRange = doc.bufferedPageRange ? doc.bufferedPageRange() : { start: 0, count: 1 };
    for (let i = 0; i < pageRange.count; i++) {
      doc.switchToPage(i);
      doc.moveTo(50, 730).lineTo(550, 730).strokeColor(this.colores.grisElegante).lineWidth(1).stroke();
      doc.fontSize(9).fillColor(this.colores.grisElegante).font('Helvetica');
      doc.text('LlevaloPe © 2026', 50, 740);
      doc.text(`Página ${i + 1} de ${pageRange.count}`, 50, 740, { align: 'right' });
    }
  }

  // ===============================
  // HELPERS EXCEL
  // ===============================

  private async crearExcelBuffer(crear: (workbook: ExcelJS.Workbook) => Promise<void>): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'LlevaloPe';
    workbook.created = new Date();
    await crear(workbook);
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);  // ← FIX: conversión explícita a Buffer de Node
  }

  // ← FIX: arrow function para preservar contexto de 'this' (aunque estos métodos no usan 'this',
  //         es buena práctica y evita errores si se usan como callbacks)
  private aplicarEstiloEncabezado = (cell: ExcelJS.Cell): void => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B263B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    };
  };

  private aplicarEstiloCelda = (cell: ExcelJS.Cell, esMoneda: boolean = false): void => {
    cell.font = { color: { argb: 'FF0D1B2A' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    };
    if (esMoneda) cell.numFmt = '"S/"#,##0.00';
  };

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
      this.dibujarEncabezadoPDF(doc, 'REPORTE DE VENTAS', 'Administrador');
      this.dibujarResumenEjecutivo(doc, [
        { titulo: 'Ventas Totales', valor: this.formatearMonto(totalVentas) },
        { titulo: 'Pedidos Totales', valor: String(totalPedidos) },
        { titulo: 'Ticket Promedio', valor: this.formatearMonto(ticketPromedio) },
        { titulo: 'Clientes', valor: String(new Set(pedidos.map(p => p.usuarioId)).size) },
      ]);
      doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('LISTADO DE VENTAS');
      doc.moveDown(1);
      this.dibujarTablaPDF(doc, ['Fecha', 'Pedidos', 'Monto Total'],
        ventas.map(v => [v.fecha, String(v.cantidad), this.formatearMonto(v.total)]),
        [150, 100, 250]);

      if (masVendidos.length > 0) {
        doc.addPage();
        this.dibujarEncabezadoPDF(doc, 'REPORTE DE VENTAS', 'Administrador');
        doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('TOP 10 PRODUCTOS MÁS VENDIDOS');
        doc.moveDown(1);
        this.dibujarTablaPDF(doc, ['#', 'Producto', 'Cantidad Vendida', 'Ingresos'],
          masVendidos.map((p, i) => {
            const precio = p.variantes[0]?.precioOferta || p.variantes[0]?.precioBase || 0;
            return [String(i + 1), p.nombre, String(p.totalVentas), this.formatearMonto(p.totalVentas * Number(precio))];
          }), [30, 270, 100, 100]);
      }
    });
  }

  async generarPDFProductos(): Promise<Buffer> {
    const productos = await this.obtenerProductosParaReportes();
    return this.crearPDFBuffer(async (doc) => {
      this.dibujarEncabezadoPDF(doc, 'REPORTE DE PRODUCTOS', 'Administrador');
      this.dibujarResumenEjecutivo(doc, [
        { titulo: 'Total Productos', valor: String(productos.length) },
        { titulo: 'Activos', valor: String(productos.filter(p => p.activo).length) },
        { titulo: 'Sin Stock', valor: String(productos.filter(p => p.variantes.some(v => v.stock <= 0)).length) },
        { titulo: 'Stock Crítico', valor: String(productos.filter(p => p.variantes.some(v => v.stock > 0 && v.stock <= 5)).length) },
      ]);
      doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('LISTADO DE PRODUCTOS');
      doc.moveDown(1);
      this.dibujarTablaPDF(doc, ['Producto', 'Categoría', 'Precio', 'Stock', 'Estado'],
        productos.map(p => {
          const variante = p.variantes[0];
          const precio = variante?.precioOferta || variante?.precioBase || 0;
          return [p.nombre, p.categoria?.nombre || 'Sin categoría', this.formatearMonto(Number(precio)), String(variante?.stock || 0), p.activo ? 'Activo' : 'Inactivo'];
        }), [180, 100, 80, 70, 70]);

      if (productos.length > 0) {
        doc.addPage();
        this.dibujarEncabezadoPDF(doc, 'REPORTE DE PRODUCTOS', 'Administrador');
        doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('TOP PRODUCTOS CON MENOR STOCK');
        doc.moveDown(1);
        const ordenados = [...productos].sort((a, b) => (a.variantes[0]?.stock || 0) - (b.variantes[0]?.stock || 0)).slice(0, 20);
        this.dibujarTablaPDF(doc, ['Producto', 'Stock', 'Estado'],
          ordenados.map(p => {
            const s = p.variantes[0]?.stock || 0;
            return [p.nombre, String(s), s <= 0 ? 'Agotado' : s <= 5 ? 'Crítico' : 'Normal'];
          }), [300, 100, 100]);
      }
    });
  }

  async generarPDFPedidos(): Promise<Buffer> {
    const pedidos = await this.obtenerPedidosParaExportar();
    return this.crearPDFBuffer(async (doc) => {
      this.dibujarEncabezadoPDF(doc, 'REPORTE DE PEDIDOS', 'Administrador');
      this.dibujarResumenEjecutivo(doc, [
        { titulo: 'Pendientes', valor: String(pedidos.filter(p => p.estado === 'PENDIENTE').length) },
        { titulo: 'En Preparación', valor: String(pedidos.filter(p => p.estado === 'EN_PREPARACION').length) },
        { titulo: 'Enviados', valor: String(pedidos.filter(p => p.estado === 'ENVIADO').length) },
        { titulo: 'Entregados', valor: String(pedidos.filter(p => p.estado === 'ENTREGADO').length) },
      ]);
      doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('LISTADO DE PEDIDOS');
      doc.moveDown(1);
      this.dibujarTablaPDF(doc, ['Pedido', 'Cliente', 'Fecha', 'Total', 'Estado', 'Método Pago'],
        pedidos.map(p => [
          `#${p.id}`,
          `${p.usuario?.nombre || ''} ${p.usuario?.apellido || ''}`.trim() || p.usuario?.correo || 'N/A',
          p.creadoEn.toISOString().split('T')[0],
          this.formatearMonto(Number(p.total)),
          p.estado,
          p.metodoPago || 'N/A',
        ]), [70, 130, 80, 80, 80, 60]);
    });
  }

  async generarPDFInventario(): Promise<Buffer> {
    const inventario = await this.obtenerInventarioParaReportes();
    const valorTotal = inventario.reduce((sum, v) => sum + Number(v.precioBase) * v.stock, 0);
    return this.crearPDFBuffer(async (doc) => {
      this.dibujarEncabezadoPDF(doc, 'REPORTE DE INVENTARIO', 'Administrador');
      this.dibujarResumenEjecutivo(doc, [
        { titulo: 'Stock Crítico', valor: String(inventario.filter(v => v.stock > 0 && v.stock <= 5).length) },
        { titulo: 'Agotados', valor: String(inventario.filter(v => v.stock <= 0).length) },
        { titulo: 'Valor Total', valor: this.formatearMonto(valorTotal) },
      ]);
      doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('ESTADO DEL INVENTARIO');
      doc.moveDown(1);
      this.dibujarTablaPDF(doc, ['Producto', 'Stock Actual', 'Stock Mínimo', 'Estado'],
        inventario.map(v => [
          v.producto.nombre, String(v.stock), '5',
          v.stock <= 0 ? 'Agotado' : v.stock <= 5 ? 'Crítico' : 'Normal',
        ]), [250, 100, 80, 70]);
    });
  }

  async generarPDFClientes(): Promise<Buffer> {
    const clientes = await this.obtenerClientesParaReportes();
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return this.crearPDFBuffer(async (doc) => {
      this.dibujarEncabezadoPDF(doc, 'REPORTE DE CLIENTES', 'Administrador');
      this.dibujarResumenEjecutivo(doc, [
        { titulo: 'Total Clientes', valor: String(clientes.length) },
        { titulo: 'Nuevos (Mes)', valor: String(clientes.filter(c => c.creadoEn >= inicioMes).length) },
        { titulo: 'Activos', valor: String(clientes.filter(c => c.pedidos.length > 0).length) },
      ]);
      doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('LISTADO DE CLIENTES');
      doc.moveDown(1);
      this.dibujarTablaPDF(doc, ['#', 'Cliente', 'Correo', 'Pedidos', 'Total Comprado'],
        clientes.map((c, index) => {
          const total = c.pedidos.reduce((sum, p) => sum + Number(p.total), 0);
          return [String(index + 1), `${c.nombre || ''} ${c.apellido || ''}`.trim() || 'N/A', c.correo, String(c.pedidos.length), this.formatearMonto(total)];
        }), [30, 120, 150, 80, 120]);

      if (clientes.length > 0) {
        doc.addPage();
        this.dibujarEncabezadoPDF(doc, 'REPORTE DE CLIENTES', 'Administrador');
        doc.fontSize(14).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('TOP 10 CLIENTES CON MAYOR VOLUMEN DE COMPRA');
        doc.moveDown(1);
        const top = [...clientes]
          .map(c => ({ ...c, totalComprado: c.pedidos.reduce((sum, p) => sum + Number(p.total), 0) }))
          .sort((a, b) => b.totalComprado - a.totalComprado).slice(0, 10);
        this.dibujarTablaPDF(doc, ['#', 'Cliente', 'Pedidos', 'Total Comprado'],
          top.map((c, i) => [String(i + 1), `${c.nombre || ''} ${c.apellido || ''}`.trim() || 'N/A', String(c.pedidos.length), this.formatearMonto(c.totalComprado)]),
          [30, 220, 100, 150]);
      }
    });
  }

  // ===============================
  // REPORTES EXCEL
  // ===============================

  async generarExcelVentas(): Promise<Buffer> {
    const ventas = await this.ventasPorDia(30);
    const masVendidos = await this.productosMasVendidos(100);
    const pedidos = await this.obtenerPedidosParaExportar();
    const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
    const totalPedidos = ventas.reduce((sum, v) => sum + v.cantidad, 0);
    const ticketPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

    return this.crearExcelBuffer(async (workbook) => {
      // Hoja 1: Resumen
      const resumenSheet = workbook.addWorksheet('Resumen');
      resumenSheet.mergeCells('A1:D1');
      resumenSheet.getCell('A1').value = 'REPORTE DE VENTAS - LlevaloPe';
      resumenSheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF0D1B2A' } };
      resumenSheet.getCell('A1').alignment = { horizontal: 'center' };
      resumenSheet.getCell('A3').value = 'Ventas Totales';
      resumenSheet.getCell('B3').value = totalVentas;
      resumenSheet.getCell('B3').numFmt = '"S/"#,##0.00';
      resumenSheet.getCell('A4').value = 'Pedidos Totales';
      resumenSheet.getCell('B4').value = totalPedidos;
      resumenSheet.getCell('A5').value = 'Ticket Promedio';
      resumenSheet.getCell('B5').value = ticketPromedio;
      resumenSheet.getCell('B5').numFmt = '"S/"#,##0.00';
      resumenSheet.getCell('A6').value = 'Clientes Involucrados';
      resumenSheet.getCell('B6').value = new Set(pedidos.map(p => p.usuarioId)).size;

      // Hoja 2: Detalle ventas por día
      const detalleSheet = workbook.addWorksheet('Detalle Ventas');
      detalleSheet.columns = [
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Pedidos', key: 'pedidos', width: 10 },
        { header: 'Monto Total', key: 'total', width: 15 },
      ];
      // ← FIX: arrow function para preservar contexto de 'this'
      detalleSheet.getRow(1).eachCell((cell) => this.aplicarEstiloEncabezado(cell));
      ventas.forEach(v => {
        const row = detalleSheet.addRow({ fecha: v.fecha, pedidos: v.cantidad, total: v.total });
        row.eachCell((cell, colNum) => this.aplicarEstiloCelda(cell, colNum === 3));
      });
      const totalRow = detalleSheet.addRow({ fecha: 'TOTAL', pedidos: totalPedidos, total: totalVentas });
      totalRow.eachCell((cell, colNum) => {
        cell.font = { bold: true };
        this.aplicarEstiloCelda(cell, colNum === 3);
      });

      // Hoja 3: Top productos
      const topSheet = workbook.addWorksheet('Top Productos');
      topSheet.columns = [
        { header: '#', key: 'pos', width: 5 },
        { header: 'Producto', key: 'producto', width: 40 },
        { header: 'Cantidad Vendida', key: 'cantidad', width: 15 },
        { header: 'Precio Unitario', key: 'precio', width: 15 },
        { header: 'Ingresos Generados', key: 'ingresos', width: 18 },
      ];
      topSheet.getRow(1).eachCell((cell) => this.aplicarEstiloEncabezado(cell));
      masVendidos.slice(0, 100).forEach((p, i) => {
        const precio = p.variantes[0]?.precioOferta || p.variantes[0]?.precioBase || 0;
        const row = topSheet.addRow({ pos: i + 1, producto: p.nombre, cantidad: p.totalVentas, precio: Number(precio), ingresos: p.totalVentas * Number(precio) });
        row.eachCell((cell, colNum) => this.aplicarEstiloCelda(cell, colNum === 4 || colNum === 5));
      });
    });
  }

  async generarExcelProductos(): Promise<Buffer> {
    const productos = await this.obtenerProductosParaReportes();
    return this.crearExcelBuffer(async (workbook) => {
      const resumenSheet = workbook.addWorksheet('Resumen');
      resumenSheet.mergeCells('A1:D1');
      resumenSheet.getCell('A1').value = 'REPORTE DE PRODUCTOS - LlevaloPe';
      resumenSheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF0D1B2A' } };
      resumenSheet.getCell('A1').alignment = { horizontal: 'center' };
      resumenSheet.getCell('A3').value = 'Total Productos';       resumenSheet.getCell('B3').value = productos.length;
      resumenSheet.getCell('A4').value = 'Productos Activos';     resumenSheet.getCell('B4').value = productos.filter(p => p.activo).length;
      resumenSheet.getCell('A5').value = 'Productos Sin Stock';   resumenSheet.getCell('B5').value = productos.filter(p => p.variantes.some(v => v.stock <= 0)).length;
      resumenSheet.getCell('A6').value = 'Stock Crítico';         resumenSheet.getCell('B6').value = productos.filter(p => p.variantes.some(v => v.stock > 0 && v.stock <= 5)).length;

      const detalleSheet = workbook.addWorksheet('Detalle Productos');
      detalleSheet.columns = [
        { header: 'Producto', key: 'nombre', width: 40 },
        { header: 'Categoría', key: 'categoria', width: 20 },
        { header: 'Precio', key: 'precio', width: 15 },
        { header: 'Stock', key: 'stock', width: 10 },
        { header: 'Estado', key: 'estado', width: 12 },
      ];
      detalleSheet.getRow(1).eachCell((cell) => this.aplicarEstiloEncabezado(cell));
      productos.forEach(p => {
        const variante = p.variantes[0];
        const precio = variante?.precioOferta || variante?.precioBase || 0;
        const row = detalleSheet.addRow({ nombre: p.nombre, categoria: p.categoria?.nombre || 'Sin categoría', precio: Number(precio), stock: variante?.stock || 0, estado: p.activo ? 'Activo' : 'Inactivo' });
        row.eachCell((cell, colNum) => this.aplicarEstiloCelda(cell, colNum === 3));
      });
    });
  }

  async generarExcelPedidos(): Promise<Buffer> {
    const pedidos = await this.obtenerPedidosParaExportar();
    return this.crearExcelBuffer(async (workbook) => {
      const resumenSheet = workbook.addWorksheet('Resumen');
      resumenSheet.mergeCells('A1:D1');
      resumenSheet.getCell('A1').value = 'REPORTE DE PEDIDOS - LlevaloPe';
      resumenSheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF0D1B2A' } };
      resumenSheet.getCell('A1').alignment = { horizontal: 'center' };
      resumenSheet.getCell('A3').value = 'Pendientes';      resumenSheet.getCell('B3').value = pedidos.filter(p => p.estado === 'PENDIENTE').length;
      resumenSheet.getCell('A4').value = 'En Preparación'; resumenSheet.getCell('B4').value = pedidos.filter(p => p.estado === 'EN_PREPARACION').length;
      resumenSheet.getCell('A5').value = 'Enviados';        resumenSheet.getCell('B5').value = pedidos.filter(p => p.estado === 'ENVIADO').length;
      resumenSheet.getCell('A6').value = 'Entregados';      resumenSheet.getCell('B6').value = pedidos.filter(p => p.estado === 'ENTREGADO').length;

      const detalleSheet = workbook.addWorksheet('Detalle Pedidos');
      detalleSheet.columns = [
        { header: 'Pedido', key: 'pedido', width: 10 },
        { header: 'Cliente', key: 'cliente', width: 30 },
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Total', key: 'total', width: 15 },
        { header: 'Estado', key: 'estado', width: 15 },
        { header: 'Método Pago', key: 'pago', width: 15 },
      ];
      detalleSheet.getRow(1).eachCell((cell) => this.aplicarEstiloEncabezado(cell));
      pedidos.forEach(p => {
        const row = detalleSheet.addRow({
          pedido: `#${p.id}`,
          cliente: `${p.usuario?.nombre || ''} ${p.usuario?.apellido || ''}`.trim() || p.usuario?.correo || 'N/A',
          fecha: p.creadoEn.toISOString().split('T')[0],
          total: Number(p.total),
          estado: p.estado,
          pago: p.metodoPago || 'N/A',
        });
        row.eachCell((cell, colNum) => this.aplicarEstiloCelda(cell, colNum === 4));
      });
    });
  }

  async generarExcelInventario(): Promise<Buffer> {
    const inventario = await this.obtenerInventarioParaReportes();
    const stockCritico = inventario.filter(v => v.stock > 0 && v.stock <= 5).length;
    const agotados = inventario.filter(v => v.stock <= 0).length;
    const valorTotal = inventario.reduce((sum, v) => sum + Number(v.precioBase) * v.stock, 0);

    return this.crearExcelBuffer(async (workbook) => {
      const resumenSheet = workbook.addWorksheet('Resumen');
      resumenSheet.mergeCells('A1:D1');
      resumenSheet.getCell('A1').value = 'REPORTE DE INVENTARIO - LlevaloPe';
      resumenSheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF0D1B2A' } };
      resumenSheet.getCell('A1').alignment = { horizontal: 'center' };
      resumenSheet.getCell('A3').value = 'Productos con Stock Crítico'; resumenSheet.getCell('B3').value = stockCritico;
      resumenSheet.getCell('A4').value = 'Productos Agotados';          resumenSheet.getCell('B4').value = agotados;
      resumenSheet.getCell('A5').value = 'Valor Total del Inventario';  resumenSheet.getCell('B5').value = valorTotal;
      resumenSheet.getCell('B5').numFmt = '"S/"#,##0.00';

      const detalleSheet = workbook.addWorksheet('Detalle Inventario');
      detalleSheet.columns = [
        { header: 'Producto', key: 'producto', width: 40 },
        { header: 'Stock Actual', key: 'stock', width: 15 },
        { header: 'Stock Mínimo', key: 'minimo', width: 15 },
        { header: 'Estado', key: 'estado', width: 15 },
      ];
      detalleSheet.getRow(1).eachCell((cell) => this.aplicarEstiloEncabezado(cell));
      inventario.forEach(v => {
        const row = detalleSheet.addRow({ producto: v.producto.nombre, stock: v.stock, minimo: 5, estado: v.stock <= 0 ? 'Agotado' : v.stock <= 5 ? 'Crítico' : 'Normal' });
        row.eachCell((cell) => this.aplicarEstiloCelda(cell));
      });
    });
  }

  async generarExcelClientes(): Promise<Buffer> {
    const clientes = await this.obtenerClientesParaReportes();
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    return this.crearExcelBuffer(async (workbook) => {
      const resumenSheet = workbook.addWorksheet('Resumen');
      resumenSheet.mergeCells('A1:D1');
      resumenSheet.getCell('A1').value = 'REPORTE DE CLIENTES - LlevaloPe';
      resumenSheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF0D1B2A' } };
      resumenSheet.getCell('A1').alignment = { horizontal: 'center' };
      resumenSheet.getCell('A3').value = 'Total Clientes';        resumenSheet.getCell('B3').value = clientes.length;
      resumenSheet.getCell('A4').value = 'Clientes Nuevos (Mes)'; resumenSheet.getCell('B4').value = clientes.filter(c => c.creadoEn >= inicioMes).length;
      resumenSheet.getCell('A5').value = 'Clientes Activos';      resumenSheet.getCell('B5').value = clientes.filter(c => c.pedidos.length > 0).length;

      const detalleSheet = workbook.addWorksheet('Detalle Clientes');
      detalleSheet.columns = [
        { header: 'Cliente', key: 'cliente', width: 30 },
        { header: 'Correo', key: 'correo', width: 35 },
        { header: 'Pedidos Realizados', key: 'pedidos', width: 18 },
        { header: 'Total Comprado', key: 'total', width: 18 },
      ];
      detalleSheet.getRow(1).eachCell((cell) => this.aplicarEstiloEncabezado(cell));
      clientes.forEach(c => {
        const totalComprado = c.pedidos.reduce((sum, p) => sum + Number(p.total), 0);
        const row = detalleSheet.addRow({ cliente: `${c.nombre || ''} ${c.apellido || ''}`.trim() || 'N/A', correo: c.correo, pedidos: c.pedidos.length, total: totalComprado });
        row.eachCell((cell, colNum) => this.aplicarEstiloCelda(cell, colNum === 4));
      });

      const topSheet = workbook.addWorksheet('Top Clientes');
      topSheet.columns = [
        { header: '#', key: 'pos', width: 5 },
        { header: 'Cliente', key: 'cliente', width: 30 },
        { header: 'Pedidos', key: 'pedidos', width: 15 },
        { header: 'Total Comprado', key: 'total', width: 20 },
      ];
      topSheet.getRow(1).eachCell((cell) => this.aplicarEstiloEncabezado(cell));
      const topClientes = [...clientes]
        .map(c => ({ ...c, totalComprado: c.pedidos.reduce((sum, p) => sum + Number(p.total), 0) }))
        .sort((a, b) => b.totalComprado - a.totalComprado)
        .slice(0, 100);
      topClientes.forEach((c, i) => {
        const row = topSheet.addRow({ pos: i + 1, cliente: `${c.nombre || ''} ${c.apellido || ''}`.trim() || 'N/A', pedidos: c.pedidos.length, total: c.totalComprado });
        row.eachCell((cell, colNum) => this.aplicarEstiloCelda(cell, colNum === 4));
      });
    });
  }
}