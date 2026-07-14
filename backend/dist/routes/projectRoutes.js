"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbacMiddleware_1 = require("../middleware/rbacMiddleware");
const router = (0, express_1.Router)();
// Apply auth to all project routes
router.use(authMiddleware_1.requireAuth);
// Project detail retrieval is open to all authenticated users (builders, contractors, admins)
router.get('/:id', projectController_1.ProjectController.getDetails);
// Actions restricted to builders only
router.post('/', (0, rbacMiddleware_1.requireRoles)(['builder']), projectController_1.ProjectController.create);
router.get('/list/builder', (0, rbacMiddleware_1.requireRoles)(['builder']), projectController_1.ProjectController.getBuilderProjects);
router.put('/:id', (0, rbacMiddleware_1.requireRoles)(['builder']), projectController_1.ProjectController.update);
router.patch('/:id/status', (0, rbacMiddleware_1.requireRoles)(['builder']), projectController_1.ProjectController.updateStatus);
exports.default = router;
