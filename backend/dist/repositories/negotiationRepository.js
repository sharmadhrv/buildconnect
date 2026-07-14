"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NegotiationRepository = void 0;
const db_1 = require("../config/db");
class NegotiationRepository {
    // Propose counter offer
    static async proposeCounterOffer(quotationId, counterBy, data) {
        const result = await (0, db_1.query)(`UPDATE quotations 
       SET status = 'countered',
           counter_budget = $1,
           counter_notes = $2,
           counter_by = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`, [data.budget, data.notes, counterBy, quotationId]);
        return result.rows[0];
    }
    // Accept or reject latest counter offer (transactional)
    static async respondToCounterOffer(quotationId, action) {
        if (action === 'reject') {
            const result = await (0, db_1.query)(`UPDATE quotations 
         SET status = 'rejected',
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`, [quotationId]);
            return result.rows[0];
        }
        // Action is 'accept' (award package and reject competitors)
        await (0, db_1.query)('BEGIN');
        try {
            const quotationRes = await (0, db_1.query)('SELECT * FROM quotations WHERE id = $1 LIMIT 1', [quotationId]);
            const quotation = quotationRes.rows[0];
            if (!quotation)
                throw new Error('Quotation not found.');
            // Final negotiated budget is the counter budget if set, else proposed budget
            const finalBudget = quotation.counter_budget ? quotation.counter_budget : quotation.proposed_budget;
            const packageId = quotation.package_id;
            // 1. Accept this quotation and finalize proposed budget
            const acceptedQuotationRes = await (0, db_1.query)(`UPDATE quotations 
         SET status = 'accepted',
             proposed_budget = $1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING *`, [finalBudget, quotationId]);
            // 2. Transition package status to 'awarded'
            await (0, db_1.query)(`UPDATE project_packages 
         SET status = 'awarded',
             updated_at = NOW()
         WHERE id = $1`, [packageId]);
            // 3. Reject all other bids for this package
            await (0, db_1.query)(`UPDATE quotations 
         SET status = 'rejected',
             updated_at = NOW()
         WHERE package_id = $1 AND id != $2`, [packageId, quotationId]);
            await (0, db_1.query)('COMMIT');
            return acceptedQuotationRes.rows[0];
        }
        catch (error) {
            await (0, db_1.query)('ROLLBACK');
            throw error;
        }
    }
    // Helper to fetch quotation details with package/project owner checks
    static async getQuotationWithOwnership(quotationId) {
        const result = await (0, db_1.query)(`SELECT q.*, 
              pp.project_id, 
              p.builder_id,
              pp.name as package_name,
              p.name as project_name
       FROM quotations q
       JOIN project_packages pp ON q.package_id = pp.id
       JOIN projects p ON pp.project_id = p.id
       WHERE q.id = $1 LIMIT 1`, [quotationId]);
        return result.rows[0];
    }
}
exports.NegotiationRepository = NegotiationRepository;
exports.default = NegotiationRepository;
