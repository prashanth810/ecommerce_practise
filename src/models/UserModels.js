const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    profile: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: {
            values: ["admin", "user", "seller"],
            message: "{VALUE} is not valid !",
        },
        default: "user",
    },
    address: {
        type: String,
    },
    phoneNumber: {
        type: Number,
    },
    cartData: {
        type: Object,
        default: {},
    }
}, { timestamps: true, minimize: false });

const UserModel = mongoose.model("user", UserSchema);
module.exports = UserModel;