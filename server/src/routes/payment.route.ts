import { Router } from "express";
import { allCoupons, applyDiscount, deleteCoupon, newCoupon } from "../controller/payment.controller.js";
import adminOnly from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/coupon/new").post(adminOnly,newCoupon)
router.route("/discount").get(applyDiscount)
router.route("/coupon/all").get(adminOnly,allCoupons)
router.route("/coupon/:id").delete(adminOnly,deleteCoupon)





export default router