const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                weight: { type: String },
                quantity: {
                    type: Number,
                    min: 1,
                    default: 1,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
            },
        ],
        totalAmount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true, minimize: false }
);

// 🔹 Auto-calculate total before saving
CartSchema.pre("save", function (next) {
    this.totalAmount = this.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );
    next();
});

const CartModel = mongoose.model("Cart", CartSchema);
module.exports = CartModel;
