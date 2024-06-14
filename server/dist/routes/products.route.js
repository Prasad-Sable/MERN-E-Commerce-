import { Router } from "express";
const router = Router();
router.route("/new").post(newProduct);
export default router;
