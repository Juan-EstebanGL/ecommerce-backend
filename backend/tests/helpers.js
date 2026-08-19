const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { assertSafeTestDatabase } = require("./testSafety");

const clearDatabase = async () => {
  assertSafeTestDatabase();

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
};

const registerUser = async (email, password) => {
  return request(app)
    .post("/auth/register")
    .send({
      firstName: "Test",
      lastName: "User",
      email,
      phone: "3001234567",
      password,
    });
};

const loginUser = async (email, password) => {
  await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
  });

  const response = await request(app)
    .post("/auth/login")
    .send({ email, password });

  return response.body.token;
};

const createAdminUser = async (email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  return jwt.sign(
    { userId: user.id, role: "ADMIN" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const createProduct = (token, productData) => {
  return request(app)
    .post("/products")
    .set("Authorization", `Bearer ${token}`)
    .send(productData);
};

const addProductToCart = (token, productId, quantity) => {
  return request(app)
    .post("/cart/add")
    .set("Authorization", `Bearer ${token}`)
    .send({ productId, quantity });
};

module.exports = {
  clearDatabase,
  registerUser,
  loginUser,
  createAdminUser,
  createProduct,
  addProductToCart,
};