const express = require("express");
require("dotenv").config();
const app = express();
app.use(express.json());
const connectDb = require("./config/database");
const morgan = require("morgan");
const path = require('path');
const rfs = require('rotating-file-stream');
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


connectDb();
var accessLogStream = rfs.createStream('access.log', {
  interval: '1d',
  path: path.join(__dirname, 'log')
})
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan("combined"));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use("/api/products", require("./routes/proudct.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/brands", require("./routes/brand.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/carts", require("./routes/cart.routes"));
app.use("/api/wishlists", require("./routes/wishlist.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/addresses", require("./routes/address.routes"));
app.use("/api/promocodes", require("./routes/procode.routes"));
app.use("/api/reviews",require("./routes/review.routes"));
const PORT = 3000;
app.listen(PORT, () => {
  console.log("server is running on port " + PORT);
});
