"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const builderController_1 = require("../controllers/builderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbacMiddleware_1 = require("../middleware/rbacMiddleware");
const router = (0, express_1.Router)();
// Apply auth and role protection (Restricted to builders only)
router.use(authMiddleware_1.requireAuth);
router.use((0, rbacMiddleware_1.requireRoles)(['builder']));
router.get('/profile', builderController_1.BuilderController.getProfile);
router.put('/profile', builderController_1.BuilderController.updateProfile);
router.post('/upload-document', builderController_1.BuilderController.uploadDocument);
router.post('/verify', builderController_1.BuilderController.submitVerification);
router.get('/analytics', builderController_1.BuilderController.getAnalytics);
router.get('/applications', builderController_1.BuilderController.getApplications);
router.post('/applications/:id/review', builderController_1.BuilderController.reviewApplication);
exports.default = router;
