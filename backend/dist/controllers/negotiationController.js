"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NegotiationController = void 0;
const negotiationRepository_1 = require("../repositories/negotiationRepository");
const apiResponse_1 = require("../utils/apiResponse");
const negotiationValidator_1 = require("../validators/negotiationValidator");
class NegotiationController {
    // Propose counter offer (Builder or Contractor)
    static async proposeCounter(req, res, next) {
        try {
            const userId = req.user?.userId;
            const role = req.user?.role;
            const quotationId = req.params.id;
            if (!userId || !role) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            // Fetch quotation and verify ownership
            const quotation = await negotiationRepository_1.NegotiationRepository.getQuotationWithOwnership(quotationId);
            if (!quotation) {
                res.status(404).json((0, apiResponse_1.createApiResponse)(false, 'Quotation bid not found.'));
                return;
            }
            let isAuthorized = false;
            if (role === 'builder' && quotation.builder_id === userId) {
                isAuthorized = true;
            }
            else if (role === 'contractor' && quotation.contractor_id === userId) {
                isAuthorized = true;
            }
            if (!isAuthorized) {
                res.status(403).json((0, apiResponse_1.createApiResponse)(false, 'Forbidden. You do not own this quotation.'));
                return;
            }
            const validatedData = negotiationValidator_1.proposeCounterSchema.parse(req.body);
            const updatedQuotation = await negotiationRepository_1.NegotiationRepository.proposeCounterOffer(quotationId, role, validatedData);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Counter offer proposed successfully.', updatedQuotation));
        }
        catch (error) {
            next(error);
        }
    }
    // Respond to counter offer (Accept/Reject)
    static async respondCounter(req, res, next) {
        try {
            const userId = req.user?.userId;
            const role = req.user?.role;
            const quotationId = req.params.id;
            if (!userId || !role) {
                res.status(401).json((0, apiResponse_1.createApiResponse)(false, 'Unauthorized.'));
                return;
            }
            // Fetch quotation
            const quotation = await negotiationRepository_1.NegotiationRepository.getQuotationWithOwnership(quotationId);
            if (!quotation) {
                res.status(404).json((0, apiResponse_1.createApiResponse)(false, 'Quotation bid not found.'));
                return;
            }
            // Authorization & State Transition validations
            let isAuthorized = false;
            if (quotation.status === 'countered') {
                // If countered by builder, only the contractor can accept/reject
                if (quotation.counter_by === 'builder' && role === 'contractor' && quotation.contractor_id === userId) {
                    isAuthorized = true;
                }
                // If countered by contractor, only the builder can accept/reject
                if (quotation.counter_by === 'contractor' && role === 'builder' && quotation.builder_id === userId) {
                    isAuthorized = true;
                }
            }
            else if (quotation.status === 'pending') {
                // If pending, only the builder can accept/reject
                if (role === 'builder' && quotation.builder_id === userId) {
                    isAuthorized = true;
                }
            }
            if (!isAuthorized) {
                res.status(403).json((0, apiResponse_1.createApiResponse)(false, 'Forbidden. You are not authorized to respond to this quotation in its current status.'));
                return;
            }
            const validatedData = negotiationValidator_1.respondCounterSchema.parse(req.body);
            const updatedQuotation = await negotiationRepository_1.NegotiationRepository.respondToCounterOffer(quotationId, validatedData.action);
            const message = validatedData.action === 'accept'
                ? 'Quotation accepted. Package awarded and competing bids automatically rejected.'
                : 'Quotation bid rejected.';
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, message, updatedQuotation));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NegotiationController = NegotiationController;
exports.default = NegotiationController;
