import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import PDFDocument = require('pdfkit');
import * as ExcelJS from 'exceljs';

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
        .then(() => {
          this.agregarPiePaginaPDF(doc);
          doc.end();
        })
        .catch(reject);
    });
  }

  private formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto);
  }

  private dibujarEncabezadoPDF(doc: InstanceType<typeof PDFDocument>, titulo: string, usuario?: string) {
    // Header background (dark blue)
    doc.save();
    doc.rect(50, 50, 500, 100).fillColor(this.colores.azulCorporativo).fill();
    doc.restore();

    // Left side: Brand
    doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold').text('LlevaloPe', 70, 75);
    doc.fontSize(10).font('Helvetica').text('Tu Tienda Online, Sin Límites', 70, 105);

    // Right side: Report title, generated by, date (using width: 480 to keep it centered 20px inside the header rect)
    doc.fillColor(this.colores.dorado).fontSize(13).font('Helvetica-Bold').text(titulo, 50, 70, { width: 480, align: 'right' });
    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica');
    if (usuario) doc.text(`Generado por: ${usuario}`, 50, 90, { width: 480, align: 'right' });
    doc.text(
      `${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      50,
      105,
      { width: 480, align: 'right' },
    );

    // Gold bottom border for header
    doc.save();
    doc.moveTo(50, 150).lineTo(550, 150).strokeColor(this.colores.dorado).lineWidth(2).stroke();
    doc.restore();

    // Reset layout cursor below header
    doc.y = 175;
  }

  private dibujarResumenEjecutivo(doc: InstanceType<typeof PDFDocument>, resumen: { titulo: string; valor: string }[]) {
    // Section title
    doc.fontSize(12).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('RESUMEN EJECUTIVO');
    doc.moveDown(0.5);

    const cardWidth = 158;
    const cardHeight = 55;
    const gap = 13;
    const startX = 50;
    const startY = doc.y;
    const borderColors = [this.colores.verdeAzulado, this.colores.dorado, this.colores.azulOscuro, this.colores.grisElegante];

    resumen.forEach((item, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = startX + col * (cardWidth + gap);
      const y = startY + row * (cardHeight + gap);

      // Card background
      doc.save();
      doc.roundedRect(x, y, cardWidth, cardHeight, 6).fillColor(this.colores.blancoSuave).fill();

      // Left bar border indicator
      doc.rect(x, y, 4, cardHeight).fillColor(borderColors[index % borderColors.length]).fill();
      doc.restore();

      // Card texts
      doc.fillColor(this.colores.azulOscuro).fontSize(8).font('Helvetica-Bold').text(item.titulo.toUpperCase(), x + 12, y + 14);
      doc.fontSize(16).font('Helvetica').text(item.valor, x + 12, y + 28);
    });

    doc.y = startY + Math.ceil(resumen.length / 3) * (cardHeight + gap) + 15;
  }

  private dibujarTablaPDF(
    doc: InstanceType<typeof PDFDocument>,
    titulo: string,
    headers: string[],
    data: any[][],
    colWidths?: number[],
  ) {
    const tableLeft = 50;
    const rowHeight = 22;
    const cellPadding = 5;
    const widths = colWidths || headers.map(() => 500 / headers.length);

    const dibujarCabecera = (yCoord: number) => {
      doc.save();
      doc.fillColor(this.colores.azulCorporativo);
      doc.rect(tableLeft, yCoord, 500, rowHeight).fill();
      doc.restore();

      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
      let currentX = tableLeft;
      headers.forEach((header, i) => {
        doc.text(header, currentX + cellPadding, yCoord + cellPadding + 3, {
          width: widths[i] - cellPadding * 2,
          align: 'left',
        });
        currentX += widths[i];
      });
      return yCoord + rowHeight;
    };

    let y = doc.y;

    // Check if we need to start table on a new page because there's no space for headers + first row
    if (y + rowHeight * 2 > 700) {
      doc.addPage();
      this.dibujarEncabezadoPDF(doc, titulo, 'Administrador');
      y = doc.y;
    }

    // Draw initial header
    y = dibujarCabecera(y);

    data.forEach((row, rowIndex) => {
      // Check if this row fits on the page. Leave space for footer line at 730
      if (y + rowHeight > 700) {
        doc.addPage();
        this.dibujarEncabezadoPDF(doc, titulo, 'Administrador');
        y = doc.y;
        y = dibujarCabecera(y);
      }

      // Draw background row color
      doc.save();
      doc.fillColor(rowIndex % 2 === 0 ? '#F9F9F9' : '#FFFFFF');
      doc.rect(tableLeft, y, 500, rowHeight).fill();
      doc.restore();

      // Draw cell text
      doc.fillColor(this.colores.azulOscuro).fontSize(8.5).font('Helvetica');
      let currentX = tableLeft;
      row.forEach((cell, i) => {
        doc.text(String(cell || ''), currentX + cellPadding, y + cellPadding + 3, {
          width: widths[i] - cellPadding * 2,
          align: 'left',
        });
        currentX += widths[i];
      });

      y += rowHeight;
    });

    doc.y = y + 15;
  }

  private agregarPiePaginaPDF(doc: InstanceType<typeof PDFDocument>) {
    // @ts-ignore
    const pageRange = doc.bufferedPageRange ? doc.bufferedPageRange() : { start: 0, count: 1 };
    for (let i = 0; i < pageRange.count; i++) {
      doc.switchToPage(i);
      
      // Temporarily disable bottom margin to prevent auto page-breaks when writing near the bottom
      const oldBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      
      doc.save();
      doc.moveTo(50, 730).lineTo(550, 730).strokeColor(this.colores.grisElegante).lineWidth(1).stroke();
      doc.restore();

      doc.fontSize(8).fillColor(this.colores.grisElegante).font('Helvetica');
      doc.text('LlevaloPe © 2026 · Sistema e-Business', 50, 740, { lineBreak: false });
      doc.text(`Página ${i + 1} de ${pageRange.count}`, 50, 740, { width: 500, align: 'right', lineBreak: false });
      
      // Restore bottom margin
      doc.page.margins.bottom = oldBottomMargin;
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
    return Buffer.from(buffer);
  }

  private dibujarBannerExcel(ws: ExcelJS.Worksheet, titulo: string) {
    ws.views = [{ showGridLines: true }];
    ws.getRow(1).height = 40;
    ws.mergeCells('A1:F1');
    const cell = ws.getCell('A1');
    cell.value = `LLEVALOPE - ${titulo}`;
    cell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1B263B' }, // azulCorporativo
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  private dibujarKpiCardsExcel(ws: ExcelJS.Worksheet, kpis: { titulo: string; valor: any; esMoneda?: boolean }[]) {
    ws.getRow(3).height = 18;
    ws.getRow(4).height = 28;

    kpis.forEach((kpi, index) => {
      const startColIndex = index * 2 + 1; // 1 (A), 3 (C), 5 (E), 7 (G)
      const endColIndex = startColIndex + 1;

      const colLetterStart = ws.getColumn(startColIndex).letter;
      const colLetterEnd = ws.getColumn(endColIndex).letter;

      // Merge title row
      ws.mergeCells(`${colLetterStart}3:${colLetterEnd}3`);
      const titleCell = ws.getCell(`${colLetterStart}3`);
      titleCell.value = kpi.titulo.toUpperCase();
      titleCell.font = { name: 'Arial', size: 8, bold: true, color: { argb: 'FF7A7D85' } }; // grisElegante
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // Merge value row
      ws.mergeCells(`${colLetterStart}4:${colLetterEnd}4`);
      const valueCell = ws.getCell(`${colLetterStart}4`);
      valueCell.value = kpi.valor;
      valueCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF0D1B2A' } }; // azulOscuro
      valueCell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (kpi.esMoneda) {
        valueCell.numFmt = '"S/"#,##0.00';
      }

      // Card styling
      const bgHex = 'FFF5F3EE'; // blancoSuave
      for (let r = 3; r <= 4; r++) {
        for (let c = startColIndex; c <= endColIndex; c++) {
          const cell = ws.getCell(r, c);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgHex } };
          cell.border = {
            top: r === 3 ? { style: 'thin', color: { argb: 'FFD4AF37' } } : undefined, // dorado top border
            bottom: r === 4 ? { style: 'thin', color: { argb: 'FFCCCCCC' } } : undefined,
            left: c === startColIndex ? { style: 'thin', color: { argb: 'FFCCCCCC' } } : undefined,
            right: c === endColIndex ? { style: 'thin', color: { argb: 'FFCCCCCC' } } : undefined,
          };
        }
      }
    });
  }

  private dibujarCabeceraTablaExcel(ws: ExcelJS.Worksheet, startRow: number, columns: { header: string; key: string; width: number }[]) {
    ws.getRow(startRow).height = 25;

    columns.forEach((col, index) => {
      const cell = ws.getCell(startRow, index + 1);
      cell.value = col.header;
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1B263B' }, // azulCorporativo
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF0D1B2A' } },
        bottom: { style: 'medium', color: { argb: 'FFD4AF37' } }, // dorado border below header
        left: { style: 'thin', color: { argb: 'FF0D1B2A' } },
        right: { style: 'thin', color: { argb: 'FF0D1B2A' } },
      };
      ws.getColumn(index + 1).width = col.width;
    });
  }

  private aplicarEstiloFilaTablaExcel(row: ExcelJS.Row, rowIndex: number, esMonedaColIndices: number[]) {
    row.height = 20;
    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      const bgHex = rowIndex % 2 === 0 ? 'FFF9F9F9' : 'FFFFFFFF';
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgHex } };
      cell.font = { name: 'Arial', size: 9, color: { argb: 'FF0D1B2A' } }; // azulOscuro

      const valStr = String(cell.value || '');
      if (esMonedaColIndices.includes(colNum)) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '"S/"#,##0.00';
      } else if (
        valStr.startsWith('#') ||
        valStr === 'Activo' ||
        valStr === 'Inactivo' ||
        valStr.match(/^\d{4}-\d{2}-\d{2}$/)
      ) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }

      cell.border = {
        top: { style: 'thin', color: { argb: 'FFEAEAEA' } },
        bottom: { style: 'thin', color: { argb: 'FFEAEAEA' } },
        left: { style: 'thin', color: { argb: 'FFEAEAEA' } },
        right: { style: 'thin', color: { argb: 'FFEAEAEA' } },
      };
    });
  }

  private aplicarEstiloTotalExcel(row: ExcelJS.Row, esMonedaColIndices: number[]) {
    row.height = 22;
    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0D1B2A' } }; // azulOscuro
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F3EE' } }; // blancoSuave

      if (esMonedaColIndices.includes(colNum)) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '"S/"#,##0.00';
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }

      cell.border = {
        top: { style: 'thin', color: { argb: 'FF1B263B' } },
        bottom: { style: 'double', color: { argb: 'FF1B263B' } }, // double accounting line
        left: { style: 'thin', color: { argb: 'FFEAEAEA' } },
        right: { style: 'thin', color: { argb: 'FFEAEAEA' } },
      };
    });
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
      this.dibujarEncabezadoPDF(doc, 'REPORTE DE VENTAS', 'Administrador');
      this.dibujarResumenEjecutivo(doc, [
        { titulo: 'Ventas Totales', valor: this.formatearMonto(totalVentas) },
        { titulo: 'Pedidos Totales', valor: String(totalPedidos) },
        { titulo: 'Ticket Promedio', valor: this.formatearMonto(ticketPromedio) },
        { titulo: 'Clientes', valor: String(new Set(pedidos.map((p) => p.usuarioId)).size) },
      ]);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('LISTADO DE VENTAS');
      doc.moveDown(0.5);
      this.dibujarTablaPDF(
        doc,
        'REPORTE DE VENTAS',
        ['Fecha', 'Pedidos', 'Monto Total'],
        ventas.map((v) => [v.fecha, String(v.cantidad), this.formatearMonto(v.total)]),
        [150, 100, 250],
      );

      if (masVendidos.length > 0) {
        doc.addPage();
        this.dibujarEncabezadoPDF(doc, 'REPORTE DE VENTAS', 'Administrador');
        doc.fontSize(12).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('TOP 10 PRODUCTOS MÁS VENDIDOS');
        doc.moveDown(0.5);
        this.dibujarTablaPDF(
          doc,
          'REPORTE DE VENTAS',
          ['#', 'Producto', 'Cantidad Vendida', 'Ingresos'],
          masVendidos.map((p, i) => {
            const precio = p.variantes[0]?.precioOferta || p.variantes[0]?.precioBase || 0;
            return [
              String(i + 1),
              p.nombre,
              String(p.totalVentas),
              this.formatearMonto(p.totalVentas * Number(precio)),
            ];
          }),
          [30, 270, 100, 100],
        );
      }
    });
  }

  async generarPDFProductos(): Promise<Buffer> {
    const productos = await this.obtenerProductosParaReportes();
    return this.crearPDFBuffer(async (doc) => {
      this.dibujarEncabezadoPDF(doc, 'REPORTE DE PRODUCTOS', 'Administrador');
      this.dibujarResumenEjecutivo(doc, [
        { titulo: 'Total Productos', valor: String(productos.length) },
        { titulo: 'Activos', valor: String(productos.filter((p) => p.activo).length) },
        { titulo: 'Sin Stock', valor: String(productos.filter((p) => p.variantes.some((v) => v.stock <= 0)).length) },
        {
          titulo: 'Stock Crítico (<= 5)',
          valor: String(productos.filter((p) => p.variantes.some((v) => v.stock > 0 && v.stock <= 5)).length),
        },
      ]);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('LISTADO DE PRODUCTOS');
      doc.moveDown(0.5);
      this.dibujarTablaPDF(
        doc,
        'REPORTE DE PRODUCTOS',
        ['Producto', 'Categoría', 'Precio', 'Stock', 'Estado'],
        productos.map((p) => {
          const variante = p.variantes[0];
          const precio = variante?.precioOferta || variante?.precioBase || 0;
          return [
            p.nombre,
            p.categoria?.nombre || 'Sin categoría',
            this.formatearMonto(Number(precio)),
            String(variante?.stock || 0),
            p.activo ? 'Activo' : 'Inactivo',
          ];
        }),
        [180, 100, 80, 70, 70],
      );

      if (productos.length > 0) {
        doc.addPage();
        this.dibujarEncabezadoPDF(doc, 'REPORTE DE PRODUCTOS', 'Administrador');
        doc.fontSize(12).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('TOP PRODUCTOS CON MENOR STOCK');
        doc.moveDown(0.5);
        const ordenados = [...productos]
          .sort((a, b) => (a.variantes[0]?.stock || 0) - (b.variantes[0]?.stock || 0))
          .slice(0, 20);
        this.dibujarTablaPDF(
          doc,
          'REPORTE DE PRODUCTOS',
          ['Producto', 'Stock', 'Estado'],
          ordenados.map((p) => {
            const s = p.variantes[0]?.stock || 0;
            return [p.nombre, String(s), s <= 0 ? 'Agotado' : s <= 5 ? 'Crítico' : 'Normal'];
          }),
          [300, 100, 100],
        );
      }
    });
  }

  async generarPDFPedidos(): Promise<Buffer> {
    const pedidos = await this.obtenerPedidosParaExportar();
    return this.crearPDFBuffer(async (doc) => {
      this.dibujarEncabezadoPDF(doc, 'REPORTE DE PEDIDOS', 'Administrador');
      this.dibujarResumenEjecutivo(doc, [
        { titulo: 'Pendientes', valor: String(pedidos.filter((p) => p.estado === 'PENDIENTE').length) },
        { titulo: 'En Preparación', valor: String(pedidos.filter((p) => p.estado === 'EN_PREPARACION').length) },
        { titulo: 'Enviados', valor: String(pedidos.filter((p) => p.estado === 'ENVIADO').length) },
        { titulo: 'Entregados', valor: String(pedidos.filter((p) => p.estado === 'ENTREGADO').length) },
      ]);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('LISTADO DE PEDIDOS');
      doc.moveDown(0.5);
      this.dibujarTablaPDF(
        doc,
        'REPORTE DE PEDIDOS',
        ['Pedido', 'Cliente', 'Fecha', 'Total', 'Estado', 'Método Pago'],
        pedidos.map((p) => [
          `#${p.id}`,
          `${p.usuario?.nombre || ''} ${p.usuario?.apellido || ''}`.trim() || p.usuario?.correo || 'N/A',
          p.creadoEn.toISOString().split('T')[0],
          this.formatearMonto(Number(p.total)),
          p.estado,
          p.metodoPago || 'N/A',
        ]),
        [70, 130, 80, 80, 80, 60],
      );
    });
  }

  async generarPDFInventario(): Promise<Buffer> {
    const inventario = await this.obtenerInventarioParaReportes();
    const valorTotal = inventario.reduce((sum, v) => sum + Number(v.precioBase) * v.stock, 0);
    return this.crearPDFBuffer(async (doc) => {
      this.dibujarEncabezadoPDF(doc, 'REPORTE DE INVENTARIO', 'Administrador');
      this.dibujarResumenEjecutivo(doc, [
        { titulo: 'Stock Crítico (<= 5)', valor: String(inventario.filter((v) => v.stock > 0 && v.stock <= 5).length) },
        { titulo: 'Agotados', valor: String(inventario.filter((v) => v.stock <= 0).length) },
        { titulo: 'Valor Total', valor: this.formatearMonto(valorTotal) },
      ]);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('ESTADO DEL INVENTARIO');
      doc.moveDown(0.5);
      this.dibujarTablaPDF(
        doc,
        'REPORTE DE INVENTARIO',
        ['Producto', 'Stock Actual', 'Stock Mínimo', 'Estado'],
        inventario.map((v) => [
          v.producto.nombre,
          String(v.stock),
          '5',
          v.stock <= 0 ? 'Agotado' : v.stock <= 5 ? 'Crítico' : 'Normal',
        ]),
        [250, 100, 80, 70],
      );
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
        { titulo: 'Nuevos (Mes)', valor: String(clientes.filter((c) => c.creadoEn >= inicioMes).length) },
        { titulo: 'Activos', valor: String(clientes.filter((c) => c.pedidos.length > 0).length) },
      ]);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('LISTADO DE CLIENTES');
      doc.moveDown(0.5);
      this.dibujarTablaPDF(
        doc,
        'REPORTE DE CLIENTES',
        ['#', 'Cliente', 'Correo', 'Pedidos', 'Total Comprado'],
        clientes.map((c, index) => {
          const total = c.pedidos.reduce((sum, p) => sum + Number(p.total), 0);
          return [
            String(index + 1),
            `${c.nombre || ''} ${c.apellido || ''}`.trim() || 'N/A',
            c.correo,
            String(c.pedidos.length),
            this.formatearMonto(total),
          ];
        }),
        [30, 120, 150, 80, 120],
      );

      if (clientes.length > 0) {
        doc.addPage();
        this.dibujarEncabezadoPDF(doc, 'REPORTE DE CLIENTES', 'Administrador');
        doc.fontSize(12).font('Helvetica-Bold').fillColor(this.colores.grisElegante).text('TOP 10 CLIENTES CON MAYOR VOLUMEN');
        doc.moveDown(0.5);
        const top = [...clientes]
          .map((c) => ({ ...c, totalComprado: c.pedidos.reduce((sum, p) => sum + Number(p.total), 0) }))
          .sort((a, b) => b.totalComprado - a.totalComprado)
          .slice(0, 10);
        this.dibujarTablaPDF(
          doc,
          'REPORTE DE CLIENTES',
          ['#', 'Cliente', 'Pedidos', 'Total Comprado'],
          top.map((c, i) => [
            String(i + 1),
            `${c.nombre || ''} ${c.apellido || ''}`.trim() || 'N/A',
            String(c.pedidos.length),
            this.formatearMonto(c.totalComprado),
          ]),
          [30, 220, 100, 150],
        );
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
      // Sheet 1: Ventas
      const wsVentas = workbook.addWorksheet('Resumen de Ventas');
      this.dibujarBannerExcel(wsVentas, 'REPORTE DE VENTAS');

      this.dibujarKpiCardsExcel(wsVentas, [
        { titulo: 'Ventas Totales', valor: totalVentas, esMoneda: true },
        { titulo: 'Pedidos Totales', valor: totalPedidos },
        { titulo: 'Ticket Promedio', valor: ticketPromedio, esMoneda: true },
        { titulo: 'Clientes Activos', valor: new Set(pedidos.map((p) => p.usuarioId)).size },
      ]);

      const columnsVentas = [
        { header: 'Fecha', key: 'fecha', width: 18 },
        { header: 'Pedidos', key: 'pedidos', width: 15 },
        { header: 'Monto Total', key: 'total', width: 25 },
      ];
      this.dibujarCabeceraTablaExcel(wsVentas, 7, columnsVentas);

      ventas.forEach((v, index) => {
        const row = wsVentas.addRow([v.fecha, v.cantidad, Number(v.total)]);
        this.aplicarEstiloFilaTablaExcel(row, index, [3]);
      });

      const totalRow = wsVentas.addRow(['TOTAL', totalPedidos, totalVentas]);
      this.aplicarEstiloTotalExcel(totalRow, [3]);

      // Sheet 2: Top Productos
      const wsTop = workbook.addWorksheet('Top Productos');
      this.dibujarBannerExcel(wsTop, 'TOP PRODUCTOS MÁS VENDIDOS');

      const columnsTop = [
        { header: '#', key: 'pos', width: 8 },
        { header: 'Producto', key: 'producto', width: 45 },
        { header: 'Cantidad Vendida', key: 'cantidad', width: 20 },
        { header: 'Precio Unitario', key: 'precio', width: 20 },
        { header: 'Ingresos Generados', key: 'ingresos', width: 25 },
      ];
      this.dibujarCabeceraTablaExcel(wsTop, 3, columnsTop);

      masVendidos.slice(0, 100).forEach((p, i) => {
        const precio = p.variantes[0]?.precioOferta || p.variantes[0]?.precioBase || 0;
        const row = wsTop.addRow([
          i + 1,
          p.nombre,
          p.totalVentas,
          Number(precio),
          p.totalVentas * Number(precio),
        ]);
        this.aplicarEstiloFilaTablaExcel(row, i, [4, 5]);
      });
    });
  }

  async generarExcelProductos(): Promise<Buffer> {
    const productos = await this.obtenerProductosParaReportes();
    const stockCritico = productos.filter((p) => p.variantes.some((v) => v.stock > 0 && v.stock <= 5)).length;
    const sinStock = productos.filter((p) => p.variantes.some((v) => v.stock <= 0)).length;
    const activos = productos.filter((p) => p.activo).length;

    return this.crearExcelBuffer(async (workbook) => {
      const ws = workbook.addWorksheet('Listado de Productos');
      this.dibujarBannerExcel(ws, 'REPORTE DE PRODUCTOS');

      this.dibujarKpiCardsExcel(ws, [
        { titulo: 'Total Productos', valor: productos.length },
        { titulo: 'Productos Activos', valor: activos },
        { titulo: 'Sin Stock', valor: sinStock },
        { titulo: 'Stock Crítico (<= 5)', valor: stockCritico },
      ]);

      const columns = [
        { header: 'Producto', key: 'nombre', width: 40 },
        { header: 'Categoría', key: 'categoria', width: 22 },
        { header: 'Precio', key: 'precio', width: 18 },
        { header: 'Stock', key: 'stock', width: 15 },
        { header: 'Estado', key: 'estado', width: 15 },
      ];
      this.dibujarCabeceraTablaExcel(ws, 7, columns);

      productos.forEach((p, index) => {
        const variante = p.variantes[0];
        const precio = variante?.precioOferta || variante?.precioBase || 0;
        const row = ws.addRow([
          p.nombre,
          p.categoria?.nombre || 'Sin categoría',
          Number(precio),
          variante?.stock || 0,
          p.activo ? 'Activo' : 'Inactivo',
        ]);
        this.aplicarEstiloFilaTablaExcel(row, index, [3]);
      });
    });
  }

  async generarExcelPedidos(): Promise<Buffer> {
    const pedidos = await this.obtenerPedidosParaExportar();

    return this.crearExcelBuffer(async (workbook) => {
      const ws = workbook.addWorksheet('Listado de Pedidos');
      this.dibujarBannerExcel(ws, 'REPORTE DE PEDIDOS');

      this.dibujarKpiCardsExcel(ws, [
        { titulo: 'Pendientes', valor: pedidos.filter((p) => p.estado === 'PENDIENTE').length },
        { titulo: 'En Preparación', valor: pedidos.filter((p) => p.estado === 'EN_PREPARACION').length },
        { titulo: 'Enviados', valor: pedidos.filter((p) => p.estado === 'ENVIADO').length },
        { titulo: 'Entregados', valor: pedidos.filter((p) => p.estado === 'ENTREGADO').length },
      ]);

      const columns = [
        { header: 'Código Pedido', key: 'pedido', width: 18 },
        { header: 'Cliente', key: 'cliente', width: 35 },
        { header: 'Fecha de Registro', key: 'fecha', width: 20 },
        { header: 'Monto Total', key: 'total', width: 22 },
        { header: 'Estado Envío', key: 'estado', width: 20 },
        { header: 'Método de Pago', key: 'pago', width: 20 },
      ];
      this.dibujarCabeceraTablaExcel(ws, 7, columns);

      pedidos.forEach((p, index) => {
        const row = ws.addRow([
          `#${p.id}`,
          `${p.usuario?.nombre || ''} ${p.usuario?.apellido || ''}`.trim() || p.usuario?.correo || 'N/A',
          p.creadoEn.toISOString().split('T')[0],
          Number(p.total),
          p.estado,
          p.metodoPago || 'N/A',
        ]);
        this.aplicarEstiloFilaTablaExcel(row, index, [4]);
      });
    });
  }

  async generarExcelInventario(): Promise<Buffer> {
    const inventario = await this.obtenerInventarioParaReportes();
    const stockCritico = inventario.filter((v) => v.stock > 0 && v.stock <= 5).length;
    const agotados = inventario.filter((v) => v.stock <= 0).length;
    const valorTotal = inventario.reduce((sum, v) => sum + Number(v.precioBase) * v.stock, 0);

    return this.crearExcelBuffer(async (workbook) => {
      const ws = workbook.addWorksheet('Inventario de Stock');
      this.dibujarBannerExcel(ws, 'REPORTE DE INVENTARIO');

      this.dibujarKpiCardsExcel(ws, [
        { titulo: 'Productos Agotados', valor: agotados },
        { titulo: 'Stock Crítico (<= 5)', valor: stockCritico },
        { titulo: 'Valor Total del Inventario', valor: valorTotal, esMoneda: true },
      ]);

      const columns = [
        { header: 'Producto', key: 'producto', width: 45 },
        { header: 'Stock Actual', key: 'stock', width: 18 },
        { header: 'Stock Mínimo Sugerido', key: 'minimo', width: 22 },
        { header: 'Estado Stock', key: 'estado', width: 20 },
      ];
      this.dibujarCabeceraTablaExcel(ws, 7, columns);

      inventario.forEach((v, index) => {
        const row = ws.addRow([
          v.producto.nombre,
          v.stock,
          5,
          v.stock <= 0 ? 'Agotado' : v.stock <= 5 ? 'Crítico' : 'Normal',
        ]);
        this.aplicarEstiloFilaTablaExcel(row, index, []);
      });
    });
  }

  async generarExcelClientes(): Promise<Buffer> {
    const clientes = await this.obtenerClientesParaReportes();
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const nuevosClientes = clientes.filter((c) => c.creadoEn >= inicioMes).length;
    const clientesActivos = clientes.filter((c) => c.pedidos.length > 0).length;

    return this.crearExcelBuffer(async (workbook) => {
      // Sheet 1: Listado de Clientes
      const wsClientes = workbook.addWorksheet('Listado de Clientes');
      this.dibujarBannerExcel(wsClientes, 'REPORTE DE CLIENTES');

      this.dibujarKpiCardsExcel(wsClientes, [
        { titulo: 'Total Clientes', valor: clientes.length },
        { titulo: 'Nuevos Clientes (Mes)', valor: nuevosClientes },
        { titulo: 'Clientes Activos', valor: clientesActivos },
      ]);

      const columnsClientes = [
        { header: 'Cliente', key: 'cliente', width: 35 },
        { header: 'Correo Electrónico', key: 'correo', width: 35 },
        { header: 'Pedidos Realizados', key: 'pedidos', width: 20 },
        { header: 'Total Invertido', key: 'total', width: 22 },
      ];
      this.dibujarCabeceraTablaExcel(wsClientes, 7, columnsClientes);

      clientes.forEach((c, index) => {
        const totalComprado = c.pedidos.reduce((sum, p) => sum + Number(p.total), 0);
        const row = wsClientes.addRow([
          `${c.nombre || ''} ${c.apellido || ''}`.trim() || 'N/A',
          c.correo,
          c.pedidos.length,
          totalComprado,
        ]);
        this.aplicarEstiloFilaTablaExcel(row, index, [4]);
      });

      // Sheet 2: Top Clientes
      const wsTop = workbook.addWorksheet('Top Clientes');
      this.dibujarBannerExcel(wsTop, 'TOP CLIENTES DE MAYOR VOLUMEN');

      const columnsTop = [
        { header: '#', key: 'pos', width: 8 },
        { header: 'Cliente', key: 'cliente', width: 35 },
        { header: 'Cantidad de Pedidos', key: 'pedidos', width: 22 },
        { header: 'Total Comprado', key: 'total', width: 25 },
      ];
      this.dibujarCabeceraTablaExcel(wsTop, 3, columnsTop);

      const topClientes = [...clientes]
        .map((c) => ({ ...c, totalComprado: c.pedidos.reduce((sum, p) => sum + Number(p.total), 0) }))
        .sort((a, b) => b.totalComprado - a.totalComprado)
        .slice(0, 100);

      topClientes.forEach((c, i) => {
        const row = wsTop.addRow([
          i + 1,
          `${c.nombre || ''} ${c.apellido || ''}`.trim() || 'N/A',
          c.pedidos.length,
          c.totalComprado,
        ]);
        this.aplicarEstiloFilaTablaExcel(row, i, [4]);
      });
    });
  }
}