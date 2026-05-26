const productService = require("../services/product.service");
const {
  createProductSchema,
  updateProductSchema,
  patchProductSchema,
  productParamsSchema,
} = require("../validations/product.validation");
const {
  getZodErrorMessage,
} = require("../validations/validation.helper");

const handleError = (res, error, fallbackMessage) => {
  console.log(error);

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: fallbackMessage,
  });
};

const createProduct = async (req, res) => {
  try {
    const validation = createProductSchema.safeParse({
      body: req.body || {},
    });

    if (!validation.success) {
      return res.status(400).json({
        message: getZodErrorMessage(validation.error),
      });
    }

    const product = await productService.createProduct(
      req.userId,
      validation.data.body
    );

    return res.status(201).json(product);
  } catch (error) {
    return handleError(res, error, "Error creando producto");
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await productService.getProducts();

    return res.json(products);
  } catch (error) {
    return handleError(res, error, "Error obteniendo productos");
  }
};

const updateProduct = async (req, res) => {
  try {
    const validation = updateProductSchema.safeParse({
      params: req.params,
      body: req.body || {},
    });

    if (!validation.success) {
      return res.status(400).json({
        message: getZodErrorMessage(validation.error),
      });
    }

    const product = await productService.updateProduct(
      req.userId,
      req.userRole,
      validation.data.params.id,
      validation.data.body
    );

    return res.json(product);
  } catch (error) {
    return handleError(res, error, "Error actualizando producto");
  }
};

const patchProduct = async (req, res) => {
  try {
    const validation = patchProductSchema.safeParse({
      params: req.params,
      body: req.body || {},
    });

    if (!validation.success) {
      return res.status(400).json({
        message: getZodErrorMessage(validation.error),
      });
    }

    const product = await productService.patchProduct(
      req.userId,
      req.userRole,
      validation.data.params.id,
      validation.data.body
    );

    return res.json(product);
  } catch (error) {
    return handleError(res, error, "Error actualizando producto");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const validation = productParamsSchema.safeParse({
      params: req.params,
    });

    if (!validation.success) {
      return res.status(400).json({
        message: getZodErrorMessage(validation.error),
      });
    }

    const result = await productService.deleteProduct(
      req.userId,
      req.userRole,
      validation.data.params.id
    );

    return res.json(result);
  } catch (error) {
    return handleError(res, error, "Error eliminando producto");
  }
};

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  patchProduct,
  deleteProduct,
};
