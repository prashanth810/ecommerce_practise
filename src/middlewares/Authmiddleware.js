const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModels");

const Authmiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided !" });
        }

        const decode = jwt.verify(token, process.env.JWT_SECREAT);

        const user = await UserModel.findById(decode.id).select("-password");
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found !" })
        }

        req.user = user;
        next();
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Invalid or expired token !" });
    }
}


module.exports = Authmiddleware