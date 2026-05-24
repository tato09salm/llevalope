import { CategoriasService } from './categorias.service';
export declare class CategoriasController {
    private categoriasService;
    constructor(categoriasService: CategoriasService);
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
