const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.test") });

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { assertSafeTestDatabase } = require("./testSafety");

const userCredentials = {
  email: "product-user@example.com",
  password: "password123",
};

const adminCredentials = {
  email: "product-admin@example.com",
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

const registerUser = async (email, password) => {
  return request(app)
    .post("/auth/register")
    .send({ email, password });
};

const loginUser = async (email, password) => {
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

describe("Products integration tests", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  test("GET /products debe funcionar sin autenticación y devolver lista de productos", async () => {
    const adminToken = await createAdminUser(
      adminCredentials.email,
      adminCredentials.password
    );

    const newProduct = {
      name: "Mouse gamer",
      price: 49.99,
      stock: 10,
    };

    await createProduct(adminToken, newProduct).expect(201);

    const response = await request(app).get("/products").expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toMatchObject({
      name: newProduct.name,
      price: newProduct.price,
      stock: newProduct.stock,
    });
  });

  test("GET /products/:id debe devolver un producto existente sin autenticacion", async () => {
    const adminToken = await createAdminUser(
      adminCredentials.email,
      adminCredentials.password
    );

    const productResponse = await createProduct(adminToken, {
      name: "Monitor 27",
      price: 249.99,
      stock: 8,
    }).expect(201);

    const productId = productResponse.body.id;

    const response = await request(app)
      .get(`/products/${productId}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: productId,
      name: "Monitor 27",
      price: 249.99,
      stock: 8,
      userId: expect.any(Number),
    });
  });

  test("GET /products/:id debe devolver 404 si el producto no existe", async () => {
    const response = await request(app).get("/products/99999").expect(404);

    expect(response.body).toEqual({
      message: "Producto no encontrado",
    });
  });

  test("GET /products/:id debe devolver 400 con id invalido", async () => {
    const response = await request(app).get("/products/abc").expect(400);

    expect(response.body).toEqual({
      message: "id debe ser un entero positivo",
    });
  });

  test("POST /products USER autenticado debe recibir 403", async () => {
    await registerUser(userCredentials.email, userCredentials.password);
    const token = await loginUser(userCredentials.email, userCredentials.password);

    const response = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Teclado", price: 79.99, stock: 5 })
      .expect(403);

    expect(response.body).toEqual({
      message: "Acceso denegado",
    });
  });

  test("POST /products ADMIN autenticado debe poder crear un producto", async () => {
    const adminToken = await createAdminUser(
      adminCredentials.email,
      adminCredentials.password
    );

    const newProduct = {
      name: "Teclado mecanico",
      price: 89.99,
      stock: 15,
    };

    const response = await createProduct(adminToken, newProduct).expect(201);

    expect(response.body).toMatchObject({
      name: newProduct.name,
      price: newProduct.price,
      stock: newProduct.stock,
      userId: expect.any(Number),
      id: expect.any(Number),
    });
  });

  test("PUT /products/:id USER debe recibir 403", async () => {
    const adminToken = await createAdminUser(
      adminCredentials.email,
      adminCredentials.password
    );

    const productResponse = await createProduct(adminToken, {
      name: "Auriculares",
      price: 59.99,
      stock: 12,
    }).expect(201);

    const productId = productResponse.body.id;

    await registerUser(userCredentials.email, userCredentials.password);
    const userToken = await loginUser(userCredentials.email, userCredentials.password);

    const response = await request(app)
      .put(`/products/${productId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Auriculares Pro", price: 69.99, stock: 8 })
      .expect(403);

    expect(response.body).toEqual({
      message: "Acceso denegado",
    });
  });

  test("PUT /products/:id ADMIN debe poder actualizar un producto", async () => {
    const adminToken = await createAdminUser(
      adminCredentials.email,
      adminCredentials.password
    );

    const productResponse = await createProduct(adminToken, {
      name: "Teclado retro",
      price: 39.99,
      stock: 20,
    }).expect(201);

    const productId = productResponse.body.id;

    const response = await request(app)
      .put(`/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Teclado retro pro", price: 44.99, stock: 18 })
      .expect(200);

    expect(response.body).toMatchObject({
      id: productId,
      name: "Teclado retro pro",
      price: 44.99,
      stock: 18,
    });
  });

  test("PATCH /products/:id ADMIN debe poder actualizar parcialmente", async () => {
    const adminToken = await createAdminUser(
      adminCredentials.email,
      adminCredentials.password
    );

    const productResponse = await createProduct(adminToken, {
      name: "Pantalla",
      price: 199.99,
      stock: 6,
    }).expect(201);

    const productId = productResponse.body.id;

    const response = await request(app)
      .patch(`/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ stock: 10 })
      .expect(200);

    expect(response.body).toMatchObject({
      id: productId,
      name: "Pantalla",
      price: 199.99,
      stock: 10,
    });
  });

  test("DELETE /products/:id USER debe recibir 403", async () => {
    const adminToken = await createAdminUser(
      adminCredentials.email,
      adminCredentials.password
    );

    const productResponse = await createProduct(adminToken, {
      name: "Cámara",
      price: 129.99,
      stock: 4,
    }).expect(201);

    const productId = productResponse.body.id;

    await registerUser(userCredentials.email, userCredentials.password);
    const userToken = await loginUser(userCredentials.email, userCredentials.password);

    const response = await request(app)
      .delete(`/products/${productId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(403);

    expect(response.body).toEqual({
      message: "Acceso denegado",
    });
  });

  test("DELETE /products/:id ADMIN debe poder eliminar un producto", async () => {
    const adminToken = await createAdminUser(
      adminCredentials.email,
      adminCredentials.password
    );

    const productResponse = await createProduct(adminToken, {
      name: "Webcam",
      price: 79.99,
      stock: 7,
    }).expect(201);

    const productId = productResponse.body.id;

    const response = await request(app)
      .delete(`/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toEqual({
      message: "Producto eliminado",
    });
  });
});
