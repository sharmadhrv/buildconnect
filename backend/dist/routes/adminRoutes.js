"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbacMiddleware_1 = require("../middleware/rbacMiddleware");
const router = (0, express_1.Router)();
// Apply auth and role protection (Restricted to administrators only)
router.use(authMiddleware_1.requireAuth);
router.use((0, rbacMiddleware_1.requireRoles)(['admin']));
// Verification checkups
router.get('/verifications', adminController_1.AdminController.getPendingList);
router.post('/verifications/:id/review', adminController_1.AdminController.reviewProfile);
// User Moderation
router.get('/users', adminController_1.AdminController.getUsersList);
router.post('/users/:id/suspend', adminController_1.AdminController.setUserSuspension);
// Reviews Moderation
router.get('/reviews', adminController_1.AdminController.getReviewsList);
router.delete('/reviews/:id', adminController_1.AdminController.removeReview);
// Package Control overrides
router.post('/packages/:id/cancel', adminController_1.AdminController.forceCancelPackage);
exports.default = router;
