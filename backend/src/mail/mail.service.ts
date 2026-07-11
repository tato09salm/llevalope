import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

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
  correo: string,
  pedidoId: number,
  fecha: string,
  total: number,
  productos: any[],
): Promise<void> {
  try {
    await this.mailerService.sendMail({
      to: correo,
      from: process.env.MAIL_FROM,
      subject: `Pedido #${pedidoId} confirmado`,
      html: `
        <h1>¡Gracias por tu compra!</h1>
        <p>Pedido: #${pedidoId}</p>
        <p>Fecha: ${fecha}</p>
        <p>Total: S/ ${total}</p>
      `,
    });
    this.logger.log(`Correo de confirmación de pedido enviado a ${correo}`);
  } catch (error) {
    this.logger.error(
      `Failed to send order confirmation email to ${correo}`,
      error.stack,
    );
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
