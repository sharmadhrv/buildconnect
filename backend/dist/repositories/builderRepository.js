"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderRepository = void 0;
const db_1 = require("../config/db");
const profileScoringService_1 = require("../services/profileScoringService");
class BuilderRepository {
    // Get Builder profile joined with User email
    static async getProfile(builderId) {
        const result = await (0, db_1.query)(`SELECT b.*, u.email, u.is_email_verified 
       FROM builders b
       JOIN users u ON b.id = u.id
       WHERE b.id = $1 LIMIT 1`, [builderId]);
        return result.rows[0] || null;
    }
    // Update Builder profile and automatically recalculate scores
    static async updateProfile(builderId, profileData) {
        // 1. Fetch current profile
        const current = await this.getProfile(builderId);
        if (!current)
            throw new Error('Builder profile not found.');
        // 2. Merge values
        const merged = { ...current, ...profileData };
        // 3. Recalculate scores
        const trustScore = profileScoringService_1.ProfileScoringService.calculateBuilderTrustScore(merged);
        const aiScore = profileScoringService_1.ProfileScoringService.calculateBuilderAiScore(merged);
        // 4. Update DB
        const result = await (0, db_1.query)(`UPDATE builders 
       SET company_name = $1, 
           company_reg_no = $2, 
           gst_no = $3, 
           pan_no = $4, 
           website = $5, 
           logo_url = $6, 
           address = $7,
           trust_score = $8,
           ai_profile_score = $9,
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`, [
            merged.company_name,
            merged.company_reg_no,
            merged.gst_no,
            merged.pan_no,
            merged.website,
            merged.logo_url,
            merged.address,
            trustScore,
            aiScore,
            builderId
        ]);
        return result.rows[0];
    }
    // Submit profile verification documents (wrapped in a Postgres transaction)
    static async submitVerification(builderId, verificationData) {
        // We execute inside a transaction client
        // Since we are using pool.query directly, we can run BEGIN/COMMIT
        await (0, db_1.query)('BEGIN');
        try {
            // 1. Fetch current profile
            const currentRes = await (0, db_1.query)('SELECT * FROM builders WHERE id = $1', [builderId]);
            const current = currentRes.rows[0];
            if (!current)
                throw new Error('Builder profile not found.');
            const merged = {
                ...current,
                company_reg_no: verificationData.company_reg_no || current.company_reg_no,
                gst_no: verificationData.gst_no || current.gst_no,
                pan_no: verificationData.pan_no || current.pan_no,
                verification_status: 'pending' // Transition back to pending review
            };
            const trustScore = profileScoringService_1.ProfileScoringService.calculateBuilderTrustScore(merged);
            const aiScore = profileScoringService_1.ProfileScoringService.calculateBuilderAiScore(merged);
            // 2. Update Builder Details
            await (0, db_1.query)(`UPDATE builders 
         SET company_reg_no = $1,
             gst_no = $2,
             pan_no = $3,
             verification_status = 'pending',
             trust_score = $4,
             ai_profile_score = $5,
             updated_at = NOW()
         WHERE id = $6`, [
                merged.company_reg_no,
                merged.gst_no,
                merged.pan_no,
                trustScore,
                aiScore,
                builderId
            ]);
            // 3. Delete older documents of type verification to replace them
            await (0, db_1.query)("DELETE FROM documents WHERE entity_type = 'builder' AND entity_id = $1", [builderId]);
            // 4. Insert new documents
            for (const doc of verificationData.documents) {
                await (0, db_1.query)(`INSERT INTO documents (entity_type, entity_id, file_name, file_url, file_type) 
           VALUES ('builder', $1, $2, $3, $4)`, [builderId, doc.name, doc.url, doc.type]);
            }
            await (0, db_1.query)('COMMIT');
            return await this.getProfile(builderId);
        }
        catch (error) {
            await (0, db_1.query)('ROLLBACK');
            throw error;
        }
    }
    // Get Analytics Dashboard Counters
    static async getDashboardAnalytics(builderId) {
        // 1. Total projects posted by builder
        const projectsCountRes = await (0, db_1.query)('SELECT COUNT(*) FROM projects WHERE builder_id = $1', [builderId]);
        // 2. Active projects
        const activeProjectsRes = await (0, db_1.query)("SELECT COUNT(*) FROM projects WHERE builder_id = $1 AND status = 'published'", [builderId]);
        // 3. Draft projects
        const draftProjectsRes = await (0, db_1.query)("SELECT COUNT(*) FROM projects WHERE builder_id = $1 AND status = 'draft'", [builderId]);
        // 4. Applications received for their packages
        const appsCountRes = await (0, db_1.query)(`SELECT COUNT(q.*) 
       FROM quotations q
       JOIN project_packages pp ON q.package_id = pp.id
       JOIN projects p ON pp.project_id = p.id
       WHERE p.builder_id = $1 AND q.status = 'pending'`, [builderId]);
        // 5. Fetch score metrics
        const profile = await this.getProfile(builderId);
        return {
            totalProjects: parseInt(projectsCountRes.rows[0].count, 10),
            activeProjects: parseInt(activeProjectsRes.rows[0].count, 10),
            draftProjects: parseInt(draftProjectsRes.rows[0].count, 10),
            pendingApplications: parseInt(appsCountRes.rows[0].count, 10),
            trustScore: profile?.trust_score || 0.00,
            aiProfileScore: profile?.ai_profile_score || 0.00,
            verificationStatus: profile?.verification_status || 'pending',
        };
    }
}
exports.BuilderRepository = BuilderRepository;
exports.default = BuilderRepository;
