const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        coverProfile: {
            type: String,
            required: true,
        },

        images: {
            type: [String], // multiple images
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        categories: {
            type: String,
            required: true,
        },

        brand: {
            type: String,
            required: true,
        },

        stock: {
            type: Number,
            required: true,
            min: 0,
        },

        featured: {
            type: Boolean,
            default: false,
        },

        // Variant-based pricing
        prices: [
            {
                weight: { type: String, required: true }, // e.g., "250mg", "500mg"
                price: { type: Number, required: true }, // e.g., 20, 40
            },
        ],

        // Ratings by all customers (aggregate)
        averageRating: {
            type: Number,
            default: 0, // will be calculated from ratings array
        },

        // Ratings per user with comments
        ratings: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
                rating: { type: Number, required: true, min: 1, max: 5 },
                comment: { type: String },
                createdAt: { type: Date, default: Date.now },
            },
        ],

        // Reviews (separate section if you want reviews apart from ratings)
        reviews: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
                review: { type: String, required: true },
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

const ProductModel = mongoose.model("Product", ProductSchema);
module.exports = ProductModel;
