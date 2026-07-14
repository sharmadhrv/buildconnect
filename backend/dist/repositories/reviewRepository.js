"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const db_1 = require("../config/db");
const profileScoringService_1 = require("../services/profileScoringService");
class ReviewRepository {
    // Mark package completed and submit ratings review
    static async createReview(builderId, packageId, review) {
        await (0, db_1.query)('BEGIN');
        try {
            // 1. Fetch package detail and verify ownership/state
            const packageRes = await (0, db_1.query)(`SELECT pp.id, pp.status, pp.project_id, p.builder_id, q.contractor_id
         FROM project_packages pp
         JOIN projects p ON pp.project_id = p.id
         JOIN quotations q ON q.package_id = pp.id
         WHERE pp.id = $1 AND q.status = 'accepted' LIMIT 1`, [packageId]);
            const pkg = packageRes.rows[0];
            if (!pkg) {
                const err = new Error('Project package award reference not found.');
                err.statusCode = 404;
                throw err;
            }
            if (pkg.builder_id !== builderId) {
                const err = new Error('Forbidden. You do not own this project.');
                err.statusCode = 403;
                throw err;
            }
            if (pkg.status !== 'awarded') {
                const err = new Error('This package is not currently in progress (awarded status).');
                err.statusCode = 400;
                throw err;
            }
            const contractorId = pkg.contractor_id;
            const projectId = pkg.project_id;
            // 2. Mark package status = 'completed'
            await (0, db_1.query)("UPDATE project_packages SET status = 'completed', updated_at = NOW() WHERE id = $1", [packageId]);
            // 3. Increment contractor completed projects count
            await (0, db_1.query)("UPDATE contractors SET completed_projects_count = completed_projects_count + 1 WHERE id = $1", [contractorId]);
            // 4. Update contractor Win Success Rate
            await (0, db_1.query)(`UPDATE contractors 
         SET success_rate = (
           SELECT COUNT(*) FROM quotations WHERE contractor_id = $1 AND status = 'accepted'
         )::numeric / NULLIF(
           (SELECT COUNT(*) FROM quotations WHERE contractor_id = $1), 0
         ) * 100,
         updated_at = NOW()
         WHERE id = $1`, [contractorId]);
            // 5. Insert Review
            const reviewRes = await (0, db_1.query)(`INSERT INTO reviews (project_id, reviewer_id, reviewee_id, rating, feedback, ratings_breakdown) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`, [
                projectId,
                builderId,
                contractorId,
                review.rating,
                review.feedback || null,
                JSON.stringify(review.ratings_breakdown)
            ]);
            // 6. Recalculate contractor Trust Score & AI Score
            const contractorRes = await (0, db_1.query)("SELECT * FROM contractors WHERE id = $1 LIMIT 1", [contractorId]);
            const contractor = contractorRes.rows[0];
            const docsRes = await (0, db_1.query)("SELECT file_name FROM documents WHERE entity_type = 'contractor' AND entity_id = $1", [contractorId]);
            const docNames = docsRes.rows.map(d => d.file_name.toLowerCase());
            const hasLicense = docNames.some(name => name.includes('license'));
            const hasInsurance = docNames.some(name => name.includes('insurance'));
            const scoreInput = { ...contractor, has_license: hasLicense, has_insurance: hasInsurance };
            const trustScore = profileScoringService_1.ProfileScoringService.calculateContractorTrustScore(scoreInput);
            const skillsRes = await (0, db_1.query)("SELECT COUNT(*) FROM contractor_skills WHERE contractor_id = $1", [contractorId]);
            const skillsCount = parseInt(skillsRes.rows[0].count, 10);
            const categoriesRes = await (0, db_1.query)("SELECT COUNT(*) FROM contractor_categories WHERE contractor_id = $1", [contractorId]);
            const categoriesCount = parseInt(categoriesRes.rows[0].count, 10);
            const aiScore = profileScoringService_1.ProfileScoringService.calculateContractorAiScore(contractor, skillsCount, categoriesCount);
            await (0, db_1.query)("UPDATE contractors SET trust_score = $1, ai_profile_score = $2, updated_at = NOW() WHERE id = $3", [trustScore, aiScore, contractorId]);
            await (0, db_1.query)('COMMIT');
            return reviewRes.rows[0];
        }
        catch (error) {
            await (0, db_1.query)('ROLLBACK');
            throw error;
        }
    }
}
exports.ReviewRepository = ReviewRepository;
exports.default = ReviewRepository;
