const prisma = require("../lib/prisma");

const hasNumericValue = (value) => {
  return value !== null && value !== "" && String(value).trim() !== "";
};

const parsePositiveInteger = (value) => {
  if (!hasNumericValue(value)) {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
};

const parsePositiveNumber = (value) => {
  if (!hasNumericValue(value)) {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
};

const parseNonNegativeInteger = (value) => {
  if (!hasNumericValue(value)) {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
};

const createProduct = async (req, res) => {
  try {
    const { name, price, stock } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        price,
        stock,
        userId: req.userId,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error creando producto",
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    res.json(products);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error obteniendo productos",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    if (req.userRole !== "ADMIN" && existingProduct.userId !== req.userId) {
      return res.status(403).json({
        message: "No autorizado",
      });
    }

    const { name, price, stock } = req.body;

    const product = await prisma.product.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        price,
        stock,
      },
    });

    res.json(product);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error actualizando producto",
    });
  }
};

const patchProduct = async (req, res) => {
  try {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "id debe ser un entero positivo",
      });
    }

    const data = {};

    if (Object.prototype.hasOwnProperty.call(req.body, "name")) {
      if (
        typeof req.body.name !== "string" ||
        req.body.name.trim().length === 0
      ) {
        return res.status(400).json({
          message: "name no puede estar vacio",
        });
      }

      data.name = req.body.name.trim();
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "price")) {
      const price = parsePositiveNumber(req.body.price);

      if (!price) {
        return res.status(400).json({
          message: "price debe ser mayor a 0",
        });
      }

      data.price = price;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "stock")) {
      const stock = parseNonNegativeInteger(req.body.stock);

      if (stock === null) {
        return res.status(400).json({
          message: "stock debe ser un entero mayor o igual a 0",
        });
      }

      data.stock = stock;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        message: "Debe enviar al menos un campo para actualizar",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    if (req.userRole !== "ADMIN" && existingProduct.userId !== req.userId) {
      return res.status(403).json({
        message: "No autorizado",
      });
    }

    const product = await prisma.product.update({
      where: {
        id,
      },
      data,
    });

    return res.json(product);
  } catch (error) {
    console.log(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    return res.status(500).json({
      message: "Error actualizando producto",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    if (req.userRole !== "ADMIN" && existingProduct.userId !== req.userId) {
      return res.status(403).json({
        message: "Usuario no autorizado",
      });
    }

    await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({
      message: "Producto eliminado",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error eliminando producto",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  patchProduct,
  deleteProduct,
};
