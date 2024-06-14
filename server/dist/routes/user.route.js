import { Router } from "express";
import { deleteUser, getAllUsers, getUser, newUser } from "../controller/user.controller.js";
import adminOnly from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/new").post(newUser);
router.route("/all").get(adminOnly, getAllUsers);
router.route("/:id").get(getUser).delete(adminOnly, deleteUser);
export default router;
