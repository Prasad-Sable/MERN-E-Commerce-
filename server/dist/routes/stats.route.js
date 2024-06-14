import { Router } from "express";
import adminOnly from "../middlewares/auth.middleware.js";
import { getBarCharts, getDashboardStats, getLineCharts, getPieCharts } from "../controller/stats.controller.js";
const router = Router();
router.route("/stats").get(adminOnly, getDashboardStats);
router.route("/pie").get(adminOnly, getPieCharts);
router.route("/bar").get(adminOnly, getBarCharts);
router.route("/line").get(adminOnly, getLineCharts);
export default router;
