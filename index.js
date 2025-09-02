const express = require("express");
require("dotenv").config();
const app = express();
app.use(express.json());
const connectDb = require("./config/database");

connectDb();

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
app.use("/api/users",require("./routes/user.routes"));
app.use("/api/carts", require("./routes/cart.routes"));
app.use("/api/wishlists", require("./routes/wishlist.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/addresses",require("./routes/address.routes"));
app.use("/api/promocodes",require("./routes/procode.routes"));
const PORT = 3000;
app.listen(PORT, () => {
  console.log("server is running on port " + PORT);
});
