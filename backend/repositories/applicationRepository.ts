import { query } from '../config/db';

export class ApplicationRepository {
  // Get all applications (quotations) received for a builder's projects
  static async getApplicationsForBuilder(builderId: string): Promise<any[]> {
    const result = await query(
      `SELECT q.id as quotation_id,
              q.proposed_budget,
              q.proposed_timeline_start,
              q.proposed_timeline_end,
              q.proposal_notes,
              q.breakdown,
              q.status as quotation_status,
              q.counter_budget,
              q.counter_notes,
              q.counter_by,
              q.created_at as applied_at,
              pp.id as package_id,
              pp.name as package_name,
              pp.budget as package_budget,
              pp.status as package_status,
              p.id as project_id,
              p.name as project_name,
              c.id as contractor_id,
              c.business_name as contractor_name,
              c.trust_score as contractor_trust_score,
              c.success_rate as contractor_success_rate,
              c.completed_projects_count as contractor_projects_count
       FROM quotations q
       JOIN project_packages pp ON q.package_id = pp.id
       JOIN projects p ON pp.project_id = p.id
       JOIN contractors c ON q.contractor_id = c.id
       WHERE p.builder_id = $1
       ORDER BY q.created_at DESC`,
      [builderId]
    );
    return result.rows;
  }

  // Get specific quotation details
  static async getQuotationDetails(quotationId: string): Promise<any | null> {
    const result = await query(
      `SELECT q.*, pp.project_id, pp.status as package_status, p.builder_id
       FROM quotations q
       JOIN project_packages pp ON q.package_id = pp.id
       JOIN projects p ON pp.project_id = p.id
       WHERE q.id = $1 LIMIT 1`,
      [quotationId]
    );
    return result.rows[0] || null;
  }

  // Review (Accept / Reject) quotation
  static async reviewApplication(
    quotationId: string,
    status: 'accepted' | 'rejected'
  ): Promise<void> {
    if (status === 'rejected') {
      await query(
        `UPDATE quotations 
         SET status = 'rejected', updated_at = NOW() 
         WHERE id = $1`,
        [quotationId]
      );
      return;
    }

    // Wrap Accept flow in a transaction:
    // 1. Accept this quotation.
    // 2. Award the project package to this contractor.
    // 3. Reject all other pending quotations for this package.
    await query('BEGIN');
    try {
      // Get the package ID first
      const quoteRes = await query('SELECT package_id FROM quotations WHERE id = $1', [quotationId]);
      const packageId = quoteRes.rows[0]?.package_id;

      if (!packageId) throw new Error('Quotation package reference not found.');

      // Update current quotation to accepted
      await query(
        `UPDATE quotations 
         SET status = 'accepted', updated_at = NOW() 
         WHERE id = $1`,
        [quotationId]
      );

      // Update package status to awarded
      await query(
        `UPDATE project_packages 
         SET status = 'awarded', updated_at = NOW() 
         WHERE id = $1`,
        [packageId]
      );

      // Invalidate/Reject all other pending bids for this package
      await query(
        `UPDATE quotations 
         SET status = 'rejected', updated_at = NOW() 
         WHERE package_id = $1 AND id != $2 AND status = 'pending'`,
        [packageId, quotationId]
      );

      await query('COMMIT');
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }
}
export default ApplicationRepository;
