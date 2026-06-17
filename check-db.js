const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const profiles = await prisma.profile.findMany();
  console.log("USERS:", users.map(u => ({ id: u.id, name: u.name })));
  console.log("PROFILES:", profiles);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
