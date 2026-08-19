const path = require("path");
const { execFileSync } = require("child_process");
const express = require("express");
const request = require("supertest");
const app = require("../src/app");
const { createLimiter } = require("../src/middleware/rateLimit.middleware");

describe("Seguridad: rate limiting", () => {
  const buildApp = () => {
    const limiterApp = express();
    limiterApp.use(
      "/limited",
      createLimiter({
        force: true,
        windowMs: 60 * 1000,
        max: 2,
        message: { message: "Demasiadas solicitudes. Intenta nuevamente más tarde" },
      })
    );
    limiterApp.get("/limited", (req, res) => res.json({ ok: true }));
    return limiterApp;
  };

  test("responde 429 al superar el límite de solicitudes", async () => {
    const limiterApp = buildApp();
    await request(limiterApp).get("/limited").expect(200);
    await request(limiterApp).get("/limited").expect(200);
    const blocked = await request(limiterApp).get("/limited").expect(429);
    expect(blocked.body.message).toBe(
      "Demasiadas solicitudes. Intenta nuevamente más tarde"
    );
  });

  test("envía headers estándar de rate limit", async () => {
    const limiterApp = buildApp();
    const res = await request(limiterApp).get("/limited").expect(200);
    expect(res.headers["ratelimit-limit"]).toBe("2");
  });
});

describe("Seguridad: Swagger fuera de desarrollo", () => {
  test("POST /api-docs NO está disponible (los tests corren con NODE_ENV=test)", async () => {
    await request(app).get("/api-docs/").expect(404);
  });
});

describe("Seguridad: JWT_SECRET en producción", () => {
  const runEnvCheck = (extraEnv) => {
    try {
      execFileSync(
        process.execPath,
        ["-e", "require('./src/config/env')"],
        {
          cwd: path.join(__dirname, ".."),
          env: { ...process.env, ...extraEnv },
          stdio: "pipe",
        }
      );
      return true;
    } catch {
      return false;
    }
  };

  test("rechaza arrancar en producción con JWT_SECRET corto", () => {
    expect(
      runEnvCheck({ NODE_ENV: "production", JWT_SECRET: "short-secret" })
    ).toBe(false);
  });

  test("rechaza arrancar en producción con JWT_SECRET por defecto", () => {
    expect(
      runEnvCheck({ NODE_ENV: "production", JWT_SECRET: "your-secret-key-here" })
    ).toBe(false);
  });

  test("permite arrancar en producción con JWT_SECRET de 32+ caracteres", () => {
    expect(
      runEnvCheck({ NODE_ENV: "production", JWT_SECRET: "x".repeat(48) })
    ).toBe(true);
  });
});