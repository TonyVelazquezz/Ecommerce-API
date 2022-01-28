exports.formatUserCart = ({ id, totalPrice, productsInCarts }) => {
	const formattedProducts = productsInCarts.map(
		({ productId, product, price, quantity }) => {
			const { name, description, category } = product;

			return { productId, name, description, price, quantity, category };
		}
	);

	return { id, totalPrice, products: formattedProducts };
};
