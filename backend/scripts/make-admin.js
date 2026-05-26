const prisma = require("../src/lib/prisma");

const email = process.argv[2];

const main = async () => {
  if (!email) {
    console.error("Uso: node scripts/make-admin.js email@test.com");
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.update({
    where: {
      email,
    },
    data: {
      role: "ADMIN",
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  console.log("Usuario actualizado a ADMIN:", user);
};

main()
  .catch((error) => {
    if (error.code === "P2025") {
      console.error("Usuario no encontrado");
      process.exitCode = 1;
      return;
    }

    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
