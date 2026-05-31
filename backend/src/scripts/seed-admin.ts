import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const correo = 'admin@llevalope.pe';
  const contrasena = 'Admin123!';

  // Verificar si el usuario ya existe
  const existe = await prisma.usuario.findUnique({
    where: { correo },
  });

  if (existe) {
    console.log('✅ El usuario admin ya existe:', correo);
    return;
  }

  // Hash de la contraseña
  const hash = await bcrypt.hash(contrasena, 10);

  // Crear el usuario
  const usuario = await prisma.usuario.create({
    data: {
      nombre: 'Admin',
      apellido: 'Administrador',
      correo,
      contrasena: hash,
      rol: 'ADMIN',
      verificado: true,
      activo: true,
    },
  });

  console.log('✅ Usuario admin creado con éxito!');
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
