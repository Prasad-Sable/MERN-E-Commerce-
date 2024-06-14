import { asyncHandler } from "../middlewares/error.middleware.js";
import Coupon from "../models/coupon.model.js";
import ErrorHandler from "../utils/utility-class.js";
const newCoupon = asyncHandler(async (req, res, next) => {
    const { coupon, amount } = req.body;
    if (!coupon || !amount)
        return next(new ErrorHandler("Please Enter both Coupon and Amount", 400));
    await Coupon.create({
        code: coupon,
        amount
    });
    return res.status(201).json({
        success: true,
        message: `Coupon ${coupon} Created sucessfully`
    });
});
const applyDiscount = asyncHandler(async (req, res, next) => {
    const { coupon } = req.query;
    const discount = await Coupon.findOne({ code: coupon });
    if (!discount)
        return next(new ErrorHandler("Invalid Coupon Code", 400));
    return res.status(200).json({
        success: true,
        discount: discount.amount
    });
});
const allCoupons = asyncHandler(async (req, res, next) => {
    const coupons = await Coupon.find({});
    return res.status(200).json({
        success: true,
        coupons
    });
});
const deleteCoupon = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon)
        return next(new ErrorHandler("Invalid Coponon Id", 400));
    return res.status(200).json({
        success: true,
        message: `Coupon ${coupon.code} Deleted Successfully`
    });
});
const createPaymentIntent = asyncHandler(async (req, res, next) => {
    const { amount } = req.body;
    if (!amount)
        return next(new ErrorHandler("Please Enter Amount", 400));
    // const paymentIntent = await stripe.paymentIntents.create
});
export { newCoupon, applyDiscount, allCoupons, deleteCoupon };
