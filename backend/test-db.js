const { PrismaClient } = require('@prisma/client');

console.log('Prueba de conexión a la base de datos...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Conexión exitosa!');
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    process.exit(1);
  }
}

testConnection();
