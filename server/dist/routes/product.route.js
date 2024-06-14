import { Router } from "express";
import { deleteProduct, getAdminProducts, getAllCategories, getAllProducts, getSingleProduct, getlatestProducts, newProduct, updateProduct } from "../controller/product.controller.js";
import { singleUpload } from "../middlewares/multer.js";
import adminOnly from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/new").post(adminOnly, singleUpload, newProduct);
router.route("/latest").get(getlatestProducts);
router.route("/categories").get(getAllCategories);
router.route("/admin-products").get(getAdminProducts);
router.route("/all").get(getAllProducts);
router.route("/:id").get(getSingleProduct).put(singleUpload, updateProduct).delete(deleteProduct);
export default router;
