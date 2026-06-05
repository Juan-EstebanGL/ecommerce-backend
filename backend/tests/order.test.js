const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.test") });

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { assertSafeTestDatabase } = require("./testSafety");

const userCredentials = {
  email: "order-user@example.com",
  password: "password123",
};

const adminCredentials = {
  email: "order-admin@example.com",
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

const addProductToCart = (token, productId, quantity) => {
  return request(app)
    .post("/cart/add")
    .set("Authorization", `Bearer ${token}`)
    .send({ productId, quantity });
};

describe("Orders integration tests", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  test("Crear orden correctamente desde carrito autenticado", async () => {
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
      name: "Teclado mecánico",
      price: 99.99,
      stock: 10,
    }).expect(201);

    const productId = productResponse.body.id;

    await addProductToCart(userToken, productId, 2).expect(201);

    const response = await request(app)
      .post("/orders/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(201);

    expect(response.body).toHaveProperty("message", "Orden creada correctamente");
    expect(response.body.order).toMatchObject({
      id: expect.any(Number),
      total: 199.98,
      status: "PENDING",
      userId: expect.any(Number),
      items: expect.any(Array),
    });
  });

  test("Usuario sin token recibe 401", async () => {
    const response = await request(app)
      .post("/orders/checkout")
      .expect(401);

    expect(response.body).toEqual({
      message: "Token requerido",
    });
  });

  test("No crear orden con carrito vacío", async () => {
    await registerUser(userCredentials.email, userCredentials.password);
    const userToken = await loginUser(
      userCredentials.email,
      userCredentials.password
    );

    const response = await request(app)
      .post("/orders/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(400);

    expect(response.body).toEqual({
      message: "El carrito esta vacio",
    });
  });

  test("Validar que los items de la orden se guarden correctamente", async () => {
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
      name: "Mouse gamer",
      price: 49.99,
      stock: 5,
    }).expect(201);

    const productId = productResponse.body.id;

    await addProductToCart(userToken, productId, 2).expect(201);

    const response = await request(app)
      .post("/orders/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(201);

    expect(response.body.order.items).toHaveLength(1);
    expect(response.body.order.items[0]).toMatchObject({
      productId,
      productName: "Mouse gamer",
      productPrice: 49.99,
      quantity: 2,
    });
  });

  test("Validar descuento de stock", async () => {
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
      price: 199.99,
      stock: 4,
    }).expect(201);

    const productId = productResponse.body.id;

    await addProductToCart(userToken, productId, 3).expect(201);

    await request(app)
      .post("/orders/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(201);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    expect(product.stock).toBe(1);
  });

  test("Validar limpieza del carrito después de crear orden", async () => {
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
      price: 79.99,
      stock: 5,
    }).expect(201);

    const productId = productResponse.body.id;

    await addProductToCart(userToken, productId, 2).expect(201);

    await request(app)
      .post("/orders/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(201);

    const decodedUser = jwt.verify(userToken, process.env.JWT_SECRET);
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: decodedUser.userId },
    });

    expect(cartItems).toHaveLength(0);
  });

  test("Obtener órdenes del usuario autenticado", async () => {
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
      price: 129.99,
      stock: 3,
    }).expect(201);

    const productId = productResponse.body.id;

    await addProductToCart(userToken, productId, 1).expect(201);

    await request(app)
      .post("/orders/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(201);

    const response = await request(app)
      .get("/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.orders).toHaveLength(1);
    expect(response.body.orders[0]).toMatchObject({
      total: 129.99,
      status: "PENDING",
    });
    expect(response.body.orders[0].items).toHaveLength(1);
  });

  test("Usuario dueÃ±o puede cancelar orden pendiente y restaurar stock", async () => {
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
      name: "Tablet",
      price: 299.99,
      stock: 5,
    }).expect(201);

    const productId = productResponse.body.id;

    await addProductToCart(userToken, productId, 2).expect(201);

    const orderResponse = await request(app)
      .post("/orders/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(201);

    const orderId = orderResponse.body.order.id;

    const response = await request(app)
      .patch(`/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(response.body).toHaveProperty(
      "message",
      "Orden cancelada correctamente"
    );
    expect(response.body.order).toMatchObject({
      id: orderId,
      status: "CANCELLED",
    });

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    expect(product.stock).toBe(5);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    expect(order).not.toBeNull();
    expect(order.status).toBe("CANCELLED");
  });

  test("Admin puede cancelar orden pendiente de otro usuario", async () => {
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
      name: "Impresora",
      price: 189.99,
      stock: 4,
    }).expect(201);

    const productId = productResponse.body.id;

    await addProductToCart(userToken, productId, 1).expect(201);

    const orderResponse = await request(app)
      .post("/orders/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(201);

    const orderId = orderResponse.body.order.id;

    const response = await request(app)
      .patch(`/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.order).toMatchObject({
      id: orderId,
      status: "CANCELLED",
    });

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    expect(product.stock).toBe(4);
  });

  test("Usuario que no es dueÃ±o no puede cancelar una orden", async () => {
    await registerUser(userCredentials.email, userCredentials.password);
    const ownerToken = await loginUser(
      userCredentials.email,
      userCredentials.password
    );

    await registerUser("other-order-user@example.com", "password123");
    const otherUserToken = await loginUser(
      "other-order-user@example.com",
      "password123"
    );

    const adminToken = await createAdminUser(
      adminCredentials.email,
      adminCredentials.password
    );

    const productResponse = await createProduct(adminToken, {
      name: "Router",
      price: 99.99,
      stock: 3,
    }).expect(201);

    const productId = productResponse.body.id;

    await addProductToCart(ownerToken, productId, 1).expect(201);

    const orderResponse = await request(app)
      .post("/orders/checkout")
      .set("Authorization", `Bearer ${ownerToken}`)
      .expect(201);

    const orderId = orderResponse.body.order.id;

    const response = await request(app)
      .patch(`/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${otherUserToken}`)
      .expect(403);

    expect(response.body).toEqual({
      message: "No autorizado",
    });

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    expect(product.stock).toBe(2);
  });

  test("No permite cancelar una orden que no esta pendiente", async () => {
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
      name: "Disco externo",
      price: 89.99,
      stock: 6,
    }).expect(201);

    const productId = productResponse.body.id;

    await addProductToCart(userToken, productId, 2).expect(201);

    const orderResponse = await request(app)
      .post("/orders/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(201);

    const orderId = orderResponse.body.order.id;

    await request(app)
      .patch(`/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "PAID" })
      .expect(200);

    const response = await request(app)
      .patch(`/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(400);

    expect(response.body).toEqual({
      message: "Solo se pueden cancelar ordenes pendientes",
    });

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    expect(product.stock).toBe(4);
  });

  test("Admin puede avanzar una orden por estados de fulfillment", async () => {
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
      name: "Laptop",
      price: 899.99,
      stock: 3,
    }).expect(201);

    await addProductToCart(userToken, productResponse.body.id, 1).expect(201);

    const orderResponse = await request(app)
      .post("/orders/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(201);

    const orderId = orderResponse.body.order.id;

    await request(app)
      .patch(`/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "PAID" })
      .expect(200);

    await request(app)
      .patch(`/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "PROCESSING" })
      .expect(200);

    await request(app)
      .patch(`/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "SHIPPED" })
      .expect(200);

    const response = await request(app)
      .patch(`/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "DELIVERED" })
      .expect(200);

    expect(response.body.order).toMatchObject({
      id: orderId,
      status: "DELIVERED",
    });
  });

  test("No permite transicion invalida de estado", async () => {
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
      name: "Parlante",
      price: 59.99,
      stock: 5,
    }).expect(201);

    await addProductToCart(userToken, productResponse.body.id, 1).expect(201);

    const orderResponse = await request(app)
      .post("/orders/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(201);

    const orderId = orderResponse.body.order.id;

    const response = await request(app)
      .patch(`/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "SHIPPED" })
      .expect(400);

    expect(response.body).toEqual({
      message: "Transicion de estado invalida",
    });
  });

  test("Usuario no admin no puede actualizar estado de orden", async () => {
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
      name: "Microfono",
      price: 49.99,
      stock: 4,
    }).expect(201);

    await addProductToCart(userToken, productResponse.body.id, 1).expect(201);

    const orderResponse = await request(app)
      .post("/orders/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(201);

    const orderId = orderResponse.body.order.id;

    const response = await request(app)
      .patch(`/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ status: "PAID" })
      .expect(403);

    expect(response.body).toEqual({
      message: "Acceso denegado",
    });
  });
});
