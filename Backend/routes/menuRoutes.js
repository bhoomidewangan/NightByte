// routes/menuRoutes.js
// Mounts at /api/menu (see app.js)

import { Router } from "express";
import { body } from "express-validator";
import * as menuController from "../controllers/menuController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

const itemValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Item name is required")
    .isLength({ max: 100 }).withMessage("Name too long"),
  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("category")
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage("Category too long"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("Description too long"),
];

// GET /api/menu — public (available items only, grouped by category)
router.get("/", menuController.getMenu);

// GET /api/menu/all — admin only (all items including unavailable)
// NOTE: this route must be declared before /:itemId to avoid "all" being
// treated as a MongoDB ObjectId parameter
router.get("/all", protect, requireAdmin, menuController.getAllItems);

// POST /api/menu — admin only
router.post("/", protect, requireAdmin, itemValidation, validateRequest, menuController.addItem);

// PUT /api/menu/:itemId — admin only
router.put("/:itemId", protect, requireAdmin, itemValidation, validateRequest, menuController.updateItem);

// PATCH /api/menu/:itemId/toggle — admin only
router.patch("/:itemId/toggle", protect, requireAdmin, menuController.toggleAvailability);

// DELETE /api/menu/:itemId — admin only
router.delete("/:itemId", protect, requireAdmin, menuController.deleteItem);

export default router;
