const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.test") });

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { assertSafeTestDatabase } = require("./testSafety");

const testUser = {
  email: "user@example.com",
  password: "password123",
};

const clearDatabase = async () => {
  assertSafeTestDatabase();

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
};

describe("Auth integration tests", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  test("POST /auth/register debe crear un usuario correctamente", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send(testUser)
      .expect(201);

    expect(response.body).toEqual({
      message: "Usuario creado correctamente",
    });

    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
    });

    expect(user).not.toBeNull();
    expect(user.email).toBe(testUser.email);
    expect(user.password).not.toBe(testUser.password);
  });

  test("POST /auth/register debe rechazar email duplicado", async () => {
    await request(app)
      .post("/auth/register")
      .send(testUser)
      .expect(201);

    const response = await request(app)
      .post("/auth/register")
      .send(testUser)
      .expect(400);

    expect(response.body).toEqual({
      message: "El usuario ya existe",
    });
  });

  test("POST /auth/login debe devolver un JWT válido", async () => {
    await request(app).post("/auth/register").send(testUser).expect(201);

    const response = await request(app)
      .post("/auth/login")
      .send(testUser)
      .expect(200);

    expect(response.body).toHaveProperty("token");
    const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);

    expect(decoded).toHaveProperty("userId");
    expect(decoded).toHaveProperty("role", "USER");
  });

  test("POST /auth/login debe fallar con password incorrecta", async () => {
    await request(app).post("/auth/register").send(testUser).expect(201);

    const response = await request(app)
      .post("/auth/login")
      .send({ email: testUser.email, password: "wrongpassword" })
      .expect(400);

    expect(response.body).toEqual({
      message: "Credenciales invalidas",
    });
  });
});
