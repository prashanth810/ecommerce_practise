const CartModel = require("../models/CartModel");
const ProductModel = require("../models/ProductModel");

const Addtocart = async (req, res) => {
    const { productId, weight, quantity } = req.body;
    const userId = req.user._id;

    try {
        // Check product exists
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found!" });
        }

        // Validate variant
        const variant = product.prices.find((p) => p.weight === weight);
        if (!variant) {
            return res.status(400).json({ success: false, message: "Invalid weight selected!" });
        }

        // Find or create cart
        let cart = await CartModel.findOne({ user: userId });

        if (!cart) {
            cart = new CartModel({
                user: userId,
                items: [{ product: productId, weight, quantity: Number(quantity), price: variant.price }],
            });
        } else {
            // Check if product with same weight already exists
            const existingItem = cart.items.find(
                (item) => item.product.toString() === productId && item.weight === weight
            );

            if (existingItem) {
                existingItem.quantity += Number(quantity);
            } else {
                cart.items.push({ product: productId, weight, quantity: Number(quantity), price: variant.price });
            }
        }

        const newCart = await cart.save();
        res.status(200).json({ success: true, cart: newCart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const removeFromCart = async (req, res) => {
    const { productId, weight } = req.body;
    const userId = req.user._id;

    try {
        let cart = await CartModel.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found!" });
        }

        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId && item.weight === weight
        );

        if (!existingItem) {
            return res.status(404).json({ success: false, message: "Item not found in cart!" });
        }

        if (existingItem.quantity > 1) {
            existingItem.quantity -= 1;
        } else {
            cart.items = cart.items.filter(
                (item) => !(item.product.toString() === productId && item.weight === weight)
            );
        }

        const updatedCart = await cart.save();

        res.status(200).json({
            success: true,
            message: "Item removed successfully",
            cart: updatedCart,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getcartlist = async (req, res) => {
    const userId = req.user._id;
    try {
        const cart = await CartModel.findOne({ user: userId });
        res.status(200).json({ success: true, cart: cart });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


module.exports = { Addtocart, removeFromCart, getcartlist };
