"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = void 0;
const apiResponse_1 = require("../utils/apiResponse");
/**
 * Restricts access to specific roles
 * @param roles Array of allowed roles ('admin', 'builder', 'contractor')
 */
const requireRoles = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Authentication required.', {}, null));
            return;
        }
        if (!roles.includes(user.role)) {
            res.status(403).json((0, apiResponse_1.createApiResponse)(false, 'Access denied. Insufficient permissions.', {}, null));
            return;
        }
        next();
    };
};
exports.requireRoles = requireRoles;
