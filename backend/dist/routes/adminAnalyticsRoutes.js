"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAnalyticsController_1 = require("../controllers/adminAnalyticsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbacMiddleware_1 = require("../middleware/rbacMiddleware");
const router = (0, express_1.Router)();
// Apply auth and role protection (Restricted to administrators only)
router.use(authMiddleware_1.requireAuth);
router.use((0, rbacMiddleware_1.requireRoles)(['admin']));
router.get('/', adminAnalyticsController_1.AdminAnalyticsController.getAnalytics);
exports.default = router;
