const { z } = require("zod");

const positiveInteger = (message) => {
  return z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") {
        return NaN;
      }

      return Number(value);
    },
    z.number({ error: message }).int(message).positive(message)
  );
};

module.exports = { positiveInteger };