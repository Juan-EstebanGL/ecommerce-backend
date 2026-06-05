const assertSafeTestDatabase = () => {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Los tests solo pueden ejecutarse con NODE_ENV=test");
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL es requerida para ejecutar tests");
  }

  let databaseName = "";

  try {
    databaseName = new URL(databaseUrl).pathname.replace(/^\//, "");
  } catch (error) {
    throw new Error("DATABASE_URL no tiene un formato valido");
  }

  const normalizedDatabaseName = databaseName.toLowerCase();

  if (
    !normalizedDatabaseName.endsWith("_test") &&
    !normalizedDatabaseName.endsWith("_test_db")
  ) {
    throw new Error(
      "Los tests solo pueden ejecutarse contra una DATABASE_URL de test"
    );
  }
};

module.exports = {
  assertSafeTestDatabase,
};
