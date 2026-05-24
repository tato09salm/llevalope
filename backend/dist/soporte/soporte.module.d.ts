import { PrismaService } from '../common/prisma/prisma.service';
export declare class SoporteService {
    private prisma;
    constructor(prisma: PrismaService);
    crearTicket(usuarioId: number, datos: any): import(".prisma/client").Prisma.Prisma__TicketSoporteClient<{
        usuario: {
            nombre: string;
            apellido: string;
        };
    } & {
        categoria: import(".prisma/client").$Enums.CategoriaTicket;
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: number;
        descripcion: string;
        estado: import(".prisma/client").$Enums.EstadoTicket;
        asunto: string;
        prioridad: import(".prisma/client").$Enums.PrioridadTicket;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    misTickets(usuarioId: number): import(".prisma/client").Prisma.PrismaPromise<({
        mensajes: {
            id: number;
            creadoEn: Date;
            ticketId: number;
            esAgente: boolean;
            mensaje: string;
        }[];
    } & {
        categoria: import(".prisma/client").$Enums.CategoriaTicket;
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: number;
        descripcion: string;
        estado: import(".prisma/client").$Enums.EstadoTicket;
        asunto: string;
        prioridad: import(".prisma/client").$Enums.PrioridadTicket;
    })[]>;
    listarTodos(): import(".prisma/client").Prisma.PrismaPromise<({
        usuario: {
            nombre: string;
            apellido: string;
            correo: string;
        };
        mensajes: {
            id: number;
            creadoEn: Date;
            ticketId: number;
            esAgente: boolean;
            mensaje: string;
        }[];
    } & {
        categoria: import(".prisma/client").$Enums.CategoriaTicket;
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: number;
        descripcion: string;
        estado: import(".prisma/client").$Enums.EstadoTicket;
        asunto: string;
        prioridad: import(".prisma/client").$Enums.PrioridadTicket;
    })[]>;
    responder(ticketId: number, mensaje: string, esAgente: boolean): import(".prisma/client").Prisma.Prisma__MensajeTicketClient<{
        id: number;
        creadoEn: Date;
        ticketId: number;
        esAgente: boolean;
        mensaje: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    actualizarEstado(id: number, estado: string): import(".prisma/client").Prisma.Prisma__TicketSoporteClient<{
        categoria: import(".prisma/client").$Enums.CategoriaTicket;
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: number;
        descripcion: string;
        estado: import(".prisma/client").$Enums.EstadoTicket;
        asunto: string;
        prioridad: import(".prisma/client").$Enums.PrioridadTicket;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
export declare class SoporteController {
    private s;
    constructor(s: SoporteService);
    crear(req: any, d: any): import(".prisma/client").Prisma.Prisma__TicketSoporteClient<{
        usuario: {
            nombre: string;
            apellido: string;
        };
    } & {
        categoria: import(".prisma/client").$Enums.CategoriaTicket;
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: number;
        descripcion: string;
        estado: import(".prisma/client").$Enums.EstadoTicket;
        asunto: string;
        prioridad: import(".prisma/client").$Enums.PrioridadTicket;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    misTickets(req: any): import(".prisma/client").Prisma.PrismaPromise<({
        mensajes: {
            id: number;
            creadoEn: Date;
            ticketId: number;
            esAgente: boolean;
            mensaje: string;
        }[];
    } & {
        categoria: import(".prisma/client").$Enums.CategoriaTicket;
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: number;
        descripcion: string;
        estado: import(".prisma/client").$Enums.EstadoTicket;
        asunto: string;
        prioridad: import(".prisma/client").$Enums.PrioridadTicket;
    })[]>;
    listarTodos(): import(".prisma/client").Prisma.PrismaPromise<({
        usuario: {
            nombre: string;
            apellido: string;
            correo: string;
        };
        mensajes: {
            id: number;
            creadoEn: Date;
            ticketId: number;
            esAgente: boolean;
            mensaje: string;
        }[];
    } & {
        categoria: import(".prisma/client").$Enums.CategoriaTicket;
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: number;
        descripcion: string;
        estado: import(".prisma/client").$Enums.EstadoTicket;
        asunto: string;
        prioridad: import(".prisma/client").$Enums.PrioridadTicket;
    })[]>;
    responder(id: number, b: any, req: any): import(".prisma/client").Prisma.Prisma__MensajeTicketClient<{
        id: number;
        creadoEn: Date;
        ticketId: number;
        esAgente: boolean;
        mensaje: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    actualizarEstado(id: number, b: any): import(".prisma/client").Prisma.Prisma__TicketSoporteClient<{
        categoria: import(".prisma/client").$Enums.CategoriaTicket;
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: number;
        descripcion: string;
        estado: import(".prisma/client").$Enums.EstadoTicket;
        asunto: string;
        prioridad: import(".prisma/client").$Enums.PrioridadTicket;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
export declare class SoporteModule {
}
