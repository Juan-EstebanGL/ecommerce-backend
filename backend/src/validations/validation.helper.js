const getZodErrorMessage = (error) => {
  const firstIssue = error.issues[0];
  return firstIssue ? firstIssue.message : "Los datos enviados no son válidos";
};

module.exports = { getZodErrorMessage };
