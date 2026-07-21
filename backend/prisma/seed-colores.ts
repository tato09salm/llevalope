import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const coloresData = [
  { nombre: 'Rojo', hex: '#FF0000' },
  { nombre: 'Azul', hex: '#0000FF' },
  { nombre: 'Verde', hex: '#008000' },
  { nombre: 'Amarillo', hex: '#FFFF00' },
  { nombre: 'Naranja', hex: '#FFA500' },
  { nombre: 'Morado', hex: '#800080' },
  { nombre: 'Rosa', hex: '#FFC0CB' },
  { nombre: 'Café', hex: '#8B4513' },
  { nombre: 'Gris', hex: '#808080' },
  { nombre: 'Turquesa', hex: '#40E0D0' },
  { nombre: 'Violeta', hex: '#EE82EE' },
  { nombre: 'Lima', hex: '#32CD32' },
  { nombre: 'Magenta', hex: '#FF00FF' },
  { nombre: 'Oro', hex: '#FFD700' },
  { nombre: 'Plata', hex: '#C0C0C0' },
];

async function main() {
  console.log('🌱 Iniciando seed de colores...');

  // Get existing colors
  const coloresExistentes = await prisma.color.findMany();
  const hexExistentes = new Set(coloresExistentes.map(c => c.hex));
  const nombresExistentes = new Set(coloresExistentes.map(c => c.nombre));

  let creados = 0;

  for (const color of coloresData) {
    // Skip if already exists
    if (hexExistentes.has(color.hex) || nombresExistentes.has(color.nombre)) {
      console.log(`ℹ️ Color "${color.nombre}" ya existe, saltando...`);
      continue;
    }

    await prisma.color.create({
      data: {
        nombre: color.nombre,
        hex: color.hex,
        activo: true,
      },
    });
    creados++;
    console.log(`✅ Color creado: ${color.nombre} (${color.hex})`);
  }

  console.log(`\n🎉 Seed completado! ${creados} colores nuevos creados.`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
