"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const db_1 = require("../config/db");
const profileScoringService_1 = require("../services/profileScoringService");
class AdminRepository {
    // Get list of all pending builder & contractor profiles awaiting verification
    static async getPendingVerifications() {
        const unionQuery = `
      SELECT id, 
             company_name as name, 
             pan_no, 
             company_reg_no as reg_no, 
             gst_no, 
             NULL as aadhaar_no, 
             website, 
             address, 
             verification_status, 
             'builder' as type, 
             created_at 
      FROM builders 
      WHERE verification_status = 'pending'
      
      UNION ALL
      
      SELECT id, 
             business_name as name, 
             pan_no, 
             business_reg_no as reg_no, 
             NULL as gst_no, 
             aadhaar_no, 
             website, 
             address, 
             verification_status, 
             'contractor' as type, 
             created_at 
      FROM contractors 
      WHERE verification_status = 'pending'
      
      ORDER BY created_at ASC
    `;
        const result = await (0, db_1.query)(unionQuery);
        const pendingList = result.rows;
        // Attach documents for each profile
        for (const item of pendingList) {
            const docsRes = await (0, db_1.query)(`SELECT file_name, file_url, file_type 
         FROM documents 
         WHERE entity_type = $1 AND entity_id = $2`, [item.type, item.id]);
            item.documents = docsRes.rows;
        }
        return pendingList;
    }
    // Approve or Reject profile (transactional)
    static async reviewVerification(entityType, entityId, action, remarks) {
        await (0, db_1.query)('BEGIN');
        try {
            const table = entityType === 'builder' ? 'builders' : 'contractors';
            const status = action === 'approve' ? 'approved' : 'rejected';
            const statusRemarks = action === 'reject' ? (remarks || 'Documents rejected.') : null;
            // 1. Update verification status
            await (0, db_1.query)(`UPDATE ${table} 
         SET verification_status = $1,
             status_remarks = $2,
             updated_at = NOW()
         WHERE id = $3`, [status, statusRemarks, entityId]);
            // 2. Fetch updated profile to recalculate trust score
            const profileRes = await (0, db_1.query)(`SELECT * FROM ${table} WHERE id = $1 LIMIT 1`, [entityId]);
            const profile = profileRes.rows[0];
            if (!profile)
                throw new Error(`${entityType} profile not found.`);
            let trustScore = 0;
            if (entityType === 'builder') {
                trustScore = profileScoringService_1.ProfileScoringService.calculateBuilderTrustScore(profile);
            }
            else {
                // Query contractor document names to verify licenses/insurance presence
                const docsRes = await (0, db_1.query)("SELECT file_name FROM documents WHERE entity_type = 'contractor' AND entity_id = $1", [entityId]);
                const docNames = docsRes.rows.map(d => d.file_name.toLowerCase());
                const hasLicense = docNames.some(name => name.includes('license'));
                const hasInsurance = docNames.some(name => name.includes('insurance'));
                const scoreInput = { ...profile, has_license: hasLicense, has_insurance: hasInsurance };
                trustScore = profileScoringService_1.ProfileScoringService.calculateContractorTrustScore(scoreInput);
            }
            // 3. Update trust score
            await (0, db_1.query)(`UPDATE ${table} SET trust_score = $1, updated_at = NOW() WHERE id = $2`, [trustScore, entityId]);
            await (0, db_1.query)('COMMIT');
            return { id: entityId, type: entityType, status, trustScore };
        }
        catch (error) {
            await (0, db_1.query)('ROLLBACK');
            throw error;
        }
    }
    // Get all platform users (builders and contractors)
    static async getAllUsers() {
        const sql = `
      SELECT u.id, u.email, u.role, u.is_suspended, u.created_at,
             COALESCE(b.company_name, c.business_name, 'Platform User') as name,
             COALESCE(b.verification_status, c.verification_status, 'approved') as verification_status
      FROM users u
      LEFT JOIN builders b ON b.id = u.id
      LEFT JOIN contractors c ON c.id = u.id
      ORDER BY u.created_at DESC
    `;
        const result = await (0, db_1.query)(sql);
        return result.rows;
    }
    // Get all posted ratings and reviews
    static async getAllReviews() {
        const sql = `
      SELECT r.id, r.project_id, r.rating, r.feedback, r.created_at,
             b.company_name as reviewer_name,
             c.business_name as reviewee_name
      FROM reviews r
      JOIN builders b ON r.reviewer_id = b.id
      JOIN contractors c ON r.reviewee_id = c.id
      ORDER BY r.created_at DESC
    `;
        const result = await (0, db_1.query)(sql);
        return result.rows;
    }
    // Toggle user suspension status and revoke tokens on suspension
    static async suspendUser(userId, isSuspended) {
        await (0, db_1.query)('BEGIN');
        try {
            await (0, db_1.query)('UPDATE users SET is_suspended = $1, updated_at = NOW() WHERE id = $2', [isSuspended, userId]);
            if (isSuspended) {
                // Force revoke refresh tokens immediately
                await (0, db_1.query)('UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1', [userId]);
            }
            await (0, db_1.query)('COMMIT');
            return { userId, is_suspended: isSuspended };
        }
        catch (error) {
            await (0, db_1.query)('ROLLBACK');
            throw error;
        }
    }
    // Admin delete offensive review (recalculates contractor scores)
    static async deleteReview(reviewId) {
        await (0, db_1.query)('BEGIN');
        try {
            // 1. Fetch review target
            const reviewRes = await (0, db_1.query)('SELECT reviewee_id FROM reviews WHERE id = $1 LIMIT 1', [reviewId]);
            const review = reviewRes.rows[0];
            if (!review) {
                throw new Error('Review record not found.');
            }
            const contractorId = review.reviewee_id;
            // 2. Delete review record
            await (0, db_1.query)('DELETE FROM reviews WHERE id = $1', [reviewId]);
            // 3. Recalculate contractor trust ratings and complete profiles
            const contractorRes = await (0, db_1.query)("SELECT * FROM contractors WHERE id = $1 LIMIT 1", [contractorId]);
            const contractor = contractorRes.rows[0];
            if (contractor) {
                const docsRes = await (0, db_1.query)("SELECT file_name FROM documents WHERE entity_type = 'contractor' AND entity_id = $1", [contractorId]);
                const docNames = docsRes.rows.map(d => d.file_name.toLowerCase());
                const hasLicense = docNames.some(name => name.includes('license'));
                const hasInsurance = docNames.some(name => name.includes('insurance'));
                const scoreInput = { ...contractor, has_license: hasLicense, has_insurance: hasInsurance };
                const trustScore = profileScoringService_1.ProfileScoringService.calculateContractorTrustScore(scoreInput);
                await (0, db_1.query)("UPDATE contractors SET trust_score = $1, updated_at = NOW() WHERE id = $2", [trustScore, contractorId]);
            }
            await (0, db_1.query)('COMMIT');
            return { id: reviewId, contractorId };
        }
        catch (error) {
            await (0, db_1.query)('ROLLBACK');
            throw error;
        }
    }
    // Force cancel package
    static async cancelPackage(packageId) {
        await (0, db_1.query)('BEGIN');
        try {
            // Update package status to cancelled
            await (0, db_1.query)("UPDATE project_packages SET status = 'cancelled', updated_at = NOW() WHERE id = $1", [packageId]);
            // Set associated pending bids to rejected
            await (0, db_1.query)("UPDATE quotations SET status = 'rejected', updated_at = NOW() WHERE package_id = $1 AND status = 'pending'", [packageId]);
            await (0, db_1.query)('COMMIT');
            return { packageId, status: 'cancelled' };
        }
        catch (error) {
            await (0, db_1.query)('ROLLBACK');
            throw error;
        }
    }
}
exports.AdminRepository = AdminRepository;
exports.default = AdminRepository;
