"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', authController_1.AuthController.register);
router.post('/login', authController_1.AuthController.login);
router.post('/verify-otp', authController_1.AuthController.verifyOtp);
router.post('/refresh', authController_1.AuthController.refresh);
router.post('/forgot-password', authController_1.AuthController.forgotPassword);
router.post('/reset-password', authController_1.AuthController.resetPassword);
// Protected routes (Requires Auth token)
router.get('/me', authMiddleware_1.requireAuth, authController_1.AuthController.getMe);
exports.default = router;
