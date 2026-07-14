"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAnalyticsController = void 0;
const adminAnalyticsRepository_1 = require("../repositories/adminAnalyticsRepository");
const apiResponse_1 = require("../utils/apiResponse");
class AdminAnalyticsController {
    // Get platform-wide aggregated analytics metrics
    static async getAnalytics(_req, res, next) {
        try {
            const stats = await adminAnalyticsRepository_1.AdminAnalyticsRepository.getPlatformAnalytics();
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Platform statistics retrieved successfully.', stats));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminAnalyticsController = AdminAnalyticsController;
exports.default = AdminAnalyticsController;
