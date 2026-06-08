import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const correo = 'admin@llevalope.pe';
  const contrasena = 'Admin123!';

  // Hash de la contraseña
  const hash = await bcrypt.hash(contrasena, 10);

  const usuario = await prisma.usuario.upsert({
    where: { correo },
    create: {
      nombre: 'Admin',
      apellido: 'Administrador',
      correo,
      contrasena: hash,
      rol: 'ADMIN',
      verificado: true,
      activo: true,
    },
    update: {
      contrasena: hash,
      rol: 'ADMIN',
      verificado: true,
      activo: true,
    },
  });

  console.log('✅ Usuario admin listo (creado/actualizado)!');
  console.log('📧 Correo:', correo);
  console.log('🔐 Contraseña:', contrasena);
  console.log('👤 Rol:', usuario.rol);
}

main()
  .catch((e) => {
    console.error('❌ Error al crear el usuario:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
