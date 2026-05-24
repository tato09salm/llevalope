import { PrismaService } from '../common/prisma/prisma.service';
export declare class UsuariosService {
    private prisma;
    constructor(prisma: PrismaService);
    listar(): Promise<{
        nombre: string;
        apellido: string;
        correo: string;
        id: number;
        rol: import(".prisma/client").$Enums.RolUsuario;
        activo: boolean;
        verificado: boolean;
        creadoEn: Date;
    }[]>;
    actualizarPerfil(id: number, datos: any): Promise<{
        nombre: string;
        apellido: string;
        correo: string;
        telefono: string;
        id: number;
    }>;
    agregarDireccion(usuarioId: number, datos: any): Promise<{
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
    }>;
    listarDirecciones(usuarioId: number): Promise<{
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
    }[]>;
    agregarCarrito(usuarioId: number, productoId: number, cantidad: number): Promise<{
        producto: {
            nombre: string;
            id: number;
            activo: boolean;
            creadoEn: Date;
            actualizadoEn: Date;
            slug: string;
            descripcion: string | null;
            descripcionCorta: string | null;
            sku: string;
            precio: import("@prisma/client/runtime/library").Decimal;
            precioAnterior: import("@prisma/client/runtime/library").Decimal | null;
            porcentajeDescuento: number | null;
            categoriaId: number;
            marcaId: number | null;
            stock: number;
            stockMinimo: number;
            peso: import("@prisma/client/runtime/library").Decimal | null;
            dimensiones: import("@prisma/client/runtime/library").JsonValue | null;
            destacado: boolean;
            enOferta: boolean;
            calificacion: import("@prisma/client/runtime/library").Decimal;
            totalResenas: number;
            totalVentas: number;
            imagenPrincipal: string | null;
        };
    } & {
        id: number;
        creadoEn: Date;
        usuarioId: number;
        productoId: number;
        cantidad: number;
    }>;
    obtenerCarrito(usuarioId: number): Promise<({
        producto: {
            imagenes: {
                id: number;
                productoId: number;
                orden: number;
                url: string;
                alt: string | null;
                principal: boolean;
            }[];
        } & {
            nombre: string;
            id: number;
            activo: boolean;
            creadoEn: Date;
            actualizadoEn: Date;
            slug: string;
            descripcion: string | null;
            descripcionCorta: string | null;
            sku: string;
            precio: import("@prisma/client/runtime/library").Decimal;
            precioAnterior: import("@prisma/client/runtime/library").Decimal | null;
            porcentajeDescuento: number | null;
            categoriaId: number;
            marcaId: number | null;
            stock: number;
            stockMinimo: number;
            peso: import("@prisma/client/runtime/library").Decimal | null;
            dimensiones: import("@prisma/client/runtime/library").JsonValue | null;
            destacado: boolean;
            enOferta: boolean;
            calificacion: import("@prisma/client/runtime/library").Decimal;
            totalResenas: number;
            totalVentas: number;
            imagenPrincipal: string | null;
        };
    } & {
        id: number;
        creadoEn: Date;
        usuarioId: number;
        productoId: number;
        cantidad: number;
    })[]>;
    eliminarDelCarrito(usuarioId: number, productoId: number): Promise<{
        id: number;
        creadoEn: Date;
        usuarioId: number;
        productoId: number;
        cantidad: number;
    }>;
}
export declare class UsuariosController {
    private usuariosService;
    constructor(usuariosService: UsuariosService);
    listar(): Promise<{
        nombre: string;
        apellido: string;
        correo: string;
        id: number;
        rol: import(".prisma/client").$Enums.RolUsuario;
        activo: boolean;
        verificado: boolean;
        creadoEn: Date;
    }[]>;
    actualizarPerfil(req: any, datos: any): Promise<{
        nombre: string;
        apellido: string;
        correo: string;
        telefono: string;
        id: number;
    }>;
    obtenerCarrito(req: any): Promise<({
        producto: {
            imagenes: {
                id: number;
                productoId: number;
                orden: number;
                url: string;
                alt: string | null;
                principal: boolean;
            }[];
        } & {
            nombre: string;
            id: number;
            activo: boolean;
            creadoEn: Date;
            actualizadoEn: Date;
            slug: string;
            descripcion: string | null;
            descripcionCorta: string | null;
            sku: string;
            precio: import("@prisma/client/runtime/library").Decimal;
            precioAnterior: import("@prisma/client/runtime/library").Decimal | null;
            porcentajeDescuento: number | null;
            categoriaId: number;
            marcaId: number | null;
            stock: number;
            stockMinimo: number;
            peso: import("@prisma/client/runtime/library").Decimal | null;
            dimensiones: import("@prisma/client/runtime/library").JsonValue | null;
            destacado: boolean;
            enOferta: boolean;
            calificacion: import("@prisma/client/runtime/library").Decimal;
            totalResenas: number;
            totalVentas: number;
            imagenPrincipal: string | null;
        };
    } & {
        id: number;
        creadoEn: Date;
        usuarioId: number;
        productoId: number;
        cantidad: number;
    })[]>;
    agregarCarrito(req: any, body: {
        productoId: number;
        cantidad: number;
    }): Promise<{
        producto: {
            nombre: string;
            id: number;
            activo: boolean;
            creadoEn: Date;
            actualizadoEn: Date;
            slug: string;
            descripcion: string | null;
            descripcionCorta: string | null;
            sku: string;
            precio: import("@prisma/client/runtime/library").Decimal;
            precioAnterior: import("@prisma/client/runtime/library").Decimal | null;
            porcentajeDescuento: number | null;
            categoriaId: number;
            marcaId: number | null;
            stock: number;
            stockMinimo: number;
            peso: import("@prisma/client/runtime/library").Decimal | null;
            dimensiones: import("@prisma/client/runtime/library").JsonValue | null;
            destacado: boolean;
            enOferta: boolean;
            calificacion: import("@prisma/client/runtime/library").Decimal;
            totalResenas: number;
            totalVentas: number;
            imagenPrincipal: string | null;
        };
    } & {
        id: number;
        creadoEn: Date;
        usuarioId: number;
        productoId: number;
        cantidad: number;
    }>;
    listarDirecciones(req: any): Promise<{
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
    }[]>;
}
export declare class UsuariosModule {
}
