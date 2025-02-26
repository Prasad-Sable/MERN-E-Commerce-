import { asyncHandler } from "../middlewares/error.middleware.js";
import User from "../models/user.model.js";
import ErrorHandler from "../utils/utility-class.js";
const newUser = asyncHandler(async (req, res, next) => {
    const { name, email, photo, gender, _id, dob } = req.body;
    let user = await User.findById(_id);
    if (user)
        return res.status(200).json({
            success: true,
            message: `Welcome, ${user.name}`
        });
    if (!_id || !name || !email || !photo || !gender || !dob)
        return next(new ErrorHandler("Please add all fields", 400));
    user = await User.create({
        name,
        email,
        photo,
        gender,
        _id,
        dob: new Date(dob)
    });
});
const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find({});
    return res.status(200).json({
        success: true,
        users
    });
});
const getUser = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Invalid Id", 400));
    return res.status(200).json({
        success: true,
        user
    });
});
const deleteUser = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Invalid Id", 400));
    await user.deleteOne();
    return res.status(200).json({
        success: true,
        message: "User Deleted Successfully"
    });
});
export { newUser, getAllUsers, getUser, deleteUser };
