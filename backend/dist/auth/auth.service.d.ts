import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    registrar(dto: RegisterDto): Promise<{
        usuario: {
            nombre: string;
            apellido: string;
            correo: string;
            id: number;
            rol: import(".prisma/client").$Enums.RolUsuario;
            avatar: string;
            creadoEn: Date;
        };
        token: string;
    }>;
    iniciarSesion(dto: LoginDto): Promise<{
        usuario: {
            nombre: string;
            apellido: string;
            correo: string;
            telefono: string | null;
            id: number;
            rol: import(".prisma/client").$Enums.RolUsuario;
            activo: boolean;
            verificado: boolean;
            avatar: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
        };
        token: string;
    }>;
    perfil(usuarioId: number): Promise<{
        nombre: string;
        apellido: string;
        correo: string;
        telefono: string;
        id: number;
        rol: import(".prisma/client").$Enums.RolUsuario;
        verificado: boolean;
        avatar: string;
        creadoEn: Date;
        direcciones: {
            telefono: string;
            id: number;
            creadoEn: Date;
            alias: string;
            nombreCompleto: string;
            departamento: string;
            provincia: string;
            distrito: string;
            direccion: string;
            referencia: string | null;
            predeterminada: boolean;
            usuarioId: number;
        }[];
    }>;
    validarUsuario(correo: string, contrasena: string): Promise<{
        nombre: string;
        apellido: string;
        correo: string;
        telefono: string | null;
        id: number;
        rol: import(".prisma/client").$Enums.RolUsuario;
        activo: boolean;
        verificado: boolean;
        avatar: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
    private generarToken;
}
