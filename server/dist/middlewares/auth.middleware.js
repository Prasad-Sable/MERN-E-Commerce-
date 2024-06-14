import User from "../models/user.model.js";
import ErrorHandler from "../utils/utility-class.js";
import { asyncHandler } from "./error.middleware.js";
const adminOnly = asyncHandler(async (req, res, next) => {
    const { id } = req.query;
    if (!id)
        return next(new ErrorHandler("User is not Logged In", 401));
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("User is not Registered", 401));
    if (user.role !== "admin")
        return next(new ErrorHandler("Role of user is not Admin", 403));
    next();
});
export default adminOnly;
