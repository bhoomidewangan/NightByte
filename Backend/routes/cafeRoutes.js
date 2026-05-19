// routes/cafeRoutes.js
// Mounts at /api/cafe (see app.js)

import { Router } from "express";
import { body } from "express-validator";
import * as cafeController from "../controllers/cafeController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

const cafeValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Cafe name is required")
    .isLength({ max: 100 }).withMessage("Name too long"),
  body("phone")
    .optional()
    .trim()
    .matches(/^\+[1-9]\d{7,14}$/).withMessage("Invalid phone format"),
  body("openingTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Use HH:MM format e.g. 09:00"),
  body("closingTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Use HH:MM format e.g. 23:00"),
];

// GET  /api/cafe — public
router.get("/", cafeController.getCafe);

// POST /api/cafe — admin only, one-time setup
router.post("/", protect, requireAdmin, cafeValidation, validateRequest, cafeController.createCafe);

// PUT  /api/cafe — admin only
router.put("/", protect, requireAdmin, cafeValidation, validateRequest, cafeController.updateCafe);

// PATCH /api/cafe/toggle — admin only
router.patch("/toggle", protect, requireAdmin, cafeController.toggleOrdering);

export default router;
