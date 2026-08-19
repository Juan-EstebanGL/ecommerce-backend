const paginate = (page, limit, defaultLimit = 8) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || defaultLimit));
  const skip = (pageNum - 1) * limitNum;

  return { pageNum, limitNum, skip };
};

module.exports = { paginate };