import { PrismaClient, TipoCupon } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando cupones de prueba...');

  // Cupones de prueba
  const cupones = [
    {
      codigo: 'BIENVENIDO10',
      descripcion: 'Descuento del 10% por tu primera compra',
      tipo: TipoCupon.PORCENTAJE,
      valor: 10,
      minCompra: 50,
      maxUsos: 100,
      maxUsosPorUsuario: 1,
      activo: true,
      fechaInicio: new Date(),
    },
    {
      codigo: 'DESC20SUP',
      descripcion: '20% de descuento en compras mayores a S/200',
      tipo: TipoCupon.PORCENTAJE,
      valor: 20,
      minCompra: 200,
      maxUsos: 50,
      maxUsosPorUsuario: 2,
      activo: true,
      fechaInicio: new Date(),
    },
    {
      codigo: 'MONTO50',
      descripcion: 'S/50 de descuento en cualquier compra',
      tipo: TipoCupon.MONTO_FIJO,
      valor: 50,
      minCompra: 100,
      maxUsos: 200,
      maxUsosPorUsuario: 1,
      activo: true,
      fechaInicio: new Date(),
    },
    {
      codigo: 'OFFERTA30',
      descripcion: '30% de descuento especial de oferta',
      tipo: TipoCupon.PORCENTAJE,
      valor: 30,
      minCompra: 150,
      maxUsos: 30,
      maxUsosPorUsuario: 1,
      activo: true,
      fechaInicio: new Date(),
    },
    {
      codigo: 'BLACKFRIDAY',
      descripcion: 'Descuento especial de Black Friday 25%',
      tipo: TipoCupon.PORCENTAJE,
      valor: 25,
      minCompra: 0,
      maxUsos: 500,
      maxUsosPorUsuario: 3,
      activo: true,
      fechaInicio: new Date(),
    },
    {
      codigo: 'ENVIOGRATIS',
      descripcion: 'S/30 de descuento para cubrir el costo de envío',
      tipo: TipoCupon.MONTO_FIJO,
      valor: 30,
      minCompra: 0,
      maxUsos: 150,
      maxUsosPorUsuario: 5,
      activo: true,
      fechaInicio: new Date(),
    },
  ];

  for (const cuponData of cupones) {
    const existing = await prisma.cupon.findUnique({
      where: { codigo: cuponData.codigo },
    });

    if (!existing) {
      const cupon = await prisma.cupon.create({
        data: cuponData,
      });
      console.log(`✅ Cupón creado: ${cupon.codigo} - ${cupon.descripcion}`);
    } else {
      console.log(`ℹ️  Cupón ya existe: ${cuponData.codigo}`);
    }
  }

  console.log('🎉 Seed de cupones completado!');
  console.log('\nCupones disponibles para usar:');
  cupones.forEach(c => {
    console.log(`- ${c.codigo} (${c.tipo}: ${c.valor}) - ${c.descripcion}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
