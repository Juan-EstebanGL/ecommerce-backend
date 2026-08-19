const AppError = require("../utils/AppError");

const getZodErrorMessage = (error) => {
  const firstIssue = error.issues[0];
  return firstIssue ? firstIssue.message : "Los datos enviados no son válidos";
};

const validate = (schema, data) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new AppError(getZodErrorMessage(result.error), 400);
  }

  return result.data;
};

module.exports = { getZodErrorMessage, validate };