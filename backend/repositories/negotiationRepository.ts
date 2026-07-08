import { query } from '../config/db';

export class NegotiationRepository {
  // Propose counter offer
  static async proposeCounterOffer(
    quotationId: string,
    counterBy: 'builder' | 'contractor',
    data: { budget: number; notes: string }
  ): Promise<any> {
    const result = await query(
      `UPDATE quotations 
       SET status = 'countered',
           counter_budget = $1,
           counter_notes = $2,
           counter_by = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [data.budget, data.notes, counterBy, quotationId]
    );
    return result.rows[0];
  }

  // Accept or reject latest counter offer (transactional)
  static async respondToCounterOffer(
    quotationId: string,
    action: 'accept' | 'reject'
  ): Promise<any> {
    if (action === 'reject') {
      const result = await query(
        `UPDATE quotations 
         SET status = 'rejected',
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [quotationId]
      );
      return result.rows[0];
    }

    // Action is 'accept' (award package and reject competitors)
    await query('BEGIN');
    try {
      const quotationRes = await query(
        'SELECT * FROM quotations WHERE id = $1 LIMIT 1',
        [quotationId]
      );
      const quotation = quotationRes.rows[0];
      if (!quotation) throw new Error('Quotation not found.');

      // Final negotiated budget is the counter budget if set, else proposed budget
      const finalBudget = quotation.counter_budget ? quotation.counter_budget : quotation.proposed_budget;
      const packageId = quotation.package_id;

      // 1. Accept this quotation and finalize proposed budget
      const acceptedQuotationRes = await query(
        `UPDATE quotations 
         SET status = 'accepted',
             proposed_budget = $1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [finalBudget, quotationId]
      );

      // 2. Transition package status to 'awarded'
      await query(
        `UPDATE project_packages 
         SET status = 'awarded',
             updated_at = NOW()
         WHERE id = $1`,
        [packageId]
      );

      // 3. Reject all other bids for this package
      await query(
        `UPDATE quotations 
         SET status = 'rejected',
             updated_at = NOW()
         WHERE package_id = $1 AND id != $2`,
        [packageId, quotationId]
      );

      await query('COMMIT');
      return acceptedQuotationRes.rows[0];
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  // Helper to fetch quotation details with package/project owner checks
  static async getQuotationWithOwnership(quotationId: string): Promise<any> {
    const result = await query(
      `SELECT q.*, 
              pp.project_id, 
              p.builder_id,
              pp.name as package_name,
              p.name as project_name
       FROM quotations q
       JOIN project_packages pp ON q.package_id = pp.id
       JOIN projects p ON pp.project_id = p.id
       WHERE q.id = $1 LIMIT 1`,
      [quotationId]
    );
    return result.rows[0];
  }
}
export default NegotiationRepository;
