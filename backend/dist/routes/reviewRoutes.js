"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewController_1 = require("../controllers/reviewController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbacMiddleware_1 = require("../middleware/rbacMiddleware");
const router = (0, express_1.Router)();
// Apply auth and role protection (Restricted to builders only)
router.use(authMiddleware_1.requireAuth);
router.use((0, rbacMiddleware_1.requireRoles)(['builder']));
router.post('/packages/:id', reviewController_1.ReviewController.submitReview);
exports.default = router;
