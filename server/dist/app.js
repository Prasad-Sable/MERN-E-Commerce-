import express from "express";
import { config } from "dotenv";
import { connectDB } from "./db/dbConfig.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import NodeCache from "node-cache";
import morgan from "morgan";
config({
    path: "./.env"
});
const port = process.env.PORT || 7000;
const mongoURI = process.env.MONGO_URI || "";
console.log(typeof (mongoURI));
connectDB(mongoURI);
const app = express();
app.use(express.json());
app.use(morgan("dev"));
export const myCache = new NodeCache();
import userRoute from "./routes/user.route.js";
import productRoute from "./routes/product.route.js";
import orderRoute from "./routes/order.route.js";
import paymentRoute from "./routes/payment.route.js";
import dashBoardRoute from "./routes/stats.route.js";
app.use("/api/v1/users", userRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/payments", paymentRoute);
app.use("/api/v1/dashboard", dashBoardRoute);
app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);
app.listen(port, () => {
    console.log(`app is running on ${port} port`);
});
