"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const discoveryController_1 = require("../controllers/discoveryController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbacMiddleware_1 = require("../middleware/rbacMiddleware");
const router = (0, express_1.Router)();
// Apply authentication guard to discovery routes
router.use(authMiddleware_1.requireAuth);
router.get('/projects', discoveryController_1.DiscoveryController.getOpenProjects);
// Contractor specific endpoints
router.get('/matching', (0, rbacMiddleware_1.requireRoles)(['contractor']), discoveryController_1.DiscoveryController.getMatchingPackages);
router.get('/packages/:id', (0, rbacMiddleware_1.requireRoles)(['contractor']), discoveryController_1.DiscoveryController.getPackageDetails);
router.post('/packages/:id/bid', (0, rbacMiddleware_1.requireRoles)(['contractor']), discoveryController_1.DiscoveryController.submitBid);
exports.default = router;
