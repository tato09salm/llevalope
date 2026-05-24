"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let ProductosService = class ProductosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listar(params) {
        const { pagina = 1, limite = 20, busqueda, categoriaId, enOferta, destacado, precioMin, precioMax, ordenar = 'creadoEn', todos = false, } = params;
        const skip = (pagina - 1) * limite;
        const where = todos ? {} : { activo: true };
        if (busqueda) {
            where.OR = [
                { nombre: { contains: busqueda, mode: 'insensitive' } },
                { descripcionCorta: { contains: busqueda, mode: 'insensitive' } },
                { sku: { contains: busqueda, mode: 'insensitive' } },
            ];
        }
        if (categoriaId)
            where.categoriaId = categoriaId;
        if (enOferta !== undefined)
            where.enOferta = enOferta;
        if (destacado !== undefined)
            where.destacado = destacado;
        if (precioMin !== undefined || precioMax !== undefined) {
            where.precio = {};
            if (precioMin !== undefined)
                where.precio.gte = precioMin;
            if (precioMax !== undefined)
                where.precio.lte = precioMax;
        }
        const orderBy = {};
        if (ordenar === 'precio_asc')
            orderBy.precio = 'asc';
        else if (ordenar === 'precio_desc')
            orderBy.precio = 'desc';
        else if (ordenar === 'calificacion')
            orderBy.calificacion = 'desc';
        else if (ordenar === 'ventas')
            orderBy.totalVentas = 'desc';
        else
            orderBy.creadoEn = 'desc';
        const [productos, total] = await Promise.all([
            this.prisma.producto.findMany({
                where,
                skip,
                take: limite,
                orderBy,
                include: {
                    categoria: { select: { id: true, nombre: true, slug: true } },
                    marca: { select: { id: true, nombre: true } },
                    imagenes: { where: { principal: true }, take: 1 },
                },
            }),
            this.prisma.producto.count({ where }),
        ]);
        return {
            datos: productos,
            total,
            pagina,
            limite,
            totalPaginas: Math.ceil(total / limite),
        };
    }
    async obtenerPorSlug(slug) {
        const producto = await this.prisma.producto.findUnique({
            where: { slug },
            include: {
                categoria: true,
                marca: true,
                imagenes: { orderBy: { orden: 'asc' } },
                variantes: true,
                resenas: {
                    where: { aprobada: true },
                    include: {
                        usuario: { select: { nombre: true, apellido: true, avatar: true } },
                    },
                    take: 10,
                    orderBy: { creadoEn: 'desc' },
                },
            },
        });
        if (!producto)
            throw new common_1.NotFoundException('Producto no encontrado');
        return producto;
    }
    async obtenerDestacados() {
        return this.prisma.producto.findMany({
            where: { activo: true, destacado: true },
            take: 8,
            orderBy: { totalVentas: 'desc' },
            include: {
                categoria: { select: { nombre: true, slug: true } },
                imagenes: { where: { principal: true }, take: 1 },
            },
        });
    }
    async obtenerOfertas() {
        return this.prisma.producto.findMany({
            where: { activo: true, enOferta: true },
            take: 12,
            orderBy: { porcentajeDescuento: 'desc' },
            include: {
                imagenes: { where: { principal: true }, take: 1 },
            },
        });
    }
    async crear(datos) {
        const slug = this.generarSlug(datos.nombre);
        return this.prisma.producto.create({
            data: { ...datos, slug },
        });
    }
    async actualizar(id, datos) {
        const existe = await this.prisma.producto.findUnique({ where: { id } });
        if (!existe)
            throw new common_1.NotFoundException('Producto no encontrado');
        return this.prisma.producto.update({
            where: { id },
            data: datos,
        });
    }
    async eliminar(id) {
        return this.prisma.producto.update({
            where: { id },
            data: { activo: false },
        });
    }
    generarSlug(texto) {
        return texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
};
exports.ProductosService = ProductosService;
exports.ProductosService = ProductosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductosService);
//# sourceMappingURL=productos.service.js.map