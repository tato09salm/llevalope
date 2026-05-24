import { PedidosService } from './pedidos.service';
export declare class PedidosController {
    private pedidosService;
    constructor(pedidosService: PedidosService);
    crear(req: any, datos: any): Promise<{
        items: {
            nombre: string;
            id: number;
            productoId: number;
            cantidad: number;
            imagen: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            precioUnit: import("@prisma/client/runtime/library").Decimal;
            pedidoId: number;
        }[];
        historial: {
            id: number;
            creadoEn: Date;
            descripcion: string;
            estado: import(".prisma/client").$Enums.EstadoPedido;
            pedidoId: number;
        }[];
    } & {
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: number;
        total: import("@prisma/client/runtime/library").Decimal;
        direccionId: number | null;
        metodoPago: import(".prisma/client").$Enums.MetodoPago;
        notas: string | null;
        numeroPedido: string;
        estado: import(".prisma/client").$Enums.EstadoPedido;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        descuento: import("@prisma/client/runtime/library").Decimal;
        costoEnvio: import("@prisma/client/runtime/library").Decimal;
        impuestos: import("@prisma/client/runtime/library").Decimal;
        estadoPago: import(".prisma/client").$Enums.EstadoPago;
        fechaEntregaEst: Date | null;
        fechaEntrega: Date | null;
        trackingCode: string | null;
    }>;
    listarMios(req: any): Promise<({
        items: {
            nombre: string;
            id: number;
            productoId: number;
            cantidad: number;
            imagen: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            precioUnit: import("@prisma/client/runtime/library").Decimal;
            pedidoId: number;
        }[];
        historial: {
            id: number;
            creadoEn: Date;
            descripcion: string;
            estado: import(".prisma/client").$Enums.EstadoPedido;
            pedidoId: number;
        }[];
        envio: {
            id: number;
            creadoEn: Date;
            actualizadoEn: Date;
            estado: string;
            pedidoId: number;
            transportista: string;
            codigoTracking: string;
            ubicacionActual: string | null;
            estimadoEntrega: Date | null;
        };
    } & {
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: number;
        total: import("@prisma/client/runtime/library").Decimal;
        direccionId: number | null;
        metodoPago: import(".prisma/client").$Enums.MetodoPago;
        notas: string | null;
        numeroPedido: string;
        estado: import(".prisma/client").$Enums.EstadoPedido;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        descuento: import("@prisma/client/runtime/library").Decimal;
        costoEnvio: import("@prisma/client/runtime/library").Decimal;
        impuestos: import("@prisma/client/runtime/library").Decimal;
        estadoPago: import(".prisma/client").$Enums.EstadoPago;
        fechaEntregaEst: Date | null;
        fechaEntrega: Date | null;
        trackingCode: string | null;
    })[]>;
    listarTodos(pagina?: number, limite?: number, estado?: string): Promise<{
        datos: ({
            usuario: {
                nombre: string;
                apellido: string;
                correo: string;
            };
            items: {
                nombre: string;
                cantidad: number;
            }[];
        } & {
            id: number;
            creadoEn: Date;
            actualizadoEn: Date;
            usuarioId: number;
            total: import("@prisma/client/runtime/library").Decimal;
            direccionId: number | null;
            metodoPago: import(".prisma/client").$Enums.MetodoPago;
            notas: string | null;
            numeroPedido: string;
            estado: import(".prisma/client").$Enums.EstadoPedido;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            descuento: import("@prisma/client/runtime/library").Decimal;
            costoEnvio: import("@prisma/client/runtime/library").Decimal;
            impuestos: import("@prisma/client/runtime/library").Decimal;
            estadoPago: import(".prisma/client").$Enums.EstadoPago;
            fechaEntregaEst: Date | null;
            fechaEntrega: Date | null;
            trackingCode: string | null;
        })[];
        total: number;
        pagina: number;
        limite: number;
        totalPaginas: number;
    }>;
    obtener(id: number, req: any): Promise<{
        usuario: {
            nombre: string;
            apellido: string;
            correo: string;
            telefono: string;
        };
        direccion: {
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
        };
        items: {
            nombre: string;
            id: number;
            productoId: number;
            cantidad: number;
            imagen: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            precioUnit: import("@prisma/client/runtime/library").Decimal;
            pedidoId: number;
        }[];
        historial: {
            id: number;
            creadoEn: Date;
            descripcion: string;
            estado: import(".prisma/client").$Enums.EstadoPedido;
            pedidoId: number;
        }[];
        envio: {
            id: number;
            creadoEn: Date;
            actualizadoEn: Date;
            estado: string;
            pedidoId: number;
            transportista: string;
            codigoTracking: string;
            ubicacionActual: string | null;
            estimadoEntrega: Date | null;
        };
    } & {
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: number;
        total: import("@prisma/client/runtime/library").Decimal;
        direccionId: number | null;
        metodoPago: import(".prisma/client").$Enums.MetodoPago;
        notas: string | null;
        numeroPedido: string;
        estado: import(".prisma/client").$Enums.EstadoPedido;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        descuento: import("@prisma/client/runtime/library").Decimal;
        costoEnvio: import("@prisma/client/runtime/library").Decimal;
        impuestos: import("@prisma/client/runtime/library").Decimal;
        estadoPago: import(".prisma/client").$Enums.EstadoPago;
        fechaEntregaEst: Date | null;
        fechaEntrega: Date | null;
        trackingCode: string | null;
    }>;
    actualizarEstado(id: number, body: {
        estado: string;
        descripcion?: string;
    }): Promise<[{
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: number;
        total: import("@prisma/client/runtime/library").Decimal;
        direccionId: number | null;
        metodoPago: import(".prisma/client").$Enums.MetodoPago;
        notas: string | null;
        numeroPedido: string;
        estado: import(".prisma/client").$Enums.EstadoPedido;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        descuento: import("@prisma/client/runtime/library").Decimal;
        costoEnvio: import("@prisma/client/runtime/library").Decimal;
        impuestos: import("@prisma/client/runtime/library").Decimal;
        estadoPago: import(".prisma/client").$Enums.EstadoPago;
        fechaEntregaEst: Date | null;
        fechaEntrega: Date | null;
        trackingCode: string | null;
    }, {
        id: number;
        creadoEn: Date;
        descripcion: string;
        estado: import(".prisma/client").$Enums.EstadoPedido;
        pedidoId: number;
    }]>;
}
