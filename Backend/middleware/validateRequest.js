// middleware/validateRequest.js
// Reads the result of express-validator chains and returns a 422
// with field-level errors if anything failed.
// Place this at the END of every validation chain in routes, before the controller.
//
// Usage in routes:
//   router.post("/send-otp",
//     body("phone").isMobilePhone(),
//     validateRequest,           <-- this middleware
//     authController.sendOtp
//   );

import { validationResult } from "express-validator";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      // Array of { field, message } objects — easy to map on the frontend
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  next();
};

export default validateRequest;
