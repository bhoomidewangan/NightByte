// routes/whatsappRoutes.js
// Mounts at /api/whatsapp (see app.js)
//
// Only one route — the Twilio webhook.
// Twilio sends POST with form-encoded body, so we need express.urlencoded
// which is already configured in app.js.

import { Router } from "express";
import { webhook } from "../controllers/whatsappController.js";

const router = Router();

// POST /api/whatsapp/webhook
// Twilio calls this on every incoming WhatsApp message.
// No auth middleware — Twilio hits this directly.
// In production, add Twilio signature validation (see whatsappController.js).
router.post("/webhook", webhook);

export default router;
