const errorMiddleware = (err, req, res, next) => {
    err.message || (err.message = "Internal Server Error");
    err.statuCode || (err.statuCode = 500);
    if (err.name === "CastError")
        err.message = "Invalid ID";
    return res.status(err.statuCode).json({
        success: false,
        message: err.message
    });
};
const asyncHandler = (func) => (req, res, next) => {
    return Promise.resolve(func(req, res, next)).catch(next);
};
export { errorMiddleware, asyncHandler };
