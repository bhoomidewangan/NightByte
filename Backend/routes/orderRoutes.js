// routes/orderRoutes.js
// Mounts at /api/orders (see app.js)

import { Router } from "express";
import { body } from "express-validator";
import * as orderController from "../controllers/orderController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

// NOTE: /my-orders must be declared before /:orderId/status
// to avoid "my-orders" being treated as a MongoDB ObjectId

// GET /api/orders/my-orders — customer's own history
router.get("/my-orders", protect, orderController.getOrdersForCustomer);

// GET /api/orders — admin: all orders, filterable by ?status= and ?date=
router.get("/", protect, requireAdmin, orderController.getOrdersForOwner);

// POST /api/orders/place — customer places order from their cart
router.post(
  "/place",
  protect,
  body("note").optional().trim().isLength({ max: 200 }).withMessage("Note too long"),
  validateRequest,
  orderController.placeOrder
);

// PATCH /api/orders/:orderId/status — admin advances order to next status
router.patch("/:orderId/status", protect, requireAdmin, orderController.updateOrderStatus);

export default router;
