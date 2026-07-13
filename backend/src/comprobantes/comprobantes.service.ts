import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');

export interface ItemComprobantePago {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface DatosComprobantePago {
  numeroPedido: string;
  fecha: string;
  nombreCliente: string;
  correoCliente: string;
  metodoPago: string;
  subtotal: number;
  descuento: number;
  costoEnvio: number;
  impuestos: number;
  total: number;
  items: ItemComprobantePago[];
}

@Injectable()
export class ComprobantesService {
  generarComprobantePago(
    datos: DatosComprobantePago,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const documento = new PDFDocument({
          size: 'A4',
          margin: 45,
          bufferPages: true,
          info: {
            Title: `Comprobante de pago ${datos.numeroPedido}`,
            Author: 'LlevaloPe',
            Subject: 'Comprobante de pago',
          },
        });

        const fragmentos: Buffer[] = [];

        documento.on('data', (fragmento: Buffer) => {
          fragmentos.push(fragmento);
        });

        documento.on('end', () => {
          resolve(Buffer.concat(fragmentos));
        });

        documento.on('error', reject);

        const azulOscuro = '#0D1B2A';
        const azulMedio = '#1B2A41';
        const dorado = '#E0B62F';
        const crema = '#F7F4EC';
        const grisTexto = '#4B5563';
        const verde = '#007D84';
        const grisBorde = '#D7DBE0';

        const margenIzquierdo = 45;
        const anchoContenido =
          documento.page.width - margenIzquierdo * 2;

        const escribirMonto = (valor: number): string =>
          `S/ ${valor.toFixed(2)}`;

        const formatearMetodoPago = (metodo: string): string => {
          const nombres: Record<string, string> = {
            YAPE: 'Yape',
            PLIN: 'Plin',
            TARJETA: 'Tarjeta',
            PAYPAL: 'PayPal',
            TRANSFERENCIA: 'Transferencia bancaria',
            CONTRA_ENTREGA: 'Pago contra entrega',
          };

          return nombres[metodo] ?? metodo.replace(/_/g, ' ');
        };

        const verificarEspacio = (alturaNecesaria: number): void => {
          if (
            documento.y + alturaNecesaria >
            documento.page.height - 65
          ) {
            documento.addPage();
            documento.y = 50;
          }
        };

        // Encabezado
        documento
          .rect(
            0,
            0,
            documento.page.width,
            112,
          )
          .fill(azulOscuro);

        documento
          .font('Helvetica-Bold')
          .fontSize(27)
          .fillColor('#FFFFFF')
          .text('Llevalo', margenIzquierdo, 32, {
            continued: true,
          })
          .fillColor(dorado)
          .text('Pe');

        documento
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#D8DEE8')
          .text(
            'Tu tienda sin límites',
            margenIzquierdo,
            66,
          );

        documento
          .font('Helvetica-Bold')
          .fontSize(18)
          .fillColor('#FFFFFF')
          .text(
            'COMPROBANTE DE PAGO',
            310,
            35,
            {
              width: 240,
              align: 'right',
            },
          );

        documento
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#D8DEE8')
          .text(
            `Pedido ${datos.numeroPedido}`,
            310,
            66,
            {
              width: 240,
              align: 'right',
            },
          );

        documento
          .rect(
            0,
            108,
            documento.page.width,
            4,
          )
          .fill(dorado);

        documento.y = 137;

        // Mensaje de confirmación
        documento
          .roundedRect(
            margenIzquierdo,
            documento.y,
            anchoContenido,
            56,
            6,
          )
          .fill(crema);

        documento
          .font('Helvetica-Bold')
          .fontSize(13)
          .fillColor(verde)
          .text(
            '✓ Pago confirmado correctamente',
            margenIzquierdo + 16,
            documento.y + 12,
          );

        documento
          .font('Helvetica')
          .fontSize(9)
          .fillColor(grisTexto)
          .text(
            'Este documento confirma que el pago del pedido fue registrado satisfactoriamente.',
            margenIzquierdo + 16,
            documento.y + 32,
            {
              width: anchoContenido - 32,
            },
          );

        documento.y += 80;

        // Información del pedido y cliente
        const inicioInformacion = documento.y;
        const anchoColumna = (anchoContenido - 16) / 2;

        documento
          .roundedRect(
            margenIzquierdo,
            inicioInformacion,
            anchoColumna,
            116,
            5,
          )
          .lineWidth(1)
          .strokeColor(grisBorde)
          .stroke();

        documento
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor(azulOscuro)
          .text(
            'Información del pedido',
            margenIzquierdo + 14,
            inicioInformacion + 13,
          );

        documento
          .font('Helvetica')
          .fontSize(9)
          .fillColor(grisTexto)
          .text(
            `Número: ${datos.numeroPedido}`,
            margenIzquierdo + 14,
            inicioInformacion + 38,
          )
          .text(
            `Fecha: ${datos.fecha}`,
            margenIzquierdo + 14,
            inicioInformacion + 56,
          )
          .text(
            `Método: ${formatearMetodoPago(datos.metodoPago)}`,
            margenIzquierdo + 14,
            inicioInformacion + 74,
          )
          .text(
            'Estado: PAGADO',
            margenIzquierdo + 14,
            inicioInformacion + 92,
          );

        const segundaColumnaX =
          margenIzquierdo + anchoColumna + 16;

        documento
          .roundedRect(
            segundaColumnaX,
            inicioInformacion,
            anchoColumna,
            116,
            5,
          )
          .lineWidth(1)
          .strokeColor(grisBorde)
          .stroke();

        documento
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor(azulOscuro)
          .text(
            'Información del cliente',
            segundaColumnaX + 14,
            inicioInformacion + 13,
          );

        documento
          .font('Helvetica')
          .fontSize(9)
          .fillColor(grisTexto)
          .text(
            datos.nombreCliente,
            segundaColumnaX + 14,
            inicioInformacion + 38,
            {
              width: anchoColumna - 28,
            },
          )
          .text(
            datos.correoCliente,
            segundaColumnaX + 14,
            inicioInformacion + 61,
            {
              width: anchoColumna - 28,
            },
          );

        documento.y = inicioInformacion + 142;

        // Detalle de productos
        documento
          .font('Helvetica-Bold')
          .fontSize(14)
          .fillColor(azulOscuro)
          .text('Detalle de productos');

        documento.moveDown(0.7);

        const tablaX = margenIzquierdo;
        const tablaY = documento.y;

        const columnas = {
          producto: 255,
          cantidad: 65,
          precio: 95,
          subtotal: 95,
        };

        documento
          .rect(
            tablaX,
            tablaY,
            anchoContenido,
            30,
          )
          .fill(azulMedio);

        documento
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .fillColor('#FFFFFF')
          .text(
            'PRODUCTO',
            tablaX + 10,
            tablaY + 10,
            {
              width: columnas.producto - 15,
            },
          )
          .text(
            'CANT.',
            tablaX + columnas.producto,
            tablaY + 10,
            {
              width: columnas.cantidad,
              align: 'center',
            },
          )
          .text(
            'PRECIO UNIT.',
            tablaX +
              columnas.producto +
              columnas.cantidad,
            tablaY + 10,
            {
              width: columnas.precio,
              align: 'right',
            },
          )
          .text(
            'SUBTOTAL',
            tablaX +
              columnas.producto +
              columnas.cantidad +
              columnas.precio,
            tablaY + 10,
            {
              width: columnas.subtotal - 10,
              align: 'right',
            },
          );

        documento.y = tablaY + 30;

        datos.items.forEach((item, indice) => {
          verificarEspacio(48);

          const filaY = documento.y;
          const alturaFila = 42;

          if (indice % 2 === 0) {
            documento
              .rect(
                tablaX,
                filaY,
                anchoContenido,
                alturaFila,
              )
              .fill('#F8F9FA');
          }

          documento
            .moveTo(tablaX, filaY + alturaFila)
            .lineTo(
              tablaX + anchoContenido,
              filaY + alturaFila,
            )
            .lineWidth(0.5)
            .strokeColor(grisBorde)
            .stroke();

          documento
            .font('Helvetica')
            .fontSize(8.7)
            .fillColor(azulOscuro)
            .text(
              item.nombre,
              tablaX + 10,
              filaY + 10,
              {
                width: columnas.producto - 20,
                height: 25,
                ellipsis: true,
              },
            )
            .text(
              item.cantidad.toString(),
              tablaX + columnas.producto,
              filaY + 14,
              {
                width: columnas.cantidad,
                align: 'center',
              },
            )
            .text(
              escribirMonto(item.precioUnitario),
              tablaX +
                columnas.producto +
                columnas.cantidad,
              filaY + 14,
              {
                width: columnas.precio,
                align: 'right',
              },
            )
            .text(
              escribirMonto(item.subtotal),
              tablaX +
                columnas.producto +
                columnas.cantidad +
                columnas.precio,
              filaY + 14,
              {
                width: columnas.subtotal - 10,
                align: 'right',
              },
            );

          documento.y = filaY + alturaFila;
        });

        verificarEspacio(180);
        documento.moveDown(1.5);

        // Totales
        const totalesX = 325;
        const totalesAncho = 225;
        const totalesY = documento.y;

        documento
          .roundedRect(
            totalesX,
            totalesY,
            totalesAncho,
            142,
            6,
          )
          .fill(crema);

        const etiquetaX = totalesX + 15;
        const valorX = totalesX + 120;
        let filaTotalY = totalesY + 15;

        const agregarTotal = (
          etiqueta: string,
          valor: number,
          resaltar = false,
        ): void => {
          documento
            .font(
              resaltar
                ? 'Helvetica-Bold'
                : 'Helvetica',
            )
            .fontSize(resaltar ? 12 : 9.5)
            .fillColor(
              resaltar ? azulOscuro : grisTexto,
            )
            .text(etiqueta, etiquetaX, filaTotalY, {
              width: 105,
            })
            .text(
              escribirMonto(valor),
              valorX,
              filaTotalY,
              {
                width: 90,
                align: 'right',
              },
            );

          filaTotalY += resaltar ? 28 : 21;
        };

        agregarTotal('Subtotal', datos.subtotal);
        agregarTotal('Descuentos', datos.descuento);
        agregarTotal('Envío', datos.costoEnvio);
        agregarTotal('Del total, IGV', datos.impuestos);

        documento
          .moveTo(
            etiquetaX,
            filaTotalY - 4,
          )
          .lineTo(
            totalesX + totalesAncho - 15,
            filaTotalY - 4,
          )
          .lineWidth(1)
          .strokeColor(dorado)
          .stroke();

        agregarTotal('TOTAL PAGADO', datos.total, true);

        documento.y = totalesY + 172;

        verificarEspacio(80);

        // Mensaje final
        documento
          .roundedRect(
            margenIzquierdo,
            documento.y,
            anchoContenido,
            60,
            5,
          )
          .lineWidth(1)
          .strokeColor(dorado)
          .stroke();

        documento
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor(azulOscuro)
          .text(
            'Gracias por comprar en LlevaloPe',
            margenIzquierdo + 16,
            documento.y + 13,
            {
              align: 'center',
              width: anchoContenido - 32,
            },
          );

        documento
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor(grisTexto)
          .text(
            'Conserva este comprobante como constancia de tu compra. Nuestro equipo continuará procesando tu pedido.',
            margenIzquierdo + 16,
            documento.y + 33,
            {
              align: 'center',
              width: anchoContenido - 32,
            },
          );

        // Pie de página para todas las páginas
        const rangoPaginas = documento.bufferedPageRange();

        for (
          let pagina = rangoPaginas.start;
          pagina <
          rangoPaginas.start + rangoPaginas.count;
          pagina += 1
        ) {
          documento.switchToPage(pagina);

          documento
            .moveTo(
              margenIzquierdo,
              documento.page.height - 44,
            )
            .lineTo(
              documento.page.width - margenIzquierdo,
              documento.page.height - 44,
            )
            .lineWidth(0.5)
            .strokeColor(grisBorde)
            .stroke();

          documento
            .font('Helvetica')
            .fontSize(7.5)
            .fillColor('#7A8491')
            .text(
              'LlevaloPe · Comprobante generado automáticamente',
              margenIzquierdo,
              documento.page.height - 32,
              {
                width: 340,
              },
            );

          documento.text(
            `Página ${pagina + 1}`,
            documento.page.width - 130,
            documento.page.height - 32,
            {
              width: 85,
              align: 'right',
            },
          );
        }

        documento.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}