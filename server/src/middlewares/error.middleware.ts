import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-class.js";
import { ControllerType } from "../types/types.js";

const errorMiddleware = (
    err:ErrorHandler,
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    err.message ||="Internal Server Error"
    err.statuCode ||=500

    if (err.name === "CastError") err.message ="Invalid ID"

    return res.status(err.statuCode).json({
        success:false,
        message:err.message
    })
}

const asyncHandler = (func: ControllerType) =>
    (req:Request,res:Response,next:NextFunction)=>{
        return Promise.resolve(func(req,res,next)).catch(next)
}

export {errorMiddleware,asyncHandler}