const express = require("express");
const { register, singleuser, loginuser, deleteuser, userlist, logeduser, updateusers, updatepassword, searchbyusername, filterusersdatevise } = require("../controllers/Authcontroller");
const { models } = require("mongoose");
const Authmiddleware = require("../middlewares/Authmiddleware");
const upload = require("../middlewares/Multermiddleware");


const authrouter = express.Router();

authrouter.post('/register', register);
authrouter.post('/login', loginuser);
authrouter.put('/update/:id', upload.single('profile'), updateusers);
authrouter.put('/password/:id', updatepassword);
authrouter.get('/profile/:id', Authmiddleware, singleuser);
authrouter.get('/users', Authmiddleware, userlist); // admin only get all users 
authrouter.get('/users/search', Authmiddleware, searchbyusername); // serch user only admin can 
authrouter.get('/users/date', Authmiddleware, filterusersdatevise); // serch user only admin can 
authrouter.get('/profile', Authmiddleware, logeduser);
authrouter.delete('/delete/:id', Authmiddleware, deleteuser);

module.exports = authrouter;