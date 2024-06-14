import { disconnect } from "process";
import { myCache } from "../app.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import { calculatePercentage, getChartsData, getInventories } from "../utils/features.js";

const getDashboardStats = asyncHandler(async(req,res,next)=>{
    let stats = {}

    const key = "admin-stats"

    if (myCache.has(key)) stats = JSON.parse(myCache.get(key) as string)
    else {
        const today = new Date()
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const thisMonth = {
            start: new Date(today.getFullYear(),today.getMonth(),1),
            end:today
        }

        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() -1,1),
            end: new Date(today.getFullYear(),today.getMonth(),0)
        }

        const thisMonthProductsPromise = Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })

        const lastMonthProductsPromise = Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        const thisMonthUsersPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })

        const lastMonthUsersPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        const thisMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })

        const lastMonthOrderPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        const lastSixMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        })

        const latestTransactionsPromise = Order.find({})
        .select(["orderItems","discount","total","status"])
        .limit(4)

        const [
            thisMonthProducts,
            thisMonthUsers,
            thisMonthOrders,
            lastMonthProducts,
            lastMonthUsers,
            lastMonthOrders,
            productsCount,
            usersCount,
            allOrders,
            lastSixMonthOrders,
            categories,
            femaleUsersCount,
            latestTransaction
        ] = await Promise.all([
            thisMonthProductsPromise,
            thisMonthUsersPromise,
            thisMonthOrdersPromise,
            lastMonthProductsPromise,
            lastMonthUsersPromise,
            lastMonthOrderPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select("total"),
            lastSixMonthOrdersPromise,
            Product.distinct("category"),
            User.countDocuments({gender:"female"}),
            latestTransactionsPromise

        ])

        const thisMonthRevenue = thisMonthOrders.reduce(
            (total,order) => total + (order.total || 0),
            0
        )

        const lastMonthRevenue = lastMonthOrders.reduce(
            (total, order) => total + (order.total || 0),
            0
        )

        const changePercent = {
            revenue: calculatePercentage(thisMonthRevenue,lastMonthRevenue),
            product: calculatePercentage(
                thisMonthProducts.length,
                lastMonthProducts.length
            ),
            user: calculatePercentage(thisMonthUsers.length,lastMonthUsers.length),
            order: calculatePercentage(
                thisMonthOrders.length,
                lastMonthOrders.length
            )
        }
        const revenue = allOrders.reduce(
            (total, order) => total + (order.total || 0),
            0
        )

        const count = {
            revenue,
            product:productsCount,
            user:usersCount,
            order:allOrders.length,
        }

        const orderMonthCounts = new Array(6).fill(0)
        const orderMonthlyRevenue = new Array(6).fill(0)

        lastSixMonthOrders.forEach((order) =>{
            const creationDate = order.createdAt
            const monthDiff = (today.getMonth() - creationDate.getMonth()+12)%12

            if (monthDiff < 6 ){
                orderMonthCounts[6 - monthDiff -1] += 1
                orderMonthlyRevenue[6 - monthDiff - 1] += order.total
            }
        })

        const categoryCount = await getInventories({
            categories,
            productsCount
        })

        const userRatio = {
            male: usersCount - femaleUsersCount,
            femaleUsersCount
        }

        const modifiedLatestTranaction = latestTransaction.map((i) =>({
            _id:i._id,
            discount:i.discount,
            amount:i.total,
            quantity: i.orderItems.length,
            status:i.status
        }))

        stats = {
            categoryCount,
            changePercent,
            count,
            chart:{
                order:orderMonthCounts,
                revenue:orderMonthlyRevenue
            },
            userRatio,
            latestTransaction:modifiedLatestTranaction,
        }
        myCache.set(key, JSON.stringify(stats))
    }   
    return res.status(200).json({
        success:true,
        stats
    })
})
const getPieCharts = asyncHandler(async(req,res,next)=>{
    let charts
    const key = "admin-pie-charts"

    if(myCache.has(key)) charts = JSON.parse(myCache.get(key) as string)
    
    else{
        const allOrderPromise = Order.find({}).select([
            "total",
            "discount",
            "subtotal",
            "tax",
            "shippingCharges"
        ]) 

        const [
            processingOrder,
            shippedOrder,
            deliveredOrder,
            categories,
            productsCount,
            outOfStock,
            allOrders,
            allUsers,
            adminUsers,
            customerUsers
        ] = await Promise.all([
            Order.countDocuments({ status: "Processing"}),
            Order.countDocuments({status: "Shipped"}),
            Order.countDocuments({status: "Delivered"}),
            Product.distinct("category"),
            Product.countDocuments(),
            Product.countDocuments({ stock:0}),
            allOrderPromise,
            User.find({}).select(["dob"]),
            User.countDocuments({role:"admin"}),
            User.countDocuments({role:"user"})
        ])

        const orderFullfillment = {
            processing:processingOrder,
            shipped:shippedOrder,
            delivered:deliveredOrder
        }

        const productCategories = await getInventories({
            categories,
            productsCount
        })

        const stockAvailability = {
            inStock: productsCount - outOfStock,
            outOfStock,
        }

        const grossIncome = allOrders.reduce(
            (prev,order) => prev + (order.total || 0),
            0
        )

        const discount = allOrders.reduce(
            (prev,order) => prev + (order.discount || 0),
            0
        )
        const productionCost = allOrders.reduce(
            (prev,order) => prev + (order.shippingCharges || 0),
            0
        )
        const burnt = allOrders.reduce(
            (prev,order) => prev + (order.tax || 0),
            0
        )

        const marketingCost = Math.round(grossIncome * (30/100)) 

        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost

        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost,
        }

        const usersAgeGroup = {
            teen: allUsers.filter((i) => i.age < 20).length,
            adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
            old: allUsers.filter((i) => i.age >= 20).length
        }

        const adminCustomer = {
            admin: adminUsers,
            customer:customerUsers
        }

        charts = {
            orderFullfillment,
            productCategories,
            stockAvailability,
            revenueDistribution,
            usersAgeGroup,
            adminCustomer
        }

        myCache.set(key, JSON.stringify(charts))


        
    }

    return res.status(200).json({
        success:true,
        charts
    })
})
const getLineCharts = asyncHandler(async(req,res,next)=>{
    let charts
    const key = "admin-bar-charts"

    if(myCache.has(key)) charts = JSON.parse(myCache.get(key) as string)
    
    else{
        const today = new Date()

        const twelveMonthsAgo = new Date()
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth()-12)

        const baseQuery = {
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today
            }
        }
        const [products, users, orders] = await Promise.all([
            Product.find(baseQuery).select("createdAt"),
            User.find(baseQuery).select("createdAt"),
            Order.find(baseQuery).select(["createdAt", "discount", "total"]),
        ])

        const productCounts = getChartsData({ length:12,today, docArr:products})
        const usersCounts = getChartsData({ length:12,today, docArr:users})
        const discount = getChartsData({ length:6,today, docArr:orders,property:"discount"})

        const revenue = getChartsData({
            length:12,
            today,
            docArr: orders,
            property:"total"
        })

        charts = {
            users: usersCounts,
            products: productCounts,
            discount,
            revenue
        }

        myCache.set(key, JSON.stringify(charts))
    }

    return res.status(200).json({
        success:true,
        charts
    })

})
const getBarCharts = asyncHandler(async(req,res,next)=>{
    let charts
    const key = "admin-bar-charts"

    if(myCache.has(key)) charts = JSON.parse(myCache.get(key) as string)
    
    else{
        const today = new Date()

        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth()-6)

        const twelveMonthsAgo = new Date()
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth()-12)

        const sixMonthsProductPromise = Product.find({
            createdAt:{
                $gte: sixMonthsAgo,
                $lte:today
            }
        }).select("createdAt")

        const sixMonthsUserPromise = User.find({
            createdAt:{
                $gte: sixMonthsAgo,
                $lte:today
            }
        }).select("createdAt")

        const twelveMonthOrdersPromise = Order.find({
            createdAt:{
                $gte: twelveMonthsAgo,
                $lte:today
            }
        }).select("createdAt")

        const [products, users, orders] = await Promise.all([
            sixMonthsProductPromise,
            sixMonthsUserPromise,
            twelveMonthOrdersPromise
        ])

        const productCounts = getChartsData({ length:6,today, docArr:products})
        const usersCounts = getChartsData({ length:6,today, docArr:users})
        const ordersCounts = getChartsData({ length:6,today, docArr:orders})

        charts = {
            users:usersCounts,
            products:productCounts,
            orders:ordersCounts
        }

        myCache.set(key, JSON.stringify(charts))
    }

    return res.status(200).json({
        success: true,
        charts
    })
})

export {getDashboardStats,getBarCharts,getPieCharts,getLineCharts}