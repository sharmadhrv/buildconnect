"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const negotiationController_1 = require("../controllers/negotiationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Apply authentication guard to negotiation routes
router.use(authMiddleware_1.requireAuth);
router.post('/:id/counter', negotiationController_1.NegotiationController.proposeCounter);
router.post('/:id/respond', negotiationController_1.NegotiationController.respondCounter);
exports.default = router;
