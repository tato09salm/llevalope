import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async registrar(dto: RegisterDto) {
    const existe = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo },
    });

    if (existe) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hash = await bcrypt.hash(dto.contrasena, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        correo: dto.correo,
        contrasena: hash,
        telefono: dto.telefono,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
        rol: true,
        avatar: true,
        creadoEn: true,
      },
    });

    // Send welcome email (non-blocking)
    this.mailService.sendWelcomeEmail(
      `${usuario.nombre} ${usuario.apellido}`,
      usuario.correo,
    );

    const token = this.generarToken(usuario);
    return { usuario, token };
  }

  async iniciarSesion(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valido = await bcrypt.compare(dto.contrasena, usuario.contrasena);
    if (!valido) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { contrasena, ...datos } = usuario;
    const token = this.generarToken(datos);

    return { usuario: datos, token };
  }

  async loginGoogle(dto: GoogleLoginDto) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: dto.idToken,
      audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new UnauthorizedException('Token de Google inválido');
    }

    let usuario = await this.prisma.usuario.findUnique({
      where: { correo: payload.email },
    });

    if (!usuario) {
      // Create new client user
      const nombreCompleto = payload.name || 'Usuario';
      const partes = nombreCompleto.split(' ');
      const nombre = partes[0];
      const apellido = partes.slice(1).join(' ') || '';

      usuario = await this.prisma.usuario.create({
        data: {
          nombre,
          apellido,
          correo: payload.email,
          contrasena: '', // No password for Google users
          rol: 'CLIENTE',
          verificado: true,
          avatar: payload.picture,
        },
      });

      // Send welcome email
      this.mailService.sendWelcomeEmail(
        `${usuario.nombre} ${usuario.apellido}`,
        usuario.correo,
      );
    } else if (!usuario.activo) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    const { contrasena, ...datos } = usuario;
    const token = this.generarToken(datos);

    return { usuario: datos, token };
  }

  async perfil(usuarioId: number) {
    return this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
        telefono: true,
        rol: true,
        avatar: true,
        verificado: true,
        creadoEn: true,
        direcciones: true,
      },
    });
  }

  async validarUsuario(correo: string, contrasena: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo },
    });

    if (usuario && (await bcrypt.compare(contrasena, usuario.contrasena))) {
      const { contrasena: _, ...resultado } = usuario;
      return resultado;
    }
    return null;
  }

  private generarToken(usuario: any) {
    return this.jwtService.sign({
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    });
  }
}
