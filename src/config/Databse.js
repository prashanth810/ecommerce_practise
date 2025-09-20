const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const mongo_url = process.env.MONGO_URL;

const ConnectionDB = async () => {
    try {
        await mongoose.connect(mongo_url);
        console.log("database connected successfully !!!");
    }
    catch (error) {
        console.log(error.message);
    }
}

module.exports = ConnectionDB;