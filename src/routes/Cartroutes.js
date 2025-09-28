const express = require("express");
const { Addtocart, removeFromCart, getcartlist } = require("../controllers/Cartcontroller");
const Authmiddleware = require("../middlewares/Authmiddleware");

const Cartroutes = express.Router();

// get all cart data 
Cartroutes.get('/cart/list', Authmiddleware, getcartlist);

// add items in cart post
Cartroutes.post('/cart', Authmiddleware, Addtocart);

// remove from cart ( -1 ) only 0 it will remove from cart
Cartroutes.put('/cart/remove', Authmiddleware, removeFromCart);

module.exports = Cartroutes;