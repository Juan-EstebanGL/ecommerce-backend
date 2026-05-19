const prisma = require("../lib/prisma");

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

    if (existingProduct.userId !== req.userId) {
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

    if (existingProduct.userId !== req.userId) {
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
  deleteProduct,
};