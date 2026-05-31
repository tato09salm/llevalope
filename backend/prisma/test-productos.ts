import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Testing ProductosService.listar()...');

  const params: any = {
    todos: true,
    limite: 50,
  };
  const { pagina = 1, limite = 20, todos = false } = params;
  const skip = (pagina - 1) * limite;

  const where = todos ? {} : { activo: true };

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      skip,
      take: limite,
      orderBy: { creadoEn: 'desc' },
      include: {
        categoria: { select: { id: true, nombre: true, slug: true } },
        marca: { select: { id: true, nombre: true } },
        imagenes: { where: { principal: true }, take: 1 },
        variantes: {
          where: { activo: true },
        },
      },
    }),
    prisma.producto.count({ where }),
  ]);

  console.log('✅ Total productos:', total);
  console.log('✅ Productos:', productos);
  console.log('✅ Productos (JSON):', JSON.stringify(productos, null, 2));
}

main()
  .catch(e => console.error('❌ Error:', e))
  .finally(async () => prisma.$disconnect());
