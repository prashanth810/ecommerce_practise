const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const ConnectionDB = require("./config/Databse");
const authrouter = require("./routes/Authroutes");
const cookieparser = require("cookie-parser");
const Productroute = require("./routes/Productroutes");

dotenv.config();

const app = express();
// port 
const PORT = process.env.PORT || 8020;

// middle wares
app.use(express.json());
app.use(cors());
app.use(cookieparser());


// login routes 
app.use('/api/auth', authrouter);

// product routes
app.use('/api/auth', Productroute);


app.get('/', (req, res) => {
    res.send("server sended 8020");
})


ConnectionDB().then(() => {
    app.listen(PORT, () => {
        console.log("console server started !!");
    })
}).catch((err) => {
    console.log("Failed to connected !");
});
