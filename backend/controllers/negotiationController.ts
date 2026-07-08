import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { NegotiationRepository } from '../repositories/negotiationRepository';
import { createApiResponse } from '../utils/apiResponse';
import { proposeCounterSchema, respondCounterSchema } from '../validators/negotiationValidator';

export class NegotiationController {
  // Propose counter offer (Builder or Contractor)
  static async proposeCounter(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role as 'builder' | 'contractor';
      const quotationId = req.params.id;

      if (!userId || !role) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      // Fetch quotation and verify ownership
      const quotation = await NegotiationRepository.getQuotationWithOwnership(quotationId);
      if (!quotation) {
        res.status(404).json(createApiResponse(false, 'Quotation bid not found.'));
        return;
      }

      let isAuthorized = false;
      if (role === 'builder' && quotation.builder_id === userId) {
        isAuthorized = true;
      } else if (role === 'contractor' && quotation.contractor_id === userId) {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        res.status(403).json(createApiResponse(false, 'Forbidden. You do not own this quotation.'));
        return;
      }

      const validatedData = proposeCounterSchema.parse(req.body);
      const updatedQuotation = await NegotiationRepository.proposeCounterOffer(
        quotationId,
        role,
        validatedData
      );

      res.status(200).json(
        createApiResponse(true, 'Counter offer proposed successfully.', updatedQuotation)
      );
    } catch (error) {
      next(error);
    }
  }

  // Respond to counter offer (Accept/Reject)
  static async respondCounter(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role as 'builder' | 'contractor';
      const quotationId = req.params.id;

      if (!userId || !role) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      // Fetch quotation
      const quotation = await NegotiationRepository.getQuotationWithOwnership(quotationId);
      if (!quotation) {
        res.status(404).json(createApiResponse(false, 'Quotation bid not found.'));
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
      } else if (quotation.status === 'pending') {
        // If pending, only the builder can accept/reject
        if (role === 'builder' && quotation.builder_id === userId) {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        res.status(403).json(
          createApiResponse(
            false,
            'Forbidden. You are not authorized to respond to this quotation in its current status.'
          )
        );
        return;
      }

      const validatedData = respondCounterSchema.parse(req.body);
      const updatedQuotation = await NegotiationRepository.respondToCounterOffer(
        quotationId,
        validatedData.action
      );

      const message = validatedData.action === 'accept'
        ? 'Quotation accepted. Package awarded and competing bids automatically rejected.'
        : 'Quotation bid rejected.';

      res.status(200).json(
        createApiResponse(true, message, updatedQuotation)
      );
    } catch (error) {
      next(error);
    }
  }
}
export default NegotiationController;
