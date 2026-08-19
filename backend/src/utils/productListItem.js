const productListItemSelect = {
  id: true,
  name: true,
  price: true,
  stock: true,
  imageUrl: true,
};

const formatProductListItem = (item) => {
  if (!item) {
    return item;
  }

  return {
    ...item,
    product: item.product
      ? {
          ...item.product,
          price: Number(item.product.price),
        }
      : item.product,
  };
};

module.exports = { productListItemSelect, formatProductListItem };