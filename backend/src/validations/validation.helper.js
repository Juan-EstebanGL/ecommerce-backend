const getZodErrorMessage = (error) => {
  const firstIssue = error.issues[0];

  return firstIssue ? firstIssue.message : "Datos invalidos";
};

module.exports = {
  getZodErrorMessage,
};
