"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const reviewRepository_1 = require("../repositories/reviewRepository");
const apiResponse_1 = require("../utils/apiResponse");
const reviewValidator_1 = require("../validators/reviewValidator");
class ReviewController {
    // Mark package completed and submit ratings review
    static async submitReview(req, res, next) {
        try {
            const builderId = req.user?.userId;
            const packageId = req.params.id;
            if (!builderId) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            const validatedData = reviewValidator_1.submitReviewValidatorSchema.parse(req.body);
            const reviewResult = await reviewRepository_1.ReviewRepository.createReview(builderId, packageId, validatedData);
            res.status(201).json((0, apiResponse_1.createApiResponse)(true, 'Review submitted successfully. Work package marked completed.', reviewResult));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReviewController = ReviewController;
exports.default = ReviewController;
