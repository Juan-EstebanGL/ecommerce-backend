const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const env = require("../config/env");

const prisma = new PrismaClient({
  adapter: new PrismaPg(env.DATABASE_URL),
});

module.exports = prisma;
