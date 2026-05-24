import { PrismaService } from '../common/prisma/prisma.service';
export declare class ReportesService {
    private prisma;
    constructor(prisma: PrismaService);
    resumenDashboard(): Promise<{
        totalProductos: number;
        totalUsuarios: number;
        pedidosMes: number;
        ventasMes: number | import("@prisma/client/runtime/library").Decimal;
        productosStockBajo: number;
        ticketsAbiertos: number;
    }>;
    ventasPorDia(dias?: number): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PedidoGroupByOutputType, "creadoEn"[]> & {
        _count: {
            id: number;
        };
        _sum: {
            total: import("@prisma/client/runtime/library").Decimal;
        };
    })[]>;
    productosMasVendidos(limite?: number): Promise<{
        nombre: string;
        id: number;
        precio: import("@prisma/client/runtime/library").Decimal;
        totalVentas: number;
        imagenPrincipal: string;
    }[]>;
}
export declare class ReportesController {
    private s;
    constructor(s: ReportesService);
    dashboard(): Promise<{
        totalProductos: number;
        totalUsuarios: number;
        pedidosMes: number;
        ventasMes: number | import("@prisma/client/runtime/library").Decimal;
        productosStockBajo: number;
        ticketsAbiertos: number;
    }>;
    ventasPorDia(): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PedidoGroupByOutputType, "creadoEn"[]> & {
        _count: {
            id: number;
        };
        _sum: {
            total: import("@prisma/client/runtime/library").Decimal;
        };
    })[]>;
    masVendidos(): Promise<{
        nombre: string;
        id: number;
        precio: import("@prisma/client/runtime/library").Decimal;
        totalVentas: number;
        imagenPrincipal: string;
    }[]>;
}
export declare class ReportesModule {
}
