const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.test") });

const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const {
  clearDatabase,
  registerUser,
  loginUser,
  createAdminUser,
  createProduct,
} = require("./helpers");

const userCredentials = {
  email: "cart-user@example.com",
  password: "password123",
};

const adminCredentials = {
  email: "cart-admin@example.com",
  password: "password123",
};

describe("Cart integration tests", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  test("POST /cart/add usuario autenticado puede agregar producto", async () => {
    await registerUser(userCredentials.email, userCredentials.password);
    const userToken = await loginUser(
      userCredentials.email,
      userCredentials.password
    );

    const adminToken = await createAdminUser(
      adminCredentials.email,
      adminCredentials.password
    );

    const productResponse = await createProduct(adminToken, {
      name: "Mouse",
      price: 29.99,
      stock: 10,
    }).expect(201);

    const productId = productResponse.body.id;

    const response = await request(app)
      .post("/cart/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 2 })
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(Number),
      quantity: 2,
      userId: expect.any(Number),
      productId,
      product: {
        id: productId,
        name: "Mouse",
        price: 29.99,
        stock: 10,
      },
    });
  });

  test("POST /cart/add usuario no autenticado recibe 401", async () => {
    const response = await request(app)
      .post("/cart/add")
      .send({ productId: 1, quantity: 1 })
      .expect(401);

    expect(response.body).toEqual({
      message: "Token requerido",
    });
  });

  test("POST /cart/add validación Zod falla si quantity es inválido", async () => {
    await registerUser(userCredentials.email, userCredentials.password);
    const userToken = await loginUser(
      userCredentials.email,
      userCredentials.password
    );

    const response = await request(app)
      .post("/cart/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId: 1, quantity: 0 })
      .expect(400);

    expect(response.body).toHaveProperty("message");
  });

  test("POST /cart/add no permite agregar más cantidad que el stock disponible", async () => {
    await registerUser(userCredentials.email, userCredentials.password);
    const userToken = await loginUser(
      userCredentials.email,
      userCredentials.password
    );

    const adminToken = await createAdminUser(
      adminCredentials.email,
      adminCredentials.password
    );

    const productResponse = await createProduct(adminToken, {
      name: "Teclado",
      price: 79.99,
      stock: 3,
    }).expect(201);

    const productId = productResponse.body.id;

    const response = await request(app)
      .post("/cart/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 5 })
      .expect(400);

    expect(response.body).toEqual({
      message: "Stock insuficiente",
    });
  });

  test("PATCH /cart/:id usuario puede actualizar cantidad", async () => {
    await registerUser(userCredentials.email, userCredentials.password);
    const userToken = await loginUser(
      userCredentials.email,
      userCredentials.password
    );

    const adminToken = await createAdminUser(
      adminCredentials.email,
      adminCredentials.password
    );

    const productResponse = await createProduct(adminToken, {
      name: "Monitor",
      price: 249.99,
      stock: 20,
    }).expect(201);

    const productId = productResponse.body.id;

    const cartResponse = await request(app)
      .post("/cart/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 2 })
      .expect(201);

    const cartItemId = cartResponse.body.id;

    const response = await request(app)
      .patch(`/cart/${cartItemId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 5 })
      .expect(200);

    expect(response.body).toMatchObject({
      id: cartItemId,
      quantity: 5,
      productId,
    });
  });

  test("PATCH /cart/:id falla si cantidad inválida", async () => {
    await registerUser(userCredentials.email, userCredentials.password);
    const userToken = await loginUser(
      userCredentials.email,
      userCredentials.password
    );

    const adminToken = await createAdminUser(
      adminCredentials.email,
      adminCredentials.password
    );

    const productResponse = await createProduct(adminToken, {
      name: "Webcam",
      price: 89.99,
      stock: 10,
    }).expect(201);

    const productId = productResponse.body.id;

    const cartResponse = await request(app)
      .post("/cart/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 2 })
      .expect(201);

    const cartItemId = cartResponse.body.id;

    const response = await request(app)
      .patch(`/cart/${cartItemId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 0 })
      .expect(400);

    expect(response.body).toHaveProperty("message");
  });

  test("DELETE /cart/:id usuario puede eliminar item", async () => {
    await registerUser(userCredentials.email, userCredentials.password);
    const userToken = await loginUser(
      userCredentials.email,
      userCredentials.password
    );

    const adminToken = await createAdminUser(
      adminCredentials.email,
      adminCredentials.password
    );

    const productResponse = await createProduct(adminToken, {
      name: "Auriculares",
      price: 59.99,
      stock: 8,
    }).expect(201);

    const productId = productResponse.body.id;

    const cartResponse = await request(app)
      .post("/cart/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 1 })
      .expect(201);

    const cartItemId = cartResponse.body.id;

    const response = await request(app)
      .delete(`/cart/${cartItemId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(response.body).toEqual({
      message: "Item eliminado del carrito",
    });
  });

  test("PATCH /cart/:id falla si cantidad excede stock disponible", async () => {
    await registerUser(userCredentials.email, userCredentials.password);
    const userToken = await loginUser(
      userCredentials.email,
      userCredentials.password
    );

    const adminToken = await createAdminUser(
      adminCredentials.email,
      adminCredentials.password
    );

    const productResponse = await createProduct(adminToken, {
      name: "SSD",
      price: 119.99,
      stock: 5,
    }).expect(201);

    const productId = productResponse.body.id;

    const cartResponse = await request(app)
      .post("/cart/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 2 })
      .expect(201);

    const cartItemId = cartResponse.body.id;

    const response = await request(app)
      .patch(`/cart/${cartItemId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 10 })
      .expect(400);

    expect(response.body).toEqual({
      message: "Stock insuficiente",
    });
  });
});
