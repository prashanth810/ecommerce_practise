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
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: {
            values: ["admin", "user"],
            message: "{VALUE} is not valid !",
        },
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