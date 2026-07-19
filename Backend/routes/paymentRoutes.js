// routes/paymentRoutes.js
// Mounts at /api/payment (see app.js)

import { Router } from "express";
import { body } from "express-validator";
import * as paymentController from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

// POST /api/payment/initiate — customer initiates payment from cart
router.post(
  "/initiate",
  protect,
  body("note").optional().trim().isLength({ max: 200 }).withMessage("Note too long"),
  validateRequest,
  paymentController.initiate
);

// POST /api/payment/verify — verify payment after Cashfree redirects back
router.post(
  "/verify",
  protect,
  body("orderId").notEmpty().withMessage("orderId is required"),
  validateRequest,
  paymentController.verify
);

// POST /api/payment/webhook — called by Cashfree for WhatsApp payment confirmation
// No auth middleware — Cashfree calls this directly
router.post("/webhook", paymentController.webhook);

export default router;