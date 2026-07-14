"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const authMiddleware_1 = require("../middleware/authMiddleware");
const apiResponse_1 = require("../utils/apiResponse");
const router = (0, express_1.Router)();
// Apply authentication guard
router.use(authMiddleware_1.requireAuth);
// Get master skills list
router.get('/skills', async (_req, res, next) => {
    try {
        const result = await (0, db_1.query)('SELECT id, name FROM skills ORDER BY name ASC');
        res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Master skills retrieved successfully.', result.rows));
    }
    catch (error) {
        next(error);
    }
});
// Get master categories list
router.get('/categories', async (_req, res, next) => {
    try {
        const result = await (0, db_1.query)('SELECT id, name FROM categories ORDER BY name ASC');
        res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Master categories retrieved successfully.', result.rows));
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
