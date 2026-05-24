import { PrismaService } from '../common/prisma/prisma.service';
export declare class ProveedoresService {
    private prisma;
    constructor(prisma: PrismaService);
    listar(): import(".prisma/client").Prisma.PrismaPromise<{
        nombre: string;
        correo: string | null;
        telefono: string | null;
        id: number;
        activo: boolean;
        creadoEn: Date;
        actualizadoEn: Date;
        direccion: string | null;
        calificacion: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        ruc: string;
        contacto: string | null;
        pais: string;
    }[]>;
    crear(datos: any): import(".prisma/client").Prisma.Prisma__ProveedorClient<{
        nombre: string;
        correo: string | null;
        telefono: string | null;
        id: number;
        activo: boolean;
        creadoEn: Date;
        actualizadoEn: Date;
        direccion: string | null;
        calificacion: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        ruc: string;
        contacto: string | null;
        pais: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    crearOrdenCompra(datos: any): Promise<{
        proveedor: {
            nombre: string;
            correo: string | null;
            telefono: string | null;
            id: number;
            activo: boolean;
            creadoEn: Date;
            actualizadoEn: Date;
            direccion: string | null;
            calificacion: import("@prisma/client/runtime/library").Decimal;
            notas: string | null;
            ruc: string;
            contacto: string | null;
            pais: string;
        };
        items: {
            id: number;
            productoId: number;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            precioUnit: import("@prisma/client/runtime/library").Decimal;
            cantidadPedida: number;
            cantidadRecibida: number;
            ordenCompraId: number;
        }[];
    } & {
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        estado: import(".prisma/client").$Enums.EstadoOrdenCompra;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        descuento: import("@prisma/client/runtime/library").Decimal;
        numeroOrden: string;
        fechaEsperada: Date | null;
        fechaRecepcion: Date | null;
        proveedorId: number;
    }>;
    listarOrdenes(): import(".prisma/client").Prisma.PrismaPromise<({
        proveedor: {
            nombre: string;
        };
        items: {
            id: number;
            productoId: number;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            precioUnit: import("@prisma/client/runtime/library").Decimal;
            cantidadPedida: number;
            cantidadRecibida: number;
            ordenCompraId: number;
        }[];
    } & {
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        estado: import(".prisma/client").$Enums.EstadoOrdenCompra;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        descuento: import("@prisma/client/runtime/library").Decimal;
        numeroOrden: string;
        fechaEsperada: Date | null;
        fechaRecepcion: Date | null;
        proveedorId: number;
    })[]>;
}
export declare class ProveedoresController {
    private s;
    constructor(s: ProveedoresService);
    listar(): import(".prisma/client").Prisma.PrismaPromise<{
        nombre: string;
        correo: string | null;
        telefono: string | null;
        id: number;
        activo: boolean;
        creadoEn: Date;
        actualizadoEn: Date;
        direccion: string | null;
        calificacion: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        ruc: string;
        contacto: string | null;
        pais: string;
    }[]>;
    crear(d: any): import(".prisma/client").Prisma.Prisma__ProveedorClient<{
        nombre: string;
        correo: string | null;
        telefono: string | null;
        id: number;
        activo: boolean;
        creadoEn: Date;
        actualizadoEn: Date;
        direccion: string | null;
        calificacion: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        ruc: string;
        contacto: string | null;
        pais: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listarOrdenes(): import(".prisma/client").Prisma.PrismaPromise<({
        proveedor: {
            nombre: string;
        };
        items: {
            id: number;
            productoId: number;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            precioUnit: import("@prisma/client/runtime/library").Decimal;
            cantidadPedida: number;
            cantidadRecibida: number;
            ordenCompraId: number;
        }[];
    } & {
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        estado: import(".prisma/client").$Enums.EstadoOrdenCompra;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        descuento: import("@prisma/client/runtime/library").Decimal;
        numeroOrden: string;
        fechaEsperada: Date | null;
        fechaRecepcion: Date | null;
        proveedorId: number;
    })[]>;
    crearOrden(d: any): Promise<{
        proveedor: {
            nombre: string;
            correo: string | null;
            telefono: string | null;
            id: number;
            activo: boolean;
            creadoEn: Date;
            actualizadoEn: Date;
            direccion: string | null;
            calificacion: import("@prisma/client/runtime/library").Decimal;
            notas: string | null;
            ruc: string;
            contacto: string | null;
            pais: string;
        };
        items: {
            id: number;
            productoId: number;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            precioUnit: import("@prisma/client/runtime/library").Decimal;
            cantidadPedida: number;
            cantidadRecibida: number;
            ordenCompraId: number;
        }[];
    } & {
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        estado: import(".prisma/client").$Enums.EstadoOrdenCompra;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        descuento: import("@prisma/client/runtime/library").Decimal;
        numeroOrden: string;
        fechaEsperada: Date | null;
        fechaRecepcion: Date | null;
        proveedorId: number;
    }>;
}
export declare class ProveedoresModule {
}
