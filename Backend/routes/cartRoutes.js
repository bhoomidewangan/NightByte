// routes/cartRoutes.js
// Mounts at /api/cart (see app.js)
// All routes are protected — customers only (no admin access needed)

import { Router } from "express";
import { body } from "express-validator";
import * as cartController from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

const itemValidation = [
  body("menuItemId")
    .notEmpty().withMessage("menuItemId is required")
    .isMongoId().withMessage("Invalid menuItemId"),
  body("quantity")
    .optional()
    .isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

// GET /api/cart
router.get("/", protect, cartController.getCart);

// POST /api/cart/add
router.post("/add", protect, itemValidation, validateRequest, cartController.addToCart);

// POST /api/cart/remove
router.post("/remove", protect, itemValidation, validateRequest, cartController.removeFromCart);

// DELETE /api/cart
router.delete("/", protect, cartController.clearCart);

export default router;
