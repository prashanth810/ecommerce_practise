const ProductModel = require("../models/ProductModel");

// create a new product 
const createProduct = async (req, res) => {
    const { title, coverProfile, images, description, categories, brand, stock, prices, featured } = req.body;

    try {
        const user = req.user;
        // ✅ Required fields check
        if (!title || title.length < 3) {
            return res.status(400).json({ success: false, message: "Title is required (min 3 chars)" });
        }

        if (!coverProfile) {
            return res.status(400).json({ success: false, message: "Cover profile image is required" });
        }

        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ success: false, message: "At least one image is required" });
        }

        if (!description || description.length < 10) {
            return res.status(400).json({ success: false, message: "Description must be at least 10 chars" });
        }

        if (!categories) {
            return res.status(400).json({ success: false, message: "category is required" });
        }

        if (!brand) {
            return res.status(400).json({ success: false, message: "Brand is required" });
        }

        if (stock == null || stock < 0) {
            return res.status(400).json({ success: false, message: "Stock must be a non-negative number" });
        }

        if (!prices || !Array.isArray(prices) || prices.length === 0) {
            return res.status(400).json({ success: false, message: "At least one price option is required" });
        }

        // ✅ Construct product object
        const newproduct = new ProductModel({
            title,
            coverProfile,
            images,
            description,
            categories,
            brand,
            stock,
            prices,
            featured: featured || false, // default false if not provided
            createdBy: user._id,
        });

        // ✅ Save product
        const product = await newproduct.save();

        res.status(200).json({ success: true, message: "Product created successfully", data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// find products for particular user added products 
const fetchparticularuserproducts = async (req, res) => {
    try {
        const user = req.user;

        // ✅ fetch only products created by this user
        const products = await ProductModel.find({ createdBy: user._id });

        if (!user) {
            return res.status(404).json({ success: false, message: "user not found !" });
        }

        if (!products) {
            return res.status(404).json({ success: false, message: "products not found !" });
        }

        return res.status(200).json({ success: true, count: products.length, data: products });

    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// get all products 
const allproducts = async (req, res) => {
    try {
        const list = await ProductModel.find({});

        if (!list) {
            return res.status(400).json({ success: false, message: "no data found !" });
        }

        return res.status(200).json({ success: true, data: list });
    }
    catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

// single product 
const singleproduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await ProductModel.findById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found !" });
        }

        return res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

// search product by title 
const searchproducts = async (req, res) => {
    const { title } = req.query;
    try {
        let products;

        if (title) {
            products = await ProductModel.find({
                title: { $regex: new RegExp(title, "i") }   // "mang" will match "Mango"
            });
        }
        else {
            products = await ProductModel.find();
        }

        if (!products || products.length === 0) {
            return res.status(404).json({ success: false, message: "No products found !" });
        }

        return res.status(200).json({ success: true, data: products });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// search by date name 
const searchbydate = async (req, res) => {
    const { startDate, endDate } = req.query;

    // parse "DD-MM-YYYY" to Date object, with proper start/end of day
    const parseDate = (dateStr, isEnd = false) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split('-');
        return new Date(`${year}-${month}-${day}T${isEnd ? '23:59:59.999' : '00:00:00.000'}Z`);
    }

    try {
        let query = {};

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = parseDate(startDate);   // start of day
            if (endDate) query.createdAt.$lte = parseDate(endDate, true); // end of day
        }

        const products = await ProductModel.find(query);

        if (!products || products.length === 0) {
            return res.status(404).json({ success: false, message: "No products found!" });
        }

        return res.status(200).json({ success: true, data: products });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// search by categories 
const searchbycategories = async (req, res) => {
    const { categories } = req.query;
    try {
        let product;

        if (categories) {
            product = await ProductModel.find({
                categories: { $regex: new RegExp(categories, "i") }
            });
        }
        else {
            product = await ProductModel.find();
        }

        if (!product || product.length === 0) {
            return res.status(404).json({ success: false, message: "no categories found !" });
        }

        return res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}



module.exports = { createProduct, allproducts, singleproduct, searchproducts, searchbydate, searchbycategories, fetchparticularuserproducts };