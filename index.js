const express = require("express");
require("dotenv").config();
const app = express();
app.use(express.json());
const connectDb = require("./config/database");

connectDb();
app.use("/api/products", require("./routes/proudct.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/brands", require("./routes/brand.routes"));
app.use("/api/users",require("./routes/user.routes"));
app.use("/api/carts", require("./routes/cart.routes"));
app.use("/api/wishlists", require("./routes/wishlist.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/shippingAddress", require("./routes/shipping_address.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
const PORT = 3000;
app.listen(PORT, () => {
  console.log("server is running on port " + PORT);
});
