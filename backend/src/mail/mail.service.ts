import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

interface ItemCorreoPedido {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface DatosCorreoPedido {
  correo: string;
  nombreCliente: string;
  numeroPedido: string;
  fecha: string;
  hora: string;
  metodoPago: string;
  estadoPago: string;
  subtotal: number;
  descuento: number;
  costoEnvio: number;
  impuestos: number;
  total: number;
  items: ItemCorreoPedido[];
  comprobantePdf?: Buffer;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(nombre: string, correo: string): Promise<void> {
  try {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bienvenido a LlevaloPe</title>
</head>
<body style="margin:0;padding:0;background-color:#F0EEE9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0EEE9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0D1B2A;padding:28px 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:26px;font-weight:600;color:#FFFFFF;letter-spacing:-0.5px;">Llevalo</span><span style="font-size:26px;font-weight:600;color:#D4AF37;">Pe</span>
                    <div style="font-size:11px;color:#7A7D85;margin-top:3px;letter-spacing:0.04em;">Tu Tienda Online, Sin Límites</div>
                  </td>
                  <td align="right">
                    <span style="background-color:#006D77;color:#FFFFFF;font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px;letter-spacing:0.05em;">NUEVA CUENTA</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Barra dorada -->
          <tr>
            <td style="background-color:#D4AF37;height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="background-color:#1B263B;padding:40px 40px 36px;text-align:center;">
              <div style="font-size:42px;margin-bottom:12px;">🎉</div>
              <h1 style="margin:0 0 10px;font-size:26px;font-weight:700;color:#FFFFFF;line-height:1.2;">¡Bienvenido, ${nombre}!</h1>
              <p style="margin:0;font-size:15px;color:#B0B8C4;line-height:1.6;">Tu cuenta en LlevaloPe fue creada exitosamente.<br/>Ya puedes empezar a descubrir miles de productos.</p>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td style="background-color:#FFFFFF;padding:36px 40px 28px;">
              <p style="margin:0 0 20px;font-size:13px;font-weight:600;color:#7A7D85;letter-spacing:0.07em;text-transform:uppercase;">¿Qué puedes hacer ahora?</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 8px 16px 0;" width="50%">
                    <table cellpadding="0" cellspacing="0" style="width:100%;background:#F5F3EE;border-radius:8px;border-left:4px solid #006D77;">
                      <tr><td style="padding:14px 16px;">
                        <div style="font-size:20px;margin-bottom:6px;">🛍️</div>
                        <div style="font-size:13px;font-weight:600;color:#0D1B2A;margin-bottom:3px;">Explorar productos</div>
                        <div style="font-size:12px;color:#7A7D85;">Miles de artículos esperándote</div>
                      </td></tr>
                    </table>
                  </td>
                  <td style="padding:0 0 16px 8px;" width="50%">
                    <table cellpadding="0" cellspacing="0" style="width:100%;background:#F5F3EE;border-radius:8px;border-left:4px solid #D4AF37;">
                      <tr><td style="padding:14px 16px;">
                        <div style="font-size:20px;margin-bottom:6px;">🚀</div>
                        <div style="font-size:13px;font-weight:600;color:#0D1B2A;margin-bottom:3px;">Envíos rápidos</div>
                        <div style="font-size:12px;color:#7A7D85;">Recibe tus pedidos en casa</div>
                      </td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 8px 0 0;" width="50%">
                    <table cellpadding="0" cellspacing="0" style="width:100%;background:#F5F3EE;border-radius:8px;border-left:4px solid #1B263B;">
                      <tr><td style="padding:14px 16px;">
                        <div style="font-size:20px;margin-bottom:6px;">💳</div>
                        <div style="font-size:13px;font-weight:600;color:#0D1B2A;margin-bottom:3px;">Pago seguro</div>
                        <div style="font-size:12px;color:#7A7D85;">Múltiples métodos disponibles</div>
                      </td></tr>
                    </table>
                  </td>
                  <td style="padding:0 0 0 8px;" width="50%">
                    <table cellpadding="0" cellspacing="0" style="width:100%;background:#F5F3EE;border-radius:8px;border-left:4px solid #006D77;">
                      <tr><td style="padding:14px 16px;">
                        <div style="font-size:20px;margin-bottom:6px;">🎁</div>
                        <div style="font-size:13px;font-weight:600;color:#0D1B2A;margin-bottom:3px;">Ofertas exclusivas</div>
                        <div style="font-size:12px;color:#7A7D85;">Descuentos para miembros</div>
                      </td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <div style="text-align:center;margin:32px 0 8px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/productos"
                   style="display:inline-block;background-color:#006D77;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:14px 36px;border-radius:8px;letter-spacing:0.03em;">
                  Ir a la tienda →
                </a>
              </div>
            </td>
          </tr>

          <!-- Datos de cuenta -->
          <tr>
            <td style="background-color:#F5F3EE;padding:20px 40px;border-top:1px solid #E8E4DC;">
              <p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#7A7D85;letter-spacing:0.07em;text-transform:uppercase;">Tu cuenta</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:13px;color:#7A7D85;padding-bottom:5px;">Nombre</td>
                  <td style="font-size:13px;color:#0D1B2A;font-weight:500;text-align:right;padding-bottom:5px;">${nombre}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#7A7D85;">Correo registrado</td>
                  <td style="font-size:13px;color:#0D1B2A;font-weight:500;text-align:right;">${correo}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0D1B2A;padding:20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:15px;font-weight:600;color:#FFFFFF;">Llevalo</span><span style="font-size:15px;font-weight:600;color:#D4AF37;">Pe</span>
                    <div style="font-size:11px;color:#7A7D85;margin-top:4px;">© 2026 · Hecho con ❤️ para el mercado peruano</div>
                  </td>
                  <td align="right">
                    <div style="font-size:11px;color:#7A7D85;line-height:1.8;">
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/ayuda" style="color:#7A7D85;text-decoration:none;">Ayuda</a>
                      &nbsp;·&nbsp;
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/terminos" style="color:#7A7D85;text-decoration:none;">Términos</a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await this.mailerService.sendMail({
      to: correo,
      from: process.env.MAIL_FROM,
      subject: '¡Bienvenido a LlevaloPe! Tu cuenta está lista 🎉',
      html,
    });
    
    this.logger.log(`Correo de bienvenida enviado a ${correo}`);
  } catch (error) {
    this.logger.error(
      `Failed to send welcome email to ${correo}`,
      error.stack,
    );
  }
    

}

  async sendOrderConfirmation(
  datos: DatosCorreoPedido,
): Promise<boolean> {
  const escaparHtml = (valor: string): string =>
    valor
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const formatearMoneda = (valor: number): string =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(valor);

  const nombresMetodoPago: Record<string, string> = {
    YAPE: 'Yape',
    PLIN: 'Plin',
    TARJETA: 'Tarjeta',
    PAYPAL: 'PayPal',
    TRANSFERENCIA: 'Transferencia bancaria',
    CONTRA_ENTREGA: 'Pago contra entrega',
  };

  const metodoPago =
    nombresMetodoPago[datos.metodoPago] ??
    datos.metodoPago.replace(/_/g, ' ');

  const estaPagado = datos.estadoPago === 'PAGADO';

  const titulo = estaPagado
    ? '¡Pago confirmado!'
    : '¡Pedido recibido!';

  const etiquetaEstado = estaPagado
    ? 'PAGO CONFIRMADO'
    : 'PAGO PENDIENTE';

  const colorEstado = estaPagado
    ? '#007D84'
    : '#9A6B00';

  const fondoEstado = estaPagado
    ? '#E6F6F4'
    : '#FFF4D6';

  const mensajePrincipal = estaPagado
    ? `
      El pago de tu pedido fue registrado correctamente.
      Adjuntamos tu comprobante en formato PDF para que
      puedas conservarlo.
    `
    : `
      Tu pedido fue registrado correctamente. El comprobante
      será enviado cuando el pago sea confirmado.
    `;

  const asunto = estaPagado
    ? `Pago confirmado · Pedido ${datos.numeroPedido} · LlevaloPe`
    : `Pedido ${datos.numeroPedido} recibido · LlevaloPe`;

  const filasProductos = datos.items
    .map(
      (item) => `
        <tr>
          <td
            style="
              padding: 14px 12px;
              border-bottom: 1px solid #E2E5E9;
              color: #172235;
              font-size: 14px;
              line-height: 1.4;
            "
          >
            ${escaparHtml(item.nombre)}
          </td>

          <td
            style="
              padding: 14px 8px;
              border-bottom: 1px solid #E2E5E9;
              color: #4B5563;
              text-align: center;
              font-size: 14px;
            "
          >
            ${item.cantidad}
          </td>

          <td
            style="
              padding: 14px 8px;
              border-bottom: 1px solid #E2E5E9;
              color: #4B5563;
              text-align: right;
              font-size: 14px;
              white-space: nowrap;
            "
          >
            ${formatearMoneda(item.precioUnitario)}
          </td>

          <td
            style="
              padding: 14px 12px;
              border-bottom: 1px solid #E2E5E9;
              color: #172235;
              text-align: right;
              font-size: 14px;
              font-weight: bold;
              white-space: nowrap;
            "
          >
            ${formatearMoneda(item.subtotal)}
          </td>
        </tr>
      `,
    )
    .join('');

  const attachments = datos.comprobantePdf
    ? [
        {
          filename:
            `comprobante-pedido-${datos.numeroPedido}.pdf`,
          content: datos.comprobantePdf,
          contentType: 'application/pdf',
        },
      ]
    : [];

  try {
    await this.mailerService.sendMail({
      to: datos.correo,
      subject: asunto,
      html: `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <title>${titulo}</title>
          </head>

          <body
            style="
              margin: 0;
              padding: 0;
              background-color: #EEF1F5;
              font-family: Arial, Helvetica, sans-serif;
              color: #172235;
            "
          >
            <table
              role="presentation"
              width="100%"
              cellspacing="0"
              cellpadding="0"
              border="0"
              style="background-color: #EEF1F5;"
            >
              <tr>
                <td align="center" style="padding: 30px 12px;">
                  <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    style="
                      max-width: 680px;
                      background-color: #FFFFFF;
                      border-radius: 14px;
                      overflow: hidden;
                      box-shadow: 0 8px 25px rgba(13, 27, 42, 0.12);
                    "
                  >
                    <!-- Encabezado -->
                    <tr>
                      <td
                        style="
                          background-color: #0D1B2A;
                          padding: 28px 34px;
                        "
                      >
                        <table
                          role="presentation"
                          width="100%"
                          cellspacing="0"
                          cellpadding="0"
                          border="0"
                        >
                          <tr>
                            <td>
                              <span
                                style="
                                  color: #FFFFFF;
                                  font-size: 28px;
                                  font-weight: 800;
                                  letter-spacing: -1px;
                                "
                              >
                                Llevalo
                              </span>

                              <span
                                style="
                                  color: #E0B62F;
                                  font-size: 28px;
                                  font-weight: 800;
                                  letter-spacing: -1px;
                                "
                              >
                                Pe
                              </span>

                              <div
                                style="
                                  margin-top: 4px;
                                  color: #AEB8C8;
                                  font-size: 12px;
                                "
                              >
                                Tu tienda sin límites
                              </div>
                            </td>

                            <td
                              align="right"
                              style="
                                color: #FFFFFF;
                                font-size: 13px;
                              "
                            >
                              Pedido

                              <div
                                style="
                                  margin-top: 5px;
                                  color: #E0B62F;
                                  font-size: 17px;
                                  font-weight: bold;
                                "
                              >
                                ${escaparHtml(datos.numeroPedido)}
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td
                        style="
                          height: 4px;
                          background-color: #E0B62F;
                          font-size: 0;
                        "
                      >
                        &nbsp;
                      </td>
                    </tr>

                    <!-- Cuerpo -->
                    <tr>
                      <td style="padding: 34px;">
                        <div
                          style="
                            display: inline-block;
                            padding: 7px 13px;
                            border-radius: 20px;
                            background-color: ${fondoEstado};
                            color: ${colorEstado};
                            font-size: 12px;
                            font-weight: bold;
                            letter-spacing: 0.4px;
                          "
                        >
                          ${
                            estaPagado ? '✓' : '⌛'
                          } ${etiquetaEstado}
                        </div>

                        <h1
                          style="
                            margin: 20px 0 10px;
                            color: #0D1B2A;
                            font-size: 27px;
                            line-height: 1.2;
                          "
                        >
                          ${titulo}
                        </h1>

                        <p
                          style="
                            margin: 0 0 12px;
                            color: #4B5563;
                            font-size: 15px;
                            line-height: 1.7;
                          "
                        >
                          Hola,
                          <strong style="color: #172235;">
                            ${escaparHtml(datos.nombreCliente)} 👋
                          </strong>.
                        </p>

                        <p
                          style="
                            margin: 0;
                            color: #4B5563;
                            font-size: 15px;
                            line-height: 1.7;
                          "
                        >
                          ${mensajePrincipal}
                        </p>

                        <!-- Resumen -->
                        <table
                          role="presentation"
                          width="100%"
                          cellspacing="0"
                          cellpadding="0"
                          border="0"
                          style="
                            margin: 26px 0;
                            border: 1px solid #E1E5EA;
                            border-radius: 10px;
                            background-color: #F8F9FB;
                          "
                        >
                          <tr>
                            <td
                              style="
                                width: 50%;
                                padding: 17px 20px;
                                border-bottom: 1px solid #E1E5EA;
                              "
                            >
                              <div
                                style="
                                  color: #7A8491;
                                  font-size: 11px;
                                  font-weight: bold;
                                  text-transform: uppercase;
                                "
                              >
                                Fecha
                              </div>

                              <div
                                style="
                                  margin-top: 6px;
                                  color: #172235;
                                  font-size: 14px;
                                  font-weight: bold;
                                "
                              >
                                ${escaparHtml(datos.fecha)}
                              </div>

                              <div
                                style="
                                  margin-top: 3px;
                                  color: #6B7280;
                                  font-size: 12px;
                                "
                              >
                                ${escaparHtml(datos.hora)}
                              </div>
                            </td>

                            <td
                              style="
                                width: 50%;
                                padding: 17px 20px;
                                border-bottom: 1px solid #E1E5EA;
                                border-left: 1px solid #E1E5EA;
                              "
                            >
                              <div
                                style="
                                  color: #7A8491;
                                  font-size: 11px;
                                  font-weight: bold;
                                  text-transform: uppercase;
                                "
                              >
                                Método de pago
                              </div>

                              <div
                                style="
                                  margin-top: 6px;
                                  color: #172235;
                                  font-size: 14px;
                                  font-weight: bold;
                                "
                              >
                                ${escaparHtml(metodoPago)}
                              </div>
                            </td>
                          </tr>

                          <tr>
                            <td style="padding: 17px 20px;">
                              <div
                                style="
                                  color: #7A8491;
                                  font-size: 11px;
                                  font-weight: bold;
                                  text-transform: uppercase;
                                "
                              >
                                Estado de pago
                              </div>

                              <div
                                style="
                                  margin-top: 6px;
                                  color: ${colorEstado};
                                  font-size: 14px;
                                  font-weight: bold;
                                "
                              >
                                ${
                                  estaPagado
                                    ? 'Pagado'
                                    : 'Pendiente'
                                }
                              </div>
                            </td>

                            <td
                              style="
                                padding: 17px 20px;
                                border-left: 1px solid #E1E5EA;
                              "
                            >
                              <div
                                style="
                                  color: #7A8491;
                                  font-size: 11px;
                                  font-weight: bold;
                                  text-transform: uppercase;
                                "
                              >
                                Total
                              </div>

                              <div
                                style="
                                  margin-top: 5px;
                                  color: #0D1B2A;
                                  font-size: 21px;
                                  font-weight: 800;
                                "
                              >
                                ${formatearMoneda(datos.total)}
                              </div>
                            </td>
                          </tr>
                        </table>

                        <!-- Productos -->
                        <h2
                          style="
                            margin: 0 0 14px;
                            color: #0D1B2A;
                            font-size: 18px;
                          "
                        >
                          Detalle de productos
                        </h2>

                        <table
                          role="presentation"
                          width="100%"
                          cellspacing="0"
                          cellpadding="0"
                          border="0"
                          style="
                            width: 100%;
                            border-collapse: collapse;
                            border: 1px solid #E2E5E9;
                          "
                        >
                          <thead>
                            <tr style="background-color: #17263B;">
                              <th
                                align="left"
                                style="
                                  padding: 12px;
                                  color: #FFFFFF;
                                  font-size: 11px;
                                "
                              >
                                Producto
                              </th>

                              <th
                                align="center"
                                style="
                                  padding: 12px 8px;
                                  color: #FFFFFF;
                                  font-size: 11px;
                                "
                              >
                                Cant.
                              </th>

                              <th
                                align="right"
                                style="
                                  padding: 12px 8px;
                                  color: #FFFFFF;
                                  font-size: 11px;
                                "
                              >
                                Precio
                              </th>

                              <th
                                align="right"
                                style="
                                  padding: 12px;
                                  color: #FFFFFF;
                                  font-size: 11px;
                                "
                              >
                                Subtotal
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            ${filasProductos}
                          </tbody>
                        </table>

                        <!-- Totales -->
                        <table
                          role="presentation"
                          width="100%"
                          cellspacing="0"
                          cellpadding="0"
                          border="0"
                          style="margin-top: 25px;"
                        >
                          <tr>
                            <td
                              width="50%"
                              style="
                                vertical-align: top;
                                padding-right: 22px;
                              "
                            >
                              <div
                                style="
                                  padding: 18px;
                                  border-left: 4px solid #E0B62F;
                                  background-color: #FAF7ED;
                                  color: #5A5F66;
                                  font-size: 13px;
                                  line-height: 1.6;
                                "
                              >
                                ${
                                  estaPagado
                                    ? `
                                      Tu comprobante de pago se
                                      encuentra adjunto en formato PDF.
                                    `
                                    : `
                                      Te avisaremos por correo cuando
                                      el pago sea confirmado.
                                    `
                                }
                              </div>
                            </td>

                            <td width="50%" style="vertical-align: top;">
                              <table
                                role="presentation"
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                border="0"
                              >
                                <tr>
                                  <td
                                    style="
                                      padding: 6px 0;
                                      color: #6B7280;
                                      font-size: 14px;
                                    "
                                  >
                                    Subtotal
                                  </td>

                                  <td
                                    align="right"
                                    style="
                                      padding: 6px 0;
                                      color: #172235;
                                      font-size: 14px;
                                    "
                                  >
                                    ${formatearMoneda(datos.subtotal)}
                                  </td>
                                </tr>

                                <tr>
                                  <td
                                    style="
                                      padding: 6px 0;
                                      color: #6B7280;
                                      font-size: 14px;
                                    "
                                  >
                                    Descuentos
                                  </td>

                                  <td
                                    align="right"
                                    style="
                                      padding: 6px 0;
                                      color: #007D84;
                                      font-size: 14px;
                                    "
                                  >
                                    ${
                                      datos.descuento > 0
                                        ? `- ${formatearMoneda(
                                            datos.descuento,
                                          )}`
                                        : formatearMoneda(0)
                                    }
                                  </td>
                                </tr>

                                <tr>
                                  <td
                                    style="
                                      padding: 6px 0;
                                      color: #6B7280;
                                      font-size: 14px;
                                    "
                                  >
                                    Envío
                                  </td>

                                  <td
                                    align="right"
                                    style="
                                      padding: 6px 0;
                                      color: #172235;
                                      font-size: 14px;
                                    "
                                  >
                                    ${
                                      datos.costoEnvio === 0
                                        ? 'Gratis'
                                        : formatearMoneda(
                                            datos.costoEnvio,
                                          )
                                    }
                                  </td>
                                </tr>

                                <tr>
                                  <td
                                    style="
                                      padding: 6px 0 12px;
                                      color: #6B7280;
                                      font-size: 14px;
                                    "
                                  >
                                    IGV incluido
                                  </td>

                                  <td
                                    align="right"
                                    style="
                                      padding: 6px 0 12px;
                                      color: #172235;
                                      font-size: 14px;
                                    "
                                  >
                                    ${formatearMoneda(datos.impuestos)}
                                  </td>
                                </tr>

                                <tr>
                                  <td
                                    style="
                                      padding: 13px 0 0;
                                      border-top: 2px solid #E0B62F;
                                      color: #0D1B2A;
                                      font-size: 16px;
                                      font-weight: bold;
                                    "
                                  >
                                    Total
                                  </td>

                                  <td
                                    align="right"
                                    style="
                                      padding: 13px 0 0;
                                      border-top: 2px solid #E0B62F;
                                      color: #0D1B2A;
                                      font-size: 20px;
                                      font-weight: 800;
                                    "
                                  >
                                    ${formatearMoneda(datos.total)}
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>

                        <div
                          style="
                            margin-top: 30px;
                            padding: 20px;
                            border-radius: 9px;
                            background-color: #0D1B2A;
                            text-align: center;
                          "
                        >
                          <div
                            style="
                              color: #FFFFFF;
                              font-size: 16px;
                              font-weight: bold;
                            "
                          >
                            ${
                              estaPagado
                                ? 'Seguiremos preparando tu pedido'
                                : 'Estamos esperando la confirmación del pago'
                            }
                          </div>

                          <div
                            style="
                              margin-top: 7px;
                              color: #B6C0CF;
                              font-size: 13px;
                              line-height: 1.5;
                            "
                          >
                            Podrás consultar el estado desde tu cuenta
                            de LlevaloPe.
                          </div>
                        </div>
                      </td>
                    </tr>

                    <!-- Pie -->
                    <tr>
                      <td
                        style="
                          padding: 28px 34px;
                          background-color: #F4F5F7;
                          border-top: 1px solid #E2E5E9;
                          color: #6B7280;
                          text-align: center;
                          font-size: 13px;
                          line-height: 1.8;
                        "
                      >
                        <strong
                          style="
                            color: #0D1B2A;
                            font-size: 15px;
                          "
                        >
                          ¿Necesitas ayuda?
                        </strong>

                        <br><br>

                        Puedes consultar el estado de tu pedido desde tu cuenta en
                        <strong>LlevaloPe</strong>.

                        <br>

                        Si tienes alguna duda, comunícate con nuestro equipo de soporte.

                        <br><br>

                        <span style="color:#8A93A0;">
                          Este correo fue generado automáticamente.
                          Por favor, no respondas a este mensaje.
                        </span>
                      </td>
                    </tr>
                  </table>

                  <div
                    style="
                      max-width: 680px;
                      padding: 16px 0;
                      color: #8B94A1;
                      text-align: center;
                      font-size: 11px;
                    "
                  >
                    © 2026 LlevaloPe · Tu tienda sin límites
                  </div>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      attachments,
    });

    this.logger.log(
      estaPagado
        ? `Confirmación y comprobante del pedido ${datos.numeroPedido} enviados a ${datos.correo}`
        : `Confirmación del pedido pendiente ${datos.numeroPedido} enviada a ${datos.correo}`,
    );

    return true;
  } catch (error) {
    const mensaje =
      error instanceof Error
        ? error.message
        : 'Error desconocido';

    this.logger.error(
      `No se pudo enviar el correo del pedido ` +
        `${datos.numeroPedido} a ${datos.correo}: ${mensaje}`,
    );

    return false;
  }
}

  async sendOrderStatusUpdate(
  correo: string,
  pedidoId: number,
  estado: string,
  fecha: string,
  asunto: string,
): Promise<void> {
  try {
    await this.mailerService.sendMail({
      to: correo,
      from: process.env.MAIL_FROM,
      subject: asunto,
      html: `
        <h1>Actualización de pedido</h1>
        <p>Tu pedido <strong>#${pedidoId}</strong> cambió de estado.</p>
        <p><strong>Estado actual:</strong> ${estado}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
      `,
    });

    this.logger.log(`Correo de actualización enviado a ${correo}`);
  } catch (error) {
    this.logger.error(
      `Failed to send order status update email to ${correo}`,
      error.stack,
    );
  }
}

  async sendPasswordResetEmail(
  correo: string,
  resetLink: string,
): Promise<void> {
  try {
    await this.mailerService.sendMail({
      to: correo,
      from: process.env.MAIL_FROM,
      subject: 'Recuperación de contraseña - LlevaloPe',
      html: `
        <h1>Recuperación de contraseña</h1>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>
          <a href="${resetLink}">
            Restablecer contraseña
          </a>
        </p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      `,
    });

    this.logger.log(`Correo de recuperación enviado a ${correo}`);
  } catch (error) {
    this.logger.error(
      `Failed to send password reset email to ${correo}`,
      error.stack,
    );
  }
}

 
}
