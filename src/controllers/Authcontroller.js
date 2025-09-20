const UserModel = require("../models/UserModels");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");


const CreateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECREAT, { expiresIn: "1d" });
}

// register 
const register = async (req, res) => {
    const { firstName, lastName, email, password, type } = req.body;
    try {
        const exist = await UserModel.findOne({ email });

        // alredy user or not 
        if (exist) {
            return res.status(400).json({ success: false, message: "User alredy existed !" });
        }

        // first name & last name 
        if (firstName.length < 5 || lastName.length < 5) {
            return res.status(400).json({ success: false, message: "first & last names mu be more then 5 characters " })
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
            firstName, lastName, email, password: hashedpasssword, type
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
    const { email, password, type } = req.body;
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

        if (!type || user.type !== type) {
            return res.status(403).json({ success: false, message: "Invalid user type" });
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


// get all users list 
const userlist = async (req, res) => {
    try {
        const users = await UserModel.find({});
        if (!users) {
            return res.status(400).json({ success: false, message: "No data found !" });
        }

        return res.status(200).json({ success: true, data: users });
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


// delete user account 
const deleteuser = async (req, res) => {
    const { id } = req.params;
    try {

        if (!req.user) {
            return res.status(400).json({ success: false, message: "unauthorized user !" });
        }

        const admin = req.user.type === 'admin';
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

// get sinle user by id 
const singleuser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await UserModel.findById(id);

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

        const updateduser = await UserModel.findByIdAndUpdate(id, updatedata, { new: true });

        const { password: _, ...userWithoutPassword } = updateduser.toObject();

        if (!updateduser) {
            return res.status(400).json({ success: false, message: "User not found !" });
        }
        return res.status(200).json({ success: true, data: userWithoutPassword });

    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error !" });
    }
}


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

        if (user._id.toString() !== id && user.type !== "admin") {
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


module.exports = { register, loginuser, singleuser, deleteuser, userlist, logeduser, updateusers, updatepassword };