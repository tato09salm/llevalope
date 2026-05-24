import { PrismaService } from '../common/prisma/prisma.service';
export declare class CategoriasService {
    private prisma;
    constructor(prisma: PrismaService);
    listar(todos?: boolean): Promise<({
        subcategorias: {
            id: number;
            nombre: string;
            slug: string;
            descripcion: string | null;
            imagen: string | null;
            icono: string | null;
            categoriaPadreId: number | null;
            activa: boolean;
            orden: number;
            creadoEn: Date;
            actualizadoEn: Date;
        }[];
    } & {
        id: number;
        nombre: string;
        slug: string;
        descripcion: string | null;
        imagen: string | null;
        icono: string | null;
        categoriaPadreId: number | null;
        activa: boolean;
        orden: number;
        creadoEn: Date;
        actualizadoEn: Date;
    })[]>;
}
