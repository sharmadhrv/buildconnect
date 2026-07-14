"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apiResponse_1 = require("../utils/apiResponse");
const db_1 = require("../config/db");
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Authorization token required. Access denied.', {}, null));
        return;
    }
    const token = authHeader.split(' ')[1];
    const accessSecret = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';
    try {
        const decoded = jsonwebtoken_1.default.verify(token, accessSecret);
        // Check database to ensure user is not suspended
        const userCheck = await (0, db_1.query)('SELECT is_suspended FROM users WHERE id = $1', [decoded.userId]);
        if (userCheck.rows[0]?.is_suspended) {
            res.status(403).json((0, apiResponse_1.createApiResponse)(false, 'Your account has been suspended by an administrator. Access denied.', {}, null));
            return;
        }
        req.user = decoded;
        next();
        return;
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Access token expired.', {}, { code: 'TOKEN_EXPIRED' }));
            return;
        }
        res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Invalid access token. Authorization failed.', {}, null));
        return;
    }
};
exports.requireAuth = requireAuth;
exports.default = exports.requireAuth;
