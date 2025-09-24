const UserModel = require("../models/UserModels");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const ImageKit = require("imagekit");


const CreateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECREAT, { expiresIn: "1d" });
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

// imagekit setup
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// register 
const register = async (req, res) => {
    const { firstName, lastName, name, email, password, role } = req.body;
    try {
        const exist = await UserModel.findOne({ email });

        // alredy user or not 
        if (exist) {
            return res.status(400).json({ success: false, message: "User alredy existed !" });
        }

        // first name 
        if (firstName.length < 5) {
            return res.status(400).json({ success: false, message: "first name mu be more then 5 characters " })
        }

        //  last name 
        if (!lastName) {
            return res.status(400).json({ success: false, message: "last name is required !" })
        }


        // password 
        if (!password) {
            return res.status(400).json({ success: false, message: "password required !" });
        }

        // strong password 
        if (!validator.isStrongPassword(password)) {
            return res.status(400).json({ success: false, message: "enter strong password !" });
        }

        // valid email 
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Enter valid email !" });
        }

        // making salt & hashed password 
        const salt = await bcrypt.genSalt(10);
        const hashedpasssword = await bcrypt.hash(password, salt);

        // saving user data in db 
        const newuser = new UserModel({
            firstName, lastName, name, email, password: hashedpasssword, role
        });


        //  saved the user data 
        const user = await newuser.save();

        const { password: _, ...userWithoutPassword } = user.toObject();

        // creating token 
        const token = await CreateToken(user._id);

        // sending the user response data 
        return res.status(200).json({ success: true, message: "register success !", data: userWithoutPassword, token })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// login 
const loginuser = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const user = await UserModel.findOne({ email });

        // no user found 
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid creadintails !" });
        }

        // required password 
        if (!password) {
            return res.status(400).json({ success: false, message: "password required !" });
        }

        if (!role || user.role !== role) {
            return res.status(403).json({ success: false, message: "Invalid user role" });
        }


        const comparepassword = await bcrypt.compare(password, user.password);
        if (!comparepassword) {
            return res.status(400).json({ success: false, message: "Invalid email & password !" });
        }

        // remove password from response  
        const { password: _, ...userWithoutPassword } = user.toObject();

        const token = await CreateToken(user._id);
        res.cookie("token", token, { expires: new Date(Date.now() + 7 * 24 * 60 * 1000) });
        return res.status(200).json({ success: true, message: "login successfully !", data: userWithoutPassword, token });
    }
    catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

// get all users list admin only
const userlist = async (req, res) => {

    try {
        const users = await UserModel.find({});
        if (!users || users.length === 0) {
            return res.status(400).json({ success: false, message: "No data found !" });
        }

        const logidinsuer = req.user;
        if (!logidinsuer || logidinsuer.role !== "admin" && logidinsuer.role !== "seller") {
            return res.status(400).json({ success: false, message: "you dont have permision to visit !" });
        }

        return res.status(200).json({ success: true, count: users.length, data: users });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// logid in user profile 
const logeduser = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found !" });
        }
        return res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// delete user account admin only
const deleteuser = async (req, res) => {
    const { id } = req.params;
    try {

        if (!req.user) {
            return res.status(400).json({ success: false, message: "unauthorized user !" });
        }

        const admin = req.user.role === 'admin';
        const self = req.user._id.toString() === id;

        if (!admin && !self) {
            return res.status(403).json({ success: false, message: "Access denied ! only admin can delete !" })
        }

        const user = await UserModel.findByIdAndDelete(id);

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found !" });
        }

        return res.status(200).json({ success: true, message: "User deleted successfullly !" });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// get sinle user by id admin only
const singleuser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await UserModel.findById(id);

        const logidinsuer = req.user;
        if (!logidinsuer || logidinsuer.role !== "admin" && logidinsuer.role !== "seller") {
            return res.status(400).json({ success: false, message: "you dont have permision to visit !" });
        }

        // user or not in db 
        if (!user) {
            return res.status(400).json({ success: false, message: "User not existed !" });
        }
        // sending the user resposne data 
        return res.status(200).json({ success: true, data: user })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// update user profile
const updateusers = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, address } = req.body;

    try {
        let updatedata = {};
        if (firstName) updatedata.firstName = firstName;
        if (lastName) updatedata.lastName = lastName;
        if (address) updatedata.address = address;

        // ✅ Upload to ImageKit if file exists
        if (req.file) {
            const uploadResponse = await imagekit.upload({
                file: req.file.buffer,           // multer buffer
                fileName: req.file.originalname, // keep original filename
                folder: "user_profiles",         // optional folder in ImageKit
            });

            updatedata.profile = uploadResponse.url; // save only URL
        }

        const updateduser = await UserModel.findByIdAndUpdate(id, updatedata, {
            new: true,
        });

        if (!updateduser) {
            return res
                .status(400)
                .json({ success: false, message: "User not found !" });
        }

        const { password: _, ...userWithoutPassword } = updateduser.toObject();

        return res
            .status(200)
            .json({ success: true, data: userWithoutPassword });
    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: error.message || "Internal server error !" });
    }
};


// update password 
const updatepassword = async (req, res) => {
    const { id } = req.params;
    const { password, confirmpassword } = req.body; // ✅ fixed typo (was confirmpasssword)

    try {
        // const user = req.user;
        const user = await UserModel.findById(id);
        // console.log(user, 'uuuuuuuuuuuuuuuuuuu');

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found !" });
        }

        if (!password || !confirmpassword) {
            return res.status(400).json({ success: false, message: "Password & confirm password are required !" });
        }

        if (password.length < 5) {
            return res.status(400).json({ success: false, message: "Password must be at least 5 characters long!" });
        }

        // ✅ strong password check
        if (!validator.isStrongPassword(password)) {
            return res.status(400).json({ success: false, message: "Enter a strong password !" });
        }

        // ✅ confirm password check
        if (password !== confirmpassword) {
            return res.status(400).json({ success: false, message: "Password & confirm password do not match !" });
        }

        if (user._id.toString() !== id && user.role !== "admin") {
            return res.status(400).json({ success: false, message: "Same user or admin can update !" })
        }

        // ✅ hash password correctly
        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password, salt);

        // ✅ update user password
        const updatedUser = await UserModel.findByIdAndUpdate(
            id,
            { $set: { password: hashedpassword } },
            { new: true, runValidators: true }
        ).select("-password"); // ✅ don’t return password

        return res.status(200).json({
            success: true,
            message: "Password updated successfully!",
            data: updatedUser
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// serch by user name admin only
const searchbyusername = async (req, res) => {
    const { name } = req.query;
    try {
        let users;

        if (name) {
            users = await UserModel.find({
                name: { $regex: new RegExp("^" + name, "i") }
            });
        }
        else {
            users = await UserModel.find();
        }

        const logidinsuer = req.user;
        if (!logidinsuer || logidinsuer.role !== "admin" && logidinsuer.role !== "seller") {
            return res.status(400).json({ success: false, message: "you dont have permision to visit !" });
        }

        if (!users || users.length === 0) {
            return res.status(400).json({ success: false, message: "users not found !" });
        }

        return res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// filter users date vise admin only
const filterusersdatevise = async (req, res) => {
    const { startDate, endDate } = req.query;

    const parseDate = (datestart, dateend = false) => {
        if (!datestart) return null;
        const [day, month, year] = datestart.split('-');
        return new Date(`${year}-${month}-${day}T${dateend ? '23:59:59.999' : '00:00:00.000'}Z`)
    }

    try {
        let query = {};

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "start & end dates required !" });
        }

        const logidinsuer = req.user;
        if (!logidinsuer || logidinsuer.role !== "admin" && logidinsuer.role !== "seller") {
            return res.status(400).json({ success: false, message: "you dont have permision to visit !" });
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = parseDate(startDate);
            if (endDate) query.createdAt.$lte = parseDate(endDate, true);
        }

        const users = await UserModel.find(query);

        if (!users || users.length === 0) {
            return res.status(404).json({ success: false, message: "No users found !" });
        }

        return res.status(200).json({ success: true, data: users, count: users.length });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { register, loginuser, singleuser, deleteuser, userlist, logeduser, updateusers, updatepassword, searchbyusername, filterusersdatevise };