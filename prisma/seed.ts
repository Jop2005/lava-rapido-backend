import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tipos = [
    'Camisa',
    'Pantalón',
    'Chaqueta',
    'Vestido',
    'Falda',
    'Blusa',
    'Jeans',
    'Camiseta',
    'Saco',
    'Corbata',
  ];

  for (const tipo of tipos) {
    await prisma.tipoDePrenda.upsert({
      where: { tipo },
      update: {},
      create: { tipo },
    });
  }

}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });