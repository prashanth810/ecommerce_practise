const express = require("express");
const { createProduct, allproducts, singleproduct, searchproducts, searchbydate, searchbycategories, fetchparticularuserproducts } = require("../controllers/Productcontroller");
const Authmiddleware = require("../middlewares/Authmiddleware");

const Productroute = express.Router();

Productroute.post("/product/add", Authmiddleware, createProduct);
Productroute.get("/product/list", Authmiddleware, allproducts);
Productroute.get("/product/list/:id", Authmiddleware, fetchparticularuserproducts);
Productroute.get("/product/list/:id", Authmiddleware, singleproduct);
Productroute.get("/product/search", Authmiddleware, searchproducts);
Productroute.get("/product/categories", Authmiddleware, searchbycategories);
Productroute.get("/product/date", Authmiddleware, searchbydate);

module.exports = Productroute;