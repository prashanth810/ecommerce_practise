const express = require("express");
const { createProduct, allproducts, singleproduct, searchproducts, searchbydate, searchbycategories, fetchparticularuserproducts } = require("../controllers/Productcontroller");
const Authmiddleware = require("../middlewares/Authmiddleware");

const Productroute = express.Router();

// get products
Productroute.get("/product/list", Authmiddleware, allproducts); // get all products
Productroute.get("/product/myproducts", Authmiddleware, fetchparticularuserproducts); // get single user added ( self ) product 
Productroute.get("/product/list/:id", Authmiddleware, singleproduct); // 
Productroute.get("/product/search", Authmiddleware, searchproducts);
Productroute.get("/product/categories", Authmiddleware, searchbycategories);
Productroute.get("/product/date", Authmiddleware, searchbydate);

// post products
Productroute.post("/product/add", Authmiddleware, createProduct); // add new product


// update products



// delete products 



module.exports = Productroute;