import { PrismaService } from '../common/prisma/prisma.service';
export declare class InventarioService {
    private prisma;
    constructor(prisma: PrismaService);
    stockBajo(): Promise<{
        nombre: string;
        id: number;
        sku: string;
        stock: number;
        stockMinimo: number;
    }[]>;
    movimientos(productoId?: number): Promise<({
        producto: {
            nombre: string;
            sku: string;
        };
    } & {
        id: number;
        creadoEn: Date;
        referencia: string | null;
        productoId: number;
        cantidad: number;
        tipo: import(".prisma/client").$Enums.TipoMovimiento;
        stockAnterior: number;
        stockNuevo: number;
        motivo: string;
    })[]>;
    ajustarStock(productoId: number, cantidad: number, motivo: string, tipo: string): Promise<[{
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
    }, {
        id: number;
        creadoEn: Date;
        referencia: string | null;
        productoId: number;
        cantidad: number;
        tipo: import(".prisma/client").$Enums.TipoMovimiento;
        stockAnterior: number;
        stockNuevo: number;
        motivo: string;
    }]>;
}
export declare class InventarioController {
    private s;
    constructor(s: InventarioService);
    stockBajo(): Promise<{
        nombre: string;
        id: number;
        sku: string;
        stock: number;
        stockMinimo: number;
    }[]>;
    movimientos(id?: number): Promise<({
        producto: {
            nombre: string;
            sku: string;
        };
    } & {
        id: number;
        creadoEn: Date;
        referencia: string | null;
        productoId: number;
        cantidad: number;
        tipo: import(".prisma/client").$Enums.TipoMovimiento;
        stockAnterior: number;
        stockNuevo: number;
        motivo: string;
    })[]>;
    ajustar(b: any): Promise<[{
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
    }, {
        id: number;
        creadoEn: Date;
        referencia: string | null;
        productoId: number;
        cantidad: number;
        tipo: import(".prisma/client").$Enums.TipoMovimiento;
        stockAnterior: number;
        stockNuevo: number;
        motivo: string;
    }]>;
}
export declare class InventarioModule {
}
