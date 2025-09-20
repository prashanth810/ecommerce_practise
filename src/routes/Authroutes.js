const express = require("express");
const { register, singleuser, loginuser, deleteuser, userlist, logeduser, updateusers, updatepassword } = require("../controllers/Authcontroller");
const { models } = require("mongoose");
const Authmiddleware = require("../middlewares/Authmiddleware");

const authrouter = express.Router();


authrouter.post('/register', register);
authrouter.post('/login', loginuser);
authrouter.put('/update/:id', updateusers);
authrouter.put('/password/:id', updatepassword);
authrouter.get('/profile/:id', Authmiddleware, singleuser);
authrouter.get('/users', Authmiddleware, userlist);
authrouter.get('/profile', Authmiddleware, logeduser);
authrouter.delete('/delete/:id', Authmiddleware, deleteuser);

module.exports = authrouter;